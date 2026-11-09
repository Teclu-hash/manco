import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Table, Spinner, Alert } from 'react-bootstrap'
import { FiUsers, FiFileText, FiCheckCircle, FiCalendar } from 'react-icons/fi'
import api, { errorMessage } from '../api'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { formatDate } from '../utils'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [recentSubmissions, setRecentSubmissions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r, submissions] = await Promise.all([api.get('/dashboard/stats'), api.get('/dashboard/recent'), api.get('/dashboard/recent-submissions')])
        setStats(s.data)
        setRecent(r.data)
        setRecentSubmissions(submissions.data)
      } catch (err) {
        setError(errorMessage(err))
      }
    }
    load()
  }, [])

  if (error) return <Alert variant="danger">{error}</Alert>
  if (!stats) return <Spinner />

  const todayLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Welcome to the LGU Student Assistance Management System">
        <span className="date-chip"><FiCalendar /> {todayLabel}</span>
      </PageHeader>

      <div className="stat-grid">
        <StatCard color="blue" icon={<FiUsers />} label="Total Students"
          value={stats.totalStudents} />
        <StatCard color="yellow" icon={<FiFileText />} label="Pending Applications"
          value={stats.pendingApplications} />
        <StatCard color="green" icon={<FiCheckCircle />} label="Approved Applications"
          value={stats.approvedApplications} />
        <StatCard color="blue" icon={<FiFileText />} label="Requirements Submitted"
          value={stats.submittedRequirements || 0} />
      </div>

      <div className="panel">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Recent Applicants</h4>
          <Link to="/applications" className="btn btn-lgu"><FiFileText className="me-2" />View All Applications</Link>
        </div>

        <Table responsive hover className="lgu-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student Account</th>
              <th>Date Applied</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr><td colSpan="4" className="text-center text-muted py-4">No applicants yet</td></tr>
            )}
            {recent.map((a, i) => (
              <tr key={a.submission_id}>
                <td>{i + 1}</td>
                <td>{a.User?.username || `Student account #${a.user_id}`}</td>
                <td>{formatDate(a.createdAt)}</td>
                <td><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="panel mt-4">
        <h4 className="mb-3">Recent Requirement Submissions</h4>
        <Table responsive hover className="lgu-table">
          <thead><tr><th>Student Account</th><th>Requirement</th><th>File</th><th>Date Submitted</th><th>Status</th></tr></thead>
          <tbody>
            {recentSubmissions.length === 0 && <tr><td colSpan="5" className="text-center text-muted py-4">No requirement submissions yet</td></tr>}
            {recentSubmissions.map(row => <tr key={row.submission_id}>
              <td>{row.User?.username || 'Student'}</td>
              <td>{row.Requirement?.requirement_name || 'Requirement'}</td>
              <td>{row.file_name}</td>
              <td>{formatDate(row.createdAt)}</td>
              <td><StatusBadge status={row.status} /></td>
            </tr>)}
          </tbody>
        </Table>
      </div>
    </>
  )
}

export default Dashboard
