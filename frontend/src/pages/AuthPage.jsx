import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login }   = useAuth()
  const navigate    = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isLogin) {
      const res = await api.login(formData.email, formData.password)
      if (res.token) {
        login(res.user, res.token)
        navigate('/dashboard')
      } else {
        setError(res.message || 'Login failed')
      }
    } else {
      const res = await api.signup(formData.name, formData.email, formData.password)
      if (res.message === 'Account created successfully') {
        setIsLogin(true)
        setError('Account created! Please login.')
      } else {
        setError(res.message || 'Signup failed')
      }
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>💰 Expense Tracker</h2>
        <p style={styles.subtitle}>{isLogin ? 'Login to your account' : 'Create a new account'}</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <input style={styles.input} type="text" name="name"
              placeholder="Full Name" value={formData.name}
              onChange={handleChange} required />
          )}
          <input style={styles.input} type="email" name="email"
            placeholder="Email Address" value={formData.email}
            onChange={handleChange} required />
          <input style={styles.input} type="password" name="password"
            placeholder="Password" value={formData.password}
            onChange={handleChange} required />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.toggle}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span style={styles.link} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8' },
  card:      { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  title:     { textAlign: 'center', color: '#2d3748', marginBottom: '4px' },
  subtitle:  { textAlign: 'center', color: '#718096', marginBottom: '24px', fontSize: '14px' },
  form:      { display: 'flex', flexDirection: 'column', gap: '14px' },
  input:     { padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  button:    { padding: '12px', backgroundColor: '#4f63d2', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  error:     { color: '#e53e3e', fontSize: '13px', textAlign: 'center', marginBottom: '8px' },
  toggle:    { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#718096' },
  link:      { color: '#4f63d2', cursor: 'pointer', fontWeight: '600' }
}