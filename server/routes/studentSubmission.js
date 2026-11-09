const express = require('express')
const router = express.Router()
const { StudentSubmission, User, Requirement, Application, Sequelize } = require('../models')
const { Op } = Sequelize

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

const ensureApplicationForUser = async (user_id) => {
  let application = await Application.findOne({
    where: { user_id },
    order: [['application_id', 'ASC']]
  })
  if (application) return application

  const year = new Date().getFullYear()
  const lastId = await Application.max('application_id') || 0
  const application_number = String(lastId + 1)
  return Application.create({
    user_id,
    student_id: null,
    application_number,
    academic_year: `${year}-${year + 1}`,
    date_applied: new Date().toISOString().slice(0, 10),
    status: 'Pending'
  })
}

// Students see only their own submissions. Admins can see all submissions.
router.get('/', async (req, res) => {
  try {
    const where = req.query.user_id ? { user_id: req.query.user_id } : {}
    const rows = await StudentSubmission.findAll({
      where,
      attributes: ['submission_id', 'user_id', 'requirement_id', 'file_name', 'mime_type', 'remarks', 'status', 'admin_remarks', 'createdAt'],
      include: [
        { model: User, attributes: ['username'] },
        { model: Requirement, attributes: ['requirement_name', 'description'] }
      ],
      order: [['createdAt', 'DESC']]
    })
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Unable to retrieve requirement submissions' })
  }
})

router.post('/new', async (req, res) => {
  const { user_id, requirement_id, file_name, mime_type, file_data, remarks } = req.body
  if (!user_id || !requirement_id || !file_name || !mime_type || !file_data) {
    return res.status(400).json({ message: 'Please select a requirement and attach a document' })
  }
  if (!ALLOWED_TYPES.includes(mime_type)) {
    return res.status(400).json({ message: 'Only PDF, JPG, and PNG files are allowed' })
  }
  const base64 = String(file_data).replace(/^data:[^;]+;base64,/, '')
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64) || Buffer.from(base64, 'base64').length > MAX_FILE_SIZE) {
    return res.status(400).json({ message: 'File is invalid or exceeds the 5 MB limit' })
  }
  try {
    const requirement = await Requirement.findByPk(requirement_id)
    if (!requirement) return res.status(404).json({ message: 'Requirement not found' })
    if (requirement.deadline && new Date().toISOString().slice(0, 10) > requirement.deadline) {
      return res.status(400).json({ message: `Submission deadline for this requirement was ${requirement.deadline}. Uploads are closed.` })
    }
    // Automatically create the student's application on their first requirement upload.
    await ensureApplicationForUser(user_id)

    const submission = await StudentSubmission.create({
      user_id, requirement_id, file_name: String(file_name).slice(0, 255),
      mime_type, file_data: base64, remarks: remarks || '', status: 'Submitted'
    })
    res.status(201).json({ message: 'Requirement submitted successfully', submission_id: submission.submission_id })
  } catch (error) {
    res.status(500).json({ message: 'Unable to submit requirement' })
  }
})

// Admin review action
router.put('/:id/review', async (req, res) => {
  const { status, admin_remarks } = req.body
  if (!['Accepted', 'Denied', 'Needs Revision'].includes(status)) {
    return res.status(400).json({ message: 'Invalid review status' })
  }
  try {
    const submission = await StudentSubmission.findByPk(req.params.id)
    if (!submission) return res.status(404).json({ message: 'Submission not found' })
    await submission.update({ status, admin_remarks: admin_remarks || '' })

    // Recalculate the applicant decision from the latest submission per requirement.
    const required = await Requirement.findAll({ attributes: ['requirement_id'] })
    const latestRows = await StudentSubmission.findAll({
      where: { user_id: submission.user_id },
      order: [['createdAt', 'DESC'], ['submission_id', 'DESC']]
    })
    const latestByRequirement = new Map()
    for (const row of latestRows) {
      const key = String(row.requirement_id)
      if (!latestByRequirement.has(key)) latestByRequirement.set(key, row)
    }
    const allAccepted = required.length > 0 && required.every(r => latestByRequirement.get(String(r.requirement_id))?.status === 'Accepted')
    const applicationStatus = allAccepted ? 'Approved' : 'Pending'
    // Also create an application for older accounts that submitted before this fix.
    await ensureApplicationForUser(submission.user_id)
    await Application.update(
      { status: applicationStatus },
      { where: { user_id: submission.user_id, status: { [Op.notIn]: ['Denied', 'Rejected'] } } }
    )
    res.json({ message: 'Submission review saved', application_status: applicationStatus })
  } catch (error) {
    res.status(500).json({ message: 'Unable to review submission' })
  }
})

// Download/view a submitted file
router.get('/:id/file', async (req, res) => {
  try {
    const submission = await StudentSubmission.findByPk(req.params.id, {
      attributes: ['file_name', 'mime_type', 'file_data']
    })
    if (!submission) return res.status(404).json({ message: 'File not found' })
    const data = Buffer.from(submission.file_data, 'base64')
    res.setHeader('Content-Type', submission.mime_type)
    const safeName = submission.file_name.replace(/["\\\\\r\n]/g, '')
    const disposition = req.query.inline === '1' ? 'inline' : 'attachment'
    res.setHeader('Content-Disposition', `${disposition}; filename="${safeName}"`)
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.send(data)
  } catch (error) {
    res.status(500).json({ message: 'Unable to retrieve submitted file' })
  }
})

module.exports = router
