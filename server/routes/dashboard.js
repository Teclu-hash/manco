const express = require('express')
const router = express.Router()

const { Student, Application, AssistanceRecord, School, StudentSubmission, User, Requirement, Sequelize } = require('../models')
const { Op } = Sequelize

const change = (current, previous) => previous === 0 ? null : Math.round(((current - previous) / previous) * 100)

router.get('/stats', async (req, res) => {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const monthly = async (Model, where = {}) => {
    const current = await Model.count({ where: { ...where, createdAt: { [Op.gte]: thisMonth } } })
    const previous = await Model.count({ where: { ...where, createdAt: { [Op.gte]: lastMonth, [Op.lt]: thisMonth } } })
    return change(current, previous)
  }

  try {
    const [studentAccounts, submissions, requirements, applications, releasedAssistance, releasedThisMonth, releasedLastMonth] = await Promise.all([
      User.count({ where: { role: 'Student' } }),
      StudentSubmission.findAll({ attributes: ['user_id', 'requirement_id', 'status', 'createdAt'], order: [['createdAt', 'DESC']] }),
      Requirement.findAll({ attributes: ['requirement_id'] }),
      Application.findAll({ attributes: ['user_id', 'status'] }),
      AssistanceRecord.sum('amount', { where: { payout_result: 'Received' } }),
      AssistanceRecord.sum('amount', { where: { payout_result: 'Received', outcome_date: { [Op.gte]: thisMonth } } }),
      AssistanceRecord.sum('amount', { where: { payout_result: 'Received', outcome_date: { [Op.gte]: lastMonth, [Op.lt]: thisMonth } } })
    ])

    // Count people/accounts, not uploaded document rows. The newest upload for each
    // requirement is the one that determines its current review state.
    const byUser = new Map()
    for (const row of submissions) {
      const uid = String(row.user_id)
      if (!byUser.has(uid)) byUser.set(uid, new Map())
      const docs = byUser.get(uid)
      const rid = String(row.requirement_id)
      if (!docs.has(rid)) docs.set(rid, row)
    }
    const requiredIds = requirements.map(r => String(r.requirement_id))
    let pendingApplicants = 0
    let approvedApplicants = 0
    for (const docs of byUser.values()) {
      const latest = [...docs.values()]
      if (latest.some(d => ['Submitted', 'Pending', 'Needs Revision'].includes(d.status))) pendingApplicants++
      if (requiredIds.length > 0 && requiredIds.every(id => docs.get(id)?.status === 'Accepted')) approvedApplicants++
    }

    const submittedUsers = new Set(submissions.map(s => String(s.user_id)))
    const totalStudents = Math.max(studentAccounts, submittedUsers.size)
    const submittedRequirements = submittedUsers.size
    const hasSubmissionWorkflow = submissions.length > 0
    const pendingApplications = hasSubmissionWorkflow ? pendingApplicants : await Application.count({ where: { status: 'Pending' } })
    const approvedApplications = hasSubmissionWorkflow ? approvedApplicants : await Application.count({ where: { status: 'Approved' } })

    res.json({
      totalStudents, pendingApplications, approvedApplications,
      submittedRequirements,
      releasedAssistance: Number(releasedAssistance || 0),
      change: {
        totalStudents: await monthly(User, { role: 'Student' }),
        pendingApplications: await monthly(Application, { status: 'Pending' }),
        approvedApplications: await monthly(Application, { status: 'Approved' }),
        releasedAssistance: change(Number(releasedThisMonth || 0), Number(releasedLastMonth || 0))
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ message: 'An error occurred while fetching dashboard data' })
  }
})

router.get('/recent-submissions', async (req, res) => {
  try {
    const rows = await StudentSubmission.findAll({
      attributes: ['submission_id', 'user_id', 'file_name', 'status', 'createdAt'],
      include: [
        { model: User, attributes: ['username'] },
        { model: Requirement, attributes: ['requirement_name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 8
    })
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch recent requirement submissions' })
  }
})

// The dashboard's recent applicants are based on actual student submissions,
// since the submission workflow does not necessarily create an Application row.
router.get('/recent', async (req, res) => {
  try {
    const rows = await StudentSubmission.findAll({
      attributes: ['submission_id', 'user_id', 'createdAt', 'status'],
      include: [{ model: User, attributes: ['username'] }],
      order: [['createdAt', 'DESC']],
      limit: 30
    })
    const seen = new Set()
    const recent = rows.filter(row => {
      const key = String(row.user_id)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 8)
    res.json(recent)
  } catch (error) {
    console.error('Recent applicants error:', error)
    res.status(500).json({ message: 'An error occurred while fetching recent applicants' })
  }
})

module.exports = router
