import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Alert, InputGroup, Row, Col } from 'react-bootstrap'
import { FiPlus, FiSearch } from 'react-icons/fi'
import api, { errorMessage } from '../api'
import { YEAR_LEVELS, STUDENT_STATUS } from '../utils'
import PageHeader from '../components/PageHeader'
import Pager from '../components/Pager'
import RowActions from '../components/RowActions'
import StatusBadge from '../components/StatusBadge'
import ConfirmDelete from '../components/ConfirmDelete'

const emptyForm = {
  student_name: '', school_id: '', course: '', year_level: '1st Year', contact_number: '', status: 'Active'
}

const Students = () => {
  const [students, setStudents] = useState([])
  const [schools, setSchools] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [viewing, setViewing] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  //change this number to load the list again
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
          const [st, sc] = await Promise.all([api.get('/student'), api.get('/school')])
          setStudents(st.data)
          setSchools(sc.data)
      } catch (err) {
        setError(errorMessage(err))
      }
    }
    load()
  }, [reload])

  const filtered = students.filter((s) =>
    `${s.student_name} ${s.School?.school_name} ${s.course}`.toLowerCase().includes(search.toLowerCase())
  )
  const rows = filtered.slice((page - 1) * 5, page * 5)

  const openAdd = () => {
    setEditId(null)
    setForm({ ...emptyForm, school_id: schools[0]?.school_id || '' })
    setError('')
    setShowForm(true)
  }

  const openEdit = (s) => {
    setEditId(s.student_id)
    setForm({
      student_name: s.student_name, school_id: s.school_id, course: s.course,
      year_level: s.year_level, contact_number: s.contact_number, status: s.status
    })
    setError('')
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editId) await api.put(`/student/${editId}`, form)
      else await api.post('/student/new', form)
      setShowForm(false)
      setReload(reload + 1)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/student/${toDelete.student_id}`)
      setToDelete(null)
      setReload(reload + 1)
    } catch {
      setToDelete(null)
      setError('Cannot delete this student. The student may already have applications.')
    }
  }

  return (
    <>
      <PageHeader title="Students" subtitle="Manage student records">
        <Button className="btn-lgu" onClick={openAdd}><FiPlus className="me-2" />Add Student</Button>
      </PageHeader>

      {error && !showForm && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <div className="panel">
        <InputGroup className="search-box mb-3">
          <InputGroup.Text><FiSearch /></InputGroup.Text>
          <Form.Control
            placeholder="Search by name, school, or course..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </InputGroup>

        <Table responsive hover className="lgu-table">
          <thead>
            <tr>
              <th>#</th><th>Full Name</th><th>School</th><th>Course</th>
              <th>Year Level</th><th>Contact</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan="8" className="text-center text-muted py-4">No students found</td></tr>
            )}
            {rows.map((s, i) => (
              <tr key={s.student_id}>
                <td>{(page - 1) * 5 + i + 1}</td>
                <td>{s.student_name}</td>
                <td>{s.School?.school_name}</td>
                <td>{s.course}</td>
                <td>{s.year_level}</td>
                <td>{s.contact_number}</td>
                <td><StatusBadge status={s.status} /></td>
                <td>
                  <RowActions onView={() => setViewing(s)} onEdit={() => openEdit(s)} onDelete={() => setToDelete(s)} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pager total={filtered.length} page={page} setPage={setPage} />
      </div>

      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{editId ? 'Edit Student' : 'Add Student'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control value={form.student_name} required
                onChange={(e) => setForm({ ...form, student_name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>School</Form.Label>
              <Form.Select value={form.school_id} required
                onChange={(e) => setForm({ ...form, school_id: e.target.value })}>
                <option value="" disabled>Select school</option>
                {schools.map((sc) => (
                  <option key={sc.school_id} value={sc.school_id}>{sc.school_name}</option>
                ))}
              </Form.Select>
              {schools.length === 0 && <Form.Text className="text-danger">Add a school first in the Schools page.</Form.Text>}
            </Form.Group>
            <Row className="mb-3">
              <Col>
                <Form.Label>Course / Strand</Form.Label>
                <Form.Control value={form.course} required
                  onChange={(e) => setForm({ ...form, course: e.target.value })} />
              </Col>
              <Col>
                <Form.Label>Year Level</Form.Label>
                <Form.Select value={form.year_level}
                  onChange={(e) => setForm({ ...form, year_level: e.target.value })}>
                  {YEAR_LEVELS.map((y) => <option key={y}>{y}</option>)}
                </Form.Select>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Label>Contact Number</Form.Label>
                <Form.Control value={form.contact_number} required
                  onChange={(e) => setForm({ ...form, contact_number: e.target.value })} />
              </Col>
              <Col>
                <Form.Label>Status</Form.Label>
                <Form.Select value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STUDENT_STATUS.map((s) => <option key={s}>{s}</option>)}
                </Form.Select>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" className="btn-lgu">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={!!viewing} onHide={() => setViewing(null)} centered>
        <Modal.Header closeButton><Modal.Title>Student Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {viewing && (
            <dl className="details">
              <dt>Full Name</dt><dd>{viewing.student_name}</dd>
              <dt>School</dt><dd>{viewing.School?.school_name}</dd>
              <dt>Course</dt><dd>{viewing.course}</dd>
              <dt>Year Level</dt><dd>{viewing.year_level}</dd>
              <dt>Contact</dt><dd>{viewing.contact_number}</dd>
              <dt>Status</dt><dd><StatusBadge status={viewing.status} /></dd>
            </dl>
          )}
        </Modal.Body>
      </Modal>

      <ConfirmDelete show={!!toDelete} label={toDelete?.student_name}
        onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
    </>
  )
}

export default Students
