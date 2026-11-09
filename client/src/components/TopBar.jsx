import { Dropdown } from 'react-bootstrap'
import { useNavigate } from 'react-router'
import { FiUser, FiLogOut } from 'react-icons/fi'
import { clearUser, getUser } from '../auth'

const TopBar = () => {
  const navigate = useNavigate()
  const user = getUser()

  const logout = () => {
    clearUser()
    navigate('/login')
  }

  return (
    <header className="topbar">
      <Dropdown align="end">
        <Dropdown.Toggle variant="link" className="topbar-user">
          <span className="avatar"><FiUser /></span>
          <span>{user?.username || 'User'}</span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.ItemText className="text-muted small">Role: {user?.role}</Dropdown.ItemText>
          <Dropdown.Divider />
          <Dropdown.Item onClick={logout}><FiLogOut className="me-2" />Logout</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </header>
  )
}

export default TopBar
