import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Form, Button, Alert } from 'react-bootstrap'
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { FaLandmark } from 'react-icons/fa'
import api, { errorMessage } from '../api'
import { saveUser } from '../auth'

const Login = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registerMode, setRegisterMode] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = registerMode
        ? await api.post('/auth/register', { username, password })
        : await api.post('/auth/login', { username, password })
      saveUser(res.data)
      navigate(res.data.role?.toLowerCase() === 'student' ? '/student' : '/')
    } catch (err) {
      setError(errorMessage(err))
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-seal"><FaLandmark /></div>
        <h1>LGU – San Jose<br />Dinagat Islands</h1>
        <h3>Web-based Student Assistance<br />Management System</h3>
        <p className="fst-italic">“Support Today, Build a Brighter Tomorrow”</p>
      </div>

      <div className="login-right">
        <form className="login-card" onSubmit={handleLogin}>
          <h2>{registerMode ? 'Student Registration' : 'Login'}</h2>
          <p className="text-muted">{registerMode ? 'Create a student account' : 'Access your account to continue'}</p>

          {error && <Alert variant="danger" className="py-2">{error}</Alert>}

          <div className="input-icon mb-3">
            <FiUser />
            <Form.Control
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-icon mb-3">
            <FiLock />
            <Form.Control
              type={show ? 'text' : 'password'}
              placeholder={registerMode ? 'Password (at least 6 characters)' : 'Password'}
              minLength={registerMode ? 6 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className="eye" onClick={() => setShow(!show)}>
              {show ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <Button type="submit" className="w-100 btn-lgu" disabled={loading}>
            {loading ? (registerMode ? 'Creating account...' : 'Logging in...') : (registerMode ? 'Register as Student' : 'Login')}
          </Button>

          <p className="text-center text-muted small mt-4 mb-0">
            {registerMode ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" className="btn btn-link p-0 align-baseline"
              onClick={() => { setRegisterMode(!registerMode); setError('') }}>
              {registerMode ? 'Login' : 'Register as Student'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
