import { Modal, Button } from 'react-bootstrap'

const ConfirmDelete = ({ show, label, onCancel, onConfirm }) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete <strong>{label}</strong>? This cannot be undone.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Delete</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmDelete
