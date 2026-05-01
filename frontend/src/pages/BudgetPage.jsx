import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

export default function BudgetPage() {
  const { token }   = useAuth()
  const navigate    = useNavigate()
  const [budget, setBudget]   = useState('')
  const [current, setCurrent] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) { navigate('/'); return }
    loadBudget()
  }, [])

  const loadBudget = async () => {
    const data = await api.getBudget(token)
    setCurrent(data.monthly_budget || 0)
    setBudget(data.monthly_budget || '')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!budget || parseFloat(budget) < 0) {
      setMessage('Please enter a valid budget amount')
      return
    }
    await api.setBudget(token, parseFloat(budget))
    setCurrent(parseFloat(budget))
    setMessage('Budget saved successfully!')
    setTimeout(() => setMessage(''), 2500)
  }

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h2 style={styles.logo}>💰 Expense Tracker</h2>
        <div style={styles.navRight}>
          <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button style={styles.navBtn} onClick={() => navigate('/expenses')}>Expenses</button>
        </div>
      </div>

      <div style={styles.content}>
        <h3 style={styles.heading}>Budget Settings</h3>

        {/* Current Budget Display */}
        <div style={styles.currentCard}>
          <p style={styles.currentLabel}>Current Monthly Budget</p>
          <p style={styles.currentValue}>
            {current > 0 ? `₹${current.toFixed(2)}` : 'Not set yet'}
          </p>
        </div>

        {/* Set Budget Form */}
        <div style={styles.formCard}>
          <h4 style={styles.formTitle}>Set Monthly Budget</h4>
          <p style={styles.formHint}>
            Set how much you want to spend this month. You'll see a warning on the dashboard when you're close to the limit.
          </p>

          {message && <p style={styles.message}>{message}</p>}

          <form onSubmit={handleSave} style={styles.form}>
            <input
              style={styles.input}
              type="number"
              placeholder="Enter amount e.g. 10000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              min="0"
              required
            />
            <button style={styles.button} type="submit">
              Save Budget
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div style={styles.infoBox}>
          <p style={styles.infoText}>💡 <strong>Tip:</strong> Your budget resets every month automatically. You can update it anytime.</p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container:    { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  navbar:       { backgroundColor: '#fff', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  logo:         { color: '#2d3748', margin: 0 },
  navRight:     { display: 'flex', gap: '12px' },
  navBtn:       { padding: '8px 16px', backgroundColor: '#4f63d2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  content:      { padding: '32px', maxWidth: '600px' },
  heading:      { color: '#2d3748', marginBottom: '24px' },
  currentCard:  { backgroundColor: '#fff', padding: '24px', borderRadius: '10px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid #68d391' },
  currentLabel: { color: '#718096', fontSize: '13px', marginBottom: '8px' },
  currentValue: { color: '#2d3748', fontSize: '28px', fontWeight: '700', margin: 0 },
  formCard:     { backgroundColor: '#fff', padding: '28px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitle:    { color: '#2d3748', marginTop: 0, marginBottom: '8px' },
  formHint:     { color: '#718096', fontSize: '13px', marginBottom: '20px' },
  message:      { color: '#2f855a', backgroundColor: '#f0fff4', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  form:         { display: 'flex', flexDirection: 'column', gap: '14px' },
  input:        { padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  button:       { padding: '12px', backgroundColor: '#4f63d2', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  infoBox:      { backgroundColor: '#ebf8ff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #bee3f8' },
  infoText:     { color: '#2c5282', fontSize: '13px', margin: 0 }
}