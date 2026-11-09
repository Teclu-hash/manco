import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { Routes, Route, Navigate } from 'react-router'
import { getUser } from './auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import Requirements from './pages/Requirements'
import AssistanceRecords from './pages/AssistanceRecords'
import StudentPortal from './pages/StudentPortal'
import StudentSubmissions from './pages/StudentSubmissions'

const Protected = ({ children, role }) => {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to={user.role?.toLowerCase() === 'student' ? '/student' : '/'} replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected role="Admin"><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="applications" element={<Applications />} />
        <Route path="requirements" element={<Requirements />} />
        <Route path="assistance-records" element={<AssistanceRecords />} />
      </Route>
      <Route path="/student" element={<Protected role="Student"><Layout /></Protected>}>
        <Route index element={<StudentPortal />} />
        <Route path="submit-requirements" element={<StudentSubmissions />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
