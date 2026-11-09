import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'

//view / edit / delete buttons of a table row (leave out the ones you do not pass)
const RowActions = ({ onView, onEdit, onDelete }) => {
  return (
    <div className="d-flex gap-2">
      {onView && (
        <button className="icon-btn view" title="View" onClick={onView}><FiEye /></button>
      )}
      {onEdit && (
        <button className="icon-btn edit" title="Edit" onClick={onEdit}><FiEdit2 /></button>
      )}
      {onDelete && (
        <button className="icon-btn delete" title="Delete" onClick={onDelete}><FiTrash2 /></button>
      )}
    </div>
  )
}

export default RowActions
