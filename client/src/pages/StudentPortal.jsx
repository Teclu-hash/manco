import { useEffect, useState } from 'react'
import { Alert, Spinner, Table } from 'react-bootstrap'
import { FiCalendar, FiFileText } from 'react-icons/fi'
import api, { errorMessage } from '../api'
import PageHeader from '../components/PageHeader'
import { formatDate } from '../utils'

const StudentPortal = () => {
  const [requirements, setRequirements] = useState([])
  const [dates, setDates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/requirement'), api.get('/assistance-record/release-dates')])
      .then(([r, d]) => { setRequirements(r.data); setDates(d.data) })
      .catch(err => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  return <>
    <PageHeader title="Student Portal" subtitle="View posted requirements and cash assistance release information" />
    {error && <Alert variant="danger">{error}</Alert>}
    {loading ? <div className="text-center py-5"><Spinner /></div> : <>
      <div className="panel mb-4">
        <h4 className="mb-3"><FiCalendar className="me-2" />Cash Assistance Release Locations</h4>
        <Table responsive hover className="lgu-table">
          <thead><tr><th>Release Date</th><th>Amount</th><th>Location</th><th>Instructions</th><th>Status</th></tr></thead>
          <tbody>
            {dates.length === 0 && <tr><td colSpan="5" className="text-center text-muted py-4">No cash assistance release schedules have been posted yet.</td></tr>}
            {dates.map(item => <tr key={item.assistance_id}>
              <td>{formatDate(item.release_date)}</td><td>₱{Number(item.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td><td>{item.release_location || 'To be announced'}</td>
              <td>{item.release_instructions || '—'}</td><td>{item.status}</td>
            </tr>)}
          </tbody>
        </Table>
      </div>
      <div className="panel">
        <h4 className="mb-3"><FiFileText className="me-2" />Posted Requirements</h4>
        <Table responsive hover className="lgu-table">
          <thead><tr><th>Requirement</th><th>Description</th><th>Submission Deadline</th></tr></thead>
          <tbody>
            {requirements.map(item => <tr key={item.requirement_id}><td>{item.requirement_name}</td><td>{item.description || '—'}</td><td>{item.deadline ? formatDate(item.deadline) : 'No deadline'}</td></tr>)}
            {requirements.length === 0 && <tr><td colSpan="3" className="text-center text-muted py-4">No requirements have been posted yet.</td></tr>}
          </tbody>
        </Table>
      </div>
    </>}
  </>
}
export default StudentPortal
