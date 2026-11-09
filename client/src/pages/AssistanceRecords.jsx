import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Alert, InputGroup, Row, Col } from 'react-bootstrap'
import { FiPlus, FiSearch } from 'react-icons/fi'
import api, { errorMessage } from '../api'
import { money, formatDate } from '../utils'
import PageHeader from '../components/PageHeader'
import Pager from '../components/Pager'
import RowActions from '../components/RowActions'
import StatusBadge from '../components/StatusBadge'
import ConfirmDelete from '../components/ConfirmDelete'

const AssistanceRecords = () => {
  const [records, setRecords] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ amount: '2000', release_date: '', release_location: '', release_instructions: '' })
  const [viewing, setViewing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const [re] = await Promise.all([api.get('/assistance-record')])
        setRecords(re.data)
      } catch (err) { setError(errorMessage(err)) }
    }
    load()
  }, [reload])

  const filtered = records.filter(r =>
    `${r.reference_number || ''}`
      .toLowerCase().includes(search.toLowerCase())
  )
  const rows = filtered.slice((page - 1) * 5, page * 5)

  const openAdd = () => {
    setEditId(null)
    setForm({ amount: '2000', release_date: '', release_location: '', release_instructions: '' })
    setError('')
    setShowForm(true)
  }

  const openEdit = r => {
    setEditId(r.assistance_id)
    setForm({
      amount: r.amount, release_date: r.release_date ? String(r.release_date).slice(0, 10) : '',
      release_location: r.release_location || '', release_instructions: r.release_instructions || ''
    })
    setError('')
    setShowForm(true)
  }

  const handleSave = async e => {
    e.preventDefault()
    const data = { ...form }
    try {
      if (editId) await api.put(`/assistance-record/${editId}`, data)
      else await api.post('/assistance-record/new', data)
      setShowForm(false)
      setReload(v => v + 1)
    } catch (err) { setError(errorMessage(err)) }
  }

  const markAsReceived = async (record) => {
    if (!window.confirm(`Confirm that this assistance payout of ${money(record.amount)} was received?`)) return
    try {
      await api.patch(`/assistance-record/${record.assistance_id}/received`)
      setReload(v => v + 1)
    } catch (err) { setError(errorMessage(err)) }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/assistance-record/${toDelete.assistance_id}`)
      setToDelete(null)
      setReload(v => v + 1)
    } catch (err) {
      setToDelete(null)
      setError(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader title="Assistance Records" subtitle="Schedule cash assistance payouts and record student receipt">
        <Button className="btn-lgu" onClick={openAdd}><FiPlus className="me-2" />Schedule Payout</Button>
      </PageHeader>
      {error && !showForm && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      <div className="panel">
        <InputGroup className="search-box mb-3">
          <InputGroup.Text><FiSearch /></InputGroup.Text>
          <Form.Control placeholder="Search by reference number..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </InputGroup>
        <Table responsive hover className="lgu-table">
          <thead><tr>
            <th>#</th><th>Amount</th>
            <th>Scheduled Release</th><th>Location</th><th>Schedule Status</th>
            <th>Cash Received?</th><th>Outcome Date</th><th>Action</th>
          </tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="8" className="text-center text-muted py-4">No assistance records found</td></tr>}
            {rows.map((r, i) => (
              <tr key={r.assistance_id}>
                <td>{(page - 1) * 5 + i + 1}</td>
                <td>{money(r.amount)}</td>
                <td>{formatDate(r.release_date)}</td>
                <td>{r.release_location || '—'}</td>
                <td><StatusBadge status={r.status} /></td>
                <td><StatusBadge status={r.payout_result || 'Pending'} /></td>
                <td>{formatDate(r.outcome_date)}</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <RowActions onView={() => setViewing(r)} onEdit={() => openEdit(r)} onDelete={() => setToDelete(r)} />
                    {r.payout_result !== 'Received' && (
                      <Button size="sm" variant="success" onClick={() => markAsReceived(r)}>Mark Received</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pager total={filtered.length} page={page} setPage={setPage} />
      </div>

      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton><Modal.Title>{editId ? 'Edit Assistance Record' : 'Schedule Cash Assistance Payout'}</Modal.Title></Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            <Row className="mb-3">
              <Col><Form.Label>Amount (₱)</Form.Label><Form.Control type="number" min="0" step="0.01" required value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })} /></Col>
              <Col><Form.Label>Scheduled Release Date</Form.Label><Form.Control type="date" required value={form.release_date}
                onChange={e => setForm({ ...form, release_date: e.target.value })} /></Col>
            </Row>
            <Form.Group className="mb-3"><Form.Label>Release Location</Form.Label><Form.Control value={form.release_location}
              placeholder="e.g. Municipal Gymnasium" onChange={e => setForm({ ...form, release_location: e.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Release Instructions</Form.Label><Form.Control as="textarea" rows={2}
              value={form.release_instructions} onChange={e => setForm({ ...form, release_instructions: e.target.value })} /></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="light" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" className="btn-lgu">Save Record</Button></Modal.Footer>
        </Form>
      </Modal>

      <Modal show={!!viewing} onHide={() => setViewing(null)} centered>
        <Modal.Header closeButton><Modal.Title>Assistance Details</Modal.Title></Modal.Header>
        <Modal.Body>{viewing && <dl className="details">
          <dt>Reference No.</dt><dd>{viewing.reference_number}</dd>
          <dt>Amount</dt><dd>{money(viewing.amount)}</dd>
          <dt>Scheduled Release Date</dt><dd>{formatDate(viewing.release_date)}</dd>
          <dt>Release Location</dt><dd>{viewing.release_location || '—'}</dd>
          <dt>Instructions</dt><dd>{viewing.release_instructions || '—'}</dd>
          <dt>Cash Assistance</dt><dd>{viewing.payout_result || 'Pending'}</dd>
          <dt>Date of Payout Outcome</dt><dd>{formatDate(viewing.outcome_date)}</dd>
          <dt>Recorded By</dt><dd>{viewing.User?.username}</dd>
          <dt>Schedule Status</dt><dd><StatusBadge status={viewing.status} /></dd>
        </dl>}</Modal.Body>
      </Modal>
      <ConfirmDelete show={!!toDelete} label={toDelete?.reference_number}
        onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
    </>
  )
}
export default AssistanceRecords
