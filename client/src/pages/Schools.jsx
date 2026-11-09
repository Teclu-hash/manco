import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Alert, InputGroup } from 'react-bootstrap'
import { FiPlus, FiSearch } from 'react-icons/fi'
import api, { errorMessage } from '../api'
import PageHeader from '../components/PageHeader'
import Pager from '../components/Pager'
import RowActions from '../components/RowActions'
import ConfirmDelete from '../components/ConfirmDelete'

const emptyForm = { school_name: '', address: '' }

const Schools = () => {
  const [schools, setSchools] = useState([])
  const [search, setSearch] = useState('')
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
          const res = await api.get('/school')
          setSchools(res.data)
      } catch (err) {
        setError(errorMessage(err))
      }
    }
    load()
  }, [reload])

  const filtered = schools.filter((s) =>
    `${s.school_name} ${s.address}`.toLowerCase().includes(search.toLowerCase())
  )
  const rows = filtered.slice((page - 1) * 5, page * 5)

  const openAdd = () => {
    setEditId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEdit = (s) => {
    setEditId(s.school_id)
    setForm({ school_name: s.school_name, address: s.address })
    setError('')
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editId) await api.put(`/school/${editId}`, form)
      else await api.post('/school/new', form)
      setShowForm(false)
      setReload(reload + 1)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/school/${toDelete.school_id}`)
      setToDelete(null)
      setReload(reload + 1)
    } catch (err) {
      setToDelete(null)
      setError(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader title="Schools" subtitle="Manage the schools where students are enrolled">
        <Button className="btn-lgu" onClick={openAdd}><FiPlus className="me-2" />Add School</Button>
      </PageHeader>

      {error && !showForm && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <div className="panel">
        <InputGroup className="search-box mb-3">
          <InputGroup.Text><FiSearch /></InputGroup.Text>
          <Form.Control
            placeholder="Search by school name or address..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </InputGroup>

        <Table responsive hover className="lgu-table">
          <thead>
            <tr><th>#</th><th>School Name</th><th>Address</th><th>Action</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan="4" className="text-center text-muted py-4">No schools found</td></tr>
            )}
            {rows.map((s, i) => (
              <tr key={s.school_id}>
                <td>{(page - 1) * 5 + i + 1}</td>
                <td>{s.school_name}</td>
                <td>{s.address}</td>
                <td><RowActions onEdit={() => openEdit(s)} onDelete={() => setToDelete(s)} /></td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pager total={filtered.length} page={page} setPage={setPage} />
      </div>

      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{editId ? 'Edit School' : 'Add School'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>School Name</Form.Label>
              <Form.Control value={form.school_name} required
                onChange={(e) => setForm({ ...form, school_name: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control value={form.address} required
                onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" className="btn-lgu">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmDelete show={!!toDelete} label={toDelete?.school_name}
        onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
    </>
  )
}

export default Schools
