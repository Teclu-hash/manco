import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap'
import { FiPlus } from 'react-icons/fi'
import api, { errorMessage } from '../api'
import PageHeader from '../components/PageHeader'
import Pager from '../components/Pager'
import RowActions from '../components/RowActions'
import ConfirmDelete from '../components/ConfirmDelete'

const emptyForm = { requirement_name: '', description: '', deadline: '' }

const Requirements = () => {
  const [requirements, setRequirements] = useState([])
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [toDelete, setToDelete] = useState(null)

  //change this number to load the list again
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
          const res = await api.get('/requirement')
          setRequirements(res.data)
      } catch (err) {
        setError(errorMessage(err))
      }
    }
    load()
  }, [reload])

  const rows = requirements.slice((page - 1) * 5, page * 5)

  const openAdd = () => {
    setEditId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEdit = (r) => {
    setEditId(r.requirement_id)
    setForm({ requirement_name: r.requirement_name, description: r.description || '', deadline: r.deadline || '' })
    setError('')
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editId) await api.put(`/requirement/${editId}`, form)
      else await api.post('/requirement/new', form)
      setShowForm(false)
      setReload(reload + 1)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/requirement/${toDelete.requirement_id}`)
      setToDelete(null)
      setReload(reload + 1)
    } catch (err) {
      setToDelete(null)
      setError(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader title="Requirement Types" subtitle="Manage required documents for applications">
        <Button className="btn-lgu" onClick={openAdd}><FiPlus className="me-2" />Add Requirement</Button>
      </PageHeader>

      {error && !showForm && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <div className="panel">
        <Table responsive hover className="lgu-table">
          <thead>
            <tr><th>#</th><th>Requirement Name</th><th>Description</th><th>Submission Deadline</th><th>Action</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan="5" className="text-center text-muted py-4">No requirements yet</td></tr>
            )}
            {rows.map((r, i) => (
              <tr key={r.requirement_id}>
                <td>{(page - 1) * 5 + i + 1}</td>
                <td>{r.requirement_name}</td>
                <td>{r.description}</td>
                <td>{r.deadline ? new Date(`${r.deadline}T00:00:00`).toLocaleDateString() : 'No deadline'}</td>
                <td><RowActions onEdit={() => openEdit(r)} onDelete={() => setToDelete(r)} /></td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pager total={requirements.length} page={page} setPage={setPage} />
      </div>

      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{editId ? 'Edit Requirement' : 'Add Requirement'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Requirement Name</Form.Label>
              <Form.Control value={form.requirement_name} required
                onChange={(e) => setForm({ ...form, requirement_name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Submission Deadline</Form.Label>
              <Form.Control type="date" min={new Date().toISOString().slice(0, 10)}
                value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              <Form.Text>Students cannot upload this requirement after the deadline.</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" className="btn-lgu">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmDelete show={!!toDelete} label={toDelete?.requirement_name}
        onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
    </>
  )
}

export default Requirements
