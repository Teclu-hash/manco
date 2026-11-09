import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap'
import { FiPlus } from 'react-icons/fi'
import api, { errorMessage } from '../api'
import { getUser } from '../auth'
import { ROLES } from '../utils'
import PageHeader from '../components/PageHeader'
import Pager from '../components/Pager'
import RowActions from '../components/RowActions'
import ConfirmDelete from '../components/ConfirmDelete'

const emptyForm = { username: '', password: '', role: 'Staff' }

const Users = () => {
  const [users, setUsers] = useState([])
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
          const res = await api.get('/user')
          setUsers(res.data)
      } catch (err) {
        setError(errorMessage(err))
      }
    }
    load()
  }, [reload])

  const rows = users.slice((page - 1) * 5, page * 5)

  const openAdd = () => {
    setEditId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEdit = (u) => {
    setEditId(u.user_id)
    setForm({ username: u.username, password: '', role: u.role })
    setError('')
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editId) await api.put(`/user/${editId}`, form)
      else await api.post('/user/new', form)
      setShowForm(false)
      setReload(reload + 1)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const handleDelete = async () => {
    //do not let the logged in user delete his own account
    if (toDelete.user_id === getUser()?.user_id) {
      setToDelete(null)
      setError('You cannot delete the account you are logged in with')
      return
    }
    try {
      await api.delete(`/user/${toDelete.user_id}`)
      setToDelete(null)
      setReload(reload + 1)
    } catch (err) {
      setToDelete(null)
      setError(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader title="Users" subtitle="Manage who can use the system">
        <Button className="btn-lgu" onClick={openAdd}><FiPlus className="me-2" />Add User</Button>
      </PageHeader>

      {error && !showForm && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <div className="panel">
        <Table responsive hover className="lgu-table">
          <thead>
            <tr><th>#</th><th>Username</th><th>Role</th><th>Action</th></tr>
          </thead>
          <tbody>
            {rows.map((u, i) => (
              <tr key={u.user_id}>
                <td>{(page - 1) * 5 + i + 1}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td><RowActions onEdit={() => openEdit(u)} onDelete={() => setToDelete(u)} /></td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pager total={users.length} page={page} setPage={setPage} />
      </div>

      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{editId ? 'Edit User' : 'Add User'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control value={form.username} required
                onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={form.password} required={!editId}
                placeholder={editId ? 'Leave blank to keep the current password' : ''}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" className="btn-lgu">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmDelete show={!!toDelete} label={toDelete?.username}
        onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
    </>
  )
}

export default Users
