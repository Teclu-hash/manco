import { NavLink, useNavigate } from 'react-router'
import { FiHome, FiFileText, FiList, FiCreditCard, FiLogOut, FiInbox } from 'react-icons/fi'
import { FaLandmark } from 'react-icons/fa'
import { clearUser, getUser } from '../auth'

const ADMIN_LINKS = [
  { to: '/', label: 'Dashboard', icon: <FiHome />, end: true },
  { to: '/applications', label: 'Applications', icon: <FiFileText /> },
  { to: '/requirements', label: 'Requirements', icon: <FiList /> },
  { to: '/assistance-records', label: 'Assistance Records', icon: <FiCreditCard /> }
]
const STUDENT_LINKS = [
  { to: '/student', label: 'Release Schedule', icon: <FiList />, end: true },
  { to: '/student/submit-requirements', label: 'Submit Requirements', icon: <FiInbox /> }
]

const Sidebar = () => {
  const navigate = useNavigate()
  const user = getUser()
  const links = user?.role?.toLowerCase() === 'student' ? STUDENT_LINKS : ADMIN_LINKS

  const logout = () => {
    clearUser()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-seal"><FaLandmark /></div>
        <div>LGU Student Assistance Management System</div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className="sidebar-link">
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link" onClick={logout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
