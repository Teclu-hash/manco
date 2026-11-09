//color of the badge depends on the status
const COLORS = {
  Pending: 'warn',
  'Under Review': 'info',
  Approved: 'good',
  Released: 'good',
  Active: 'good',
  Submitted: 'info',
  Accepted: 'good',
  Denied: 'bad',
  'Needs Revision': 'warn',
  Rejected: 'bad',
  Denied: 'bad',
  Inactive: 'muted'
}

const StatusBadge = ({ status }) => {
  return <span className={`status-badge ${COLORS[status] || 'muted'}`}>{status}</span>
}

export default StatusBadge
