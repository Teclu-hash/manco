import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Form, Spinner, Table } from 'react-bootstrap'
import { FiUpload, FiFileText } from 'react-icons/fi'
import api, { errorMessage } from '../api'
import { getUser } from '../auth'
import PageHeader from '../components/PageHeader'
import { formatDate } from '../utils'

const StudentSubmissions = () => {
  const [requirements, setRequirements] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [form, setForm] = useState({ requirement_id: '', remarks: '', file: null })
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    const [r, s] = await Promise.all([
      api.get('/requirement'),
      api.get('/student-submission', { params: { user_id: getUser()?.user_id } })
    ])
    setRequirements(r.data)
    setSubmissions(s.data)
  }
  useEffect(() => {
    load().catch(err => setError(errorMessage(err))).finally(() => setLoading(false))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.file) return setError('Please choose a document to upload.')
    if (form.file.size > 5 * 1024 * 1024) return setError('The file must not exceed 5 MB.')
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(form.file.type)) {
      return setError('Only PDF, JPG, and PNG files are accepted.')
    }
    setSending(true); setError(''); setSuccess('')
    try {
      const file_data = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(form.file)
      })
      await api.post('/student-submission/new', {
        user_id: getUser()?.user_id, requirement_id: form.requirement_id,
        file_name: form.file.name, mime_type: form.file.type, file_data, remarks: form.remarks
      })
      setForm({ requirement_id: '', remarks: '', file: null })
      const fileInput = document.getElementById('student-requirement-file')
      if (fileInput) fileInput.value = ''
      await load()
      setSuccess('Your requirement has been submitted successfully.')
    } catch (err) { setError(errorMessage(err)) }
    finally { setSending(false) }
  }

  return <>
    <PageHeader title="Submit Requirements" subtitle="Upload the documents requested by the LGU and track their review status" />
    {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
    {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
    {loading ? <div className="text-center py-5"><Spinner /></div> : <>
      <div className="panel mb-4">
        <h4 className="mb-3"><FiUpload className="me-2" />Upload a Requirement</h4>
        <p className="text-muted">Accepted formats: PDF, JPG, PNG. Maximum file size: 5 MB.</p>
        <Form onSubmit={submit}>
          <Form.Group className="mb-3">
            <Form.Label>Requirement</Form.Label>
            <Form.Select required value={form.requirement_id} onChange={e => setForm({ ...form, requirement_id: e.target.value })}>
              <option value="">Choose a requirement</option>
              {requirements.map(r => {
                const expired = r.deadline && new Date().toISOString().slice(0, 10) > r.deadline
                return <option key={r.requirement_id} value={r.requirement_id} disabled={expired}>
                  {r.requirement_name}{r.deadline ? ` — Due ${r.deadline}` : ''}{expired ? ' (Closed)' : ''}
                </option>
              })}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Document</Form.Label>
            <Form.Control id="student-requirement-file" type="file" accept=".pdf,.jpg,.jpeg,.png" required
              onChange={e => setForm({ ...form, file: e.target.files?.[0] || null })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Remarks (optional)</Form.Label>
            <Form.Control as="textarea" rows={2} value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
          </Form.Group>
          <Button type="submit" className="btn-lgu" disabled={sending || requirements.length === 0}>
            {sending ? 'Submitting...' : 'Submit Requirement'}
          </Button>
        </Form>
      </div>
      <div className="panel">
        <h4 className="mb-3"><FiFileText className="me-2" />My Submitted Requirements</h4>
        <Table responsive hover className="lgu-table">
          <thead><tr><th>Requirement</th><th>Deadline</th><th>File</th><th>Date Submitted</th><th>Status</th><th>Admin Remarks</th></tr></thead>
          <tbody>
            {submissions.length === 0 && <tr><td colSpan="6" className="text-center text-muted py-4">You have not submitted any requirements yet.</td></tr>}
            {submissions.map(item => <tr key={item.submission_id}>
              <td>{item.Requirement?.requirement_name}</td><td>{item.Requirement?.deadline || 'No deadline'}</td><td>{item.file_name}</td>
              <td>{formatDate(item.createdAt)}</td>
              <td><Badge bg={item.status === 'Accepted' ? 'success' : item.status === 'Denied' ? 'danger' : item.status === 'Needs Revision' ? 'warning' : 'info'}>{item.status}</Badge></td>
              <td>{item.admin_remarks || '—'}</td>
            </tr>)}
          </tbody>
        </Table>
      </div>
    </>}
  </>
}
export default StudentSubmissions
