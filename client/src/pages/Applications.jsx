import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap'
import { FiEye } from 'react-icons/fi'
import api, { errorMessage } from '../api'
import { formatDate } from '../utils'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'

const Applications = () => {
  const [applications, setApplications] = useState([])
  const [requirements, setRequirements] = useState([])
  const [submittedDocuments, setSubmittedDocuments] = useState([])
  const [preview, setPreview] = useState(null)
  const [selectedSubmissionAccount, setSelectedSubmissionAccount] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [error, setError] = useState('')

  const [reviewTarget, setReviewTarget] = useState(null)
  const [reviewStatus, setReviewStatus] = useState('Accepted')
  const [reviewRemarks, setReviewRemarks] = useState('')
  const [reviewSaving, setReviewSaving] = useState(false)

  //change this number to load the list again
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
          const [ap, docs, reqs] = await Promise.all([api.get('/application'), api.get('/student-submission'), api.get('/requirement')])
          setApplications(Array.isArray(ap.data) ? ap.data : [])
          setRequirements(Array.isArray(reqs.data) ? reqs.data : [])
          setSubmittedDocuments(Array.isArray(docs.data) ? docs.data : [])
      } catch (err) {
        setError(errorMessage(err))
      }
    }
    load()
  }, [reload])

  const openReview = (document, status) => { setReviewTarget(document); setReviewStatus(status); setReviewRemarks(document.admin_remarks || '') }
  const saveDocumentReview = async () => {
    if (!reviewTarget || reviewSaving) return
    setReviewSaving(true); setError('')
    try {
      const response = await api.put(`/student-submission/${reviewTarget.submission_id}/review`, { status: reviewStatus, admin_remarks: reviewRemarks })
      if (response.data?.application_status) {
        setApplications(current => current.map(app =>
          Number(app.user_id) === Number(reviewTarget.user_id)
            ? { ...app, status: response.data.application_status }
            : app
        ))
      }
      const updated = { ...reviewTarget, status: reviewStatus, admin_remarks: reviewRemarks }
      setSubmittedDocuments(current => current.map(doc => doc.submission_id === updated.submission_id ? updated : doc))
      setSelectedSubmissionAccount(current => current ? ({ ...current, documents: current.documents.map(doc => doc.submission_id === updated.submission_id ? updated : doc) }) : current)
      setReviewTarget(null)
    } catch (err) { setError(errorMessage(err)) } finally { setReviewSaving(false) }
  }

  const submittedStudentAccounts = Object.values(submittedDocuments.reduce((groups, doc) => {
    const key = String(doc.user_id)
    if (!groups[key]) {
      groups[key] = {
        user_id: doc.user_id,
        username: doc.User?.username || `Student account #${doc.user_id}`,
        documents: []
      }
    }
    groups[key].documents.push(doc)
    return groups
  }, {}))

  const eligibleApplications = submittedStudentAccounts.filter(account => {
    if (!requirements.length) return false
    return requirements.every(req => {
      const latest = account.documents
        .filter(doc => Number(doc.requirement_id) === Number(req.requirement_id))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
      return latest?.status === 'Accepted'
    })
  }).map(account => {
    const linkedApplication = applications.find(app => Number(app.user_id) === Number(account.user_id))
    return linkedApplication || {
      application_id: null,
      student_id: null,
      user_id: account.user_id,
      application_number: 'Pending assignment',
      Student: { student_name: account.username },
      User: { username: account.username }
    }
  })

  const openDocumentPreview = async (document) => {
    setPreviewLoading(true)
    try {
      const response = await api.get(`/student-submission/${document.submission_id}/file?inline=1`, {
        responseType: 'blob'
      })
      const url = URL.createObjectURL(response.data)
      setPreview({ url, mime_type: document.mime_type, file_name: document.file_name })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setPreviewLoading(false)
    }
  }

  const closeDocumentPreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url)
    setPreview(null)
  }

  return (
    <>
      <PageHeader title="Applications" subtitle="Review student-submitted assistance applications" />

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <div className="panel mb-4">
        <h5 className="mb-3">Students Who Submitted Requirements</h5>
        <p className="text-muted small">Select a student account to see every requirement document they submitted.</p>
        <Table responsive hover className="lgu-table">
          <thead><tr><th>Student Account</th><th>Requirements Submitted</th><th>Latest Submission</th><th>Action</th></tr></thead>
          <tbody>
            {submittedStudentAccounts.length === 0 && (
              <tr><td colSpan="4" className="text-center text-muted py-4">No student requirement submissions yet.</td></tr>
            )}
            {submittedStudentAccounts.map(account => (
              <tr key={account.user_id}>
                <td>
                  <Button variant="link" className="p-0 text-decoration-none"
                    onClick={() => setSelectedSubmissionAccount(account)}>{account.username}</Button>
                </td>
                <td>{account.documents.length}</td>
                <td>{formatDate(account.documents[0]?.createdAt)}</td>
                <td><Button size="sm" variant="outline-primary"
                  onClick={() => setSelectedSubmissionAccount(account)}>View Requirements</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="panel mb-4">
        <h5 className="mb-2">Applicants Ready for Cash Assistance</h5>
        <p className="text-muted small">Students appear here when every posted requirement has been accepted. Application numbers are generated automatically when a student first submits a requirement. Manage cash assistance schedules in Assistance Records.</p>
        <Table responsive hover className="lgu-table">
          <thead><tr><th>Student Account</th><th>Application No.</th><th>Requirements</th><th>Application Status</th></tr></thead>
          <tbody>
            {eligibleApplications.length === 0 && <tr><td colSpan="4" className="text-center text-muted py-3">No student has had all posted requirements accepted yet.</td></tr>}
            {eligibleApplications.map(app => <tr key={app.application_id || app.user_id}>
              <td>{app.Student?.student_name || app.User?.username}</td>
              <td>{app.application_number}</td>
              <td><StatusBadge status="All Accepted" /></td>
              <td><StatusBadge status={app.status || 'Approved'} /></td>
            </tr>)}
          </tbody>
        </Table>
      </div>

      <Modal show={!!selectedSubmissionAccount} onHide={() => setSelectedSubmissionAccount(null)} centered size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Requirements Submitted by {selectedSubmissionAccount?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive hover className="lgu-table">
            <thead><tr><th>Requirement</th><th>File</th><th>Date Submitted</th><th>Status</th><th>Document</th><th>Review Action</th></tr></thead>
            <tbody>
              {selectedSubmissionAccount?.documents.map(doc => (
                <tr key={doc.submission_id}>
                  <td>{doc.Requirement?.requirement_name || 'Requirement'}</td>
                  <td>{doc.file_name}</td>
                  <td>{formatDate(doc.createdAt)}</td>
                  <td><StatusBadge status={doc.status} /></td>
                  <td>
                    <Button size="sm" variant="outline-primary" disabled={previewLoading}
                      onClick={() => openDocumentPreview(doc)}>
                      <FiEye className="me-1" />Preview
                    </Button>
                  </td>
                  <td><div className="d-flex flex-wrap gap-1">
                    <Button size="sm" variant="success" onClick={() => openReview(doc, 'Accepted')}>Accept</Button>
                    <Button size="sm" variant="outline-danger" onClick={() => openReview(doc, 'Denied')}>Deny</Button>
                    <Button size="sm" variant="outline-warning" onClick={() => openReview(doc, 'Needs Revision')}>Request Revision</Button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </Table>
          {selectedSubmissionAccount?.documents.some(doc => doc.remarks) && (
            <div className="mt-3">
              <strong>Student Remarks</strong>
              {selectedSubmissionAccount.documents.filter(doc => doc.remarks).map(doc => (
                <p key={doc.submission_id} className="mb-1">
                  {doc.Requirement?.requirement_name}: {doc.remarks}
                </p>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={!!reviewTarget} onHide={() => setReviewTarget(null)} centered>
        <Modal.Header closeButton><Modal.Title>Review Requirement Document</Modal.Title></Modal.Header>
        <Modal.Body>
          <p><strong>File:</strong> {reviewTarget?.file_name}</p>
          <Form.Group className="mb-3"><Form.Label>Decision</Form.Label>
            <Form.Select value={reviewStatus} onChange={e => setReviewStatus(e.target.value)}>
              <option value="Accepted">Accept</option><option value="Denied">Deny</option><option value="Needs Revision">Request Revision</option>
            </Form.Select>
          </Form.Group>
          <Form.Group><Form.Label>Admin Remarks (visible to student)</Form.Label>
            <Form.Control as="textarea" rows={3} value={reviewRemarks} onChange={e => setReviewRemarks(e.target.value)} placeholder="Explain the decision or what needs to be corrected..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setReviewTarget(null)}>Cancel</Button>
          <Button variant="primary" disabled={reviewSaving} onClick={saveDocumentReview}>{reviewSaving ? 'Saving...' : 'Save Review'}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!preview} onHide={closeDocumentPreview} centered size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{preview?.file_name || 'Document Preview'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ minHeight: '70vh' }}>
          {preview?.mime_type === 'application/pdf' ? (
            <iframe title="Requirement document preview" src={preview.url}
              style={{ width: '100%', height: '68vh', border: 0 }} />
          ) : preview?.mime_type?.startsWith('image/') ? (
            <div className="text-center">
              <img src={preview.url} alt={preview.file_name}
                style={{ maxWidth: '100%', maxHeight: '68vh', objectFit: 'contain' }} />
            </div>
          ) : <Alert variant="warning">This file type cannot be previewed in the browser.</Alert>}
        </Modal.Body>
      </Modal>

    </>
  )
}

export default Applications
