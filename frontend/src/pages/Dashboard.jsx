import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend,
         CategoryScale, LinearScale, BarElement } from 'chart.js'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const CATEGORY_COLORS = {
  Food: '#f6ad55', Travel: '#63b3ed', Bills: '#fc8181',
  Shopping: '#68d391', Other: '#b794f4'
}

export default function Dashboard() {
  const { user, token, logout } = useAuth()
  const navigate  = useNavigate()
  const [summary, setSummary]   = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!token) { navigate('/'); return }
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [summaryData, expenseData] = await Promise.all([
      api.getSummary(token),
      api.getExpenses(token)
    ])
    setSummary(summaryData)
    setExpenses(expenseData)
    setLoading(false)
  }

  if (loading) return <div style={styles.loading}>Loading...</div>

  const categories   = summary?.category_breakdown || {}
  const budgetPercent = summary?.monthly_budget > 0
    ? Math.min((summary.total_spent / summary.monthly_budget) * 100, 100)
    : 0

  const pieData = {
    labels: Object.keys(categories),
    datasets: [{
      data: Object.values(categories),
      backgroundColor: Object.keys(categories).map(c => CATEGORY_COLORS[c] || '#a0aec0'),
      borderWidth: 1
    }]
  }

  const last5 = [...expenses].slice(0, 5).reverse()
  const barData = {
    labels: last5.map(e => e.title),
    datasets: [{
      label: 'Amount (₹)',
      data: last5.map(e => e.amount),
      backgroundColor: '#4f63d2',
      borderRadius: 6
    }]
  }

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>💰 Expense Tracker</h2>
        <div style={styles.navRight}>
          <span style={styles.welcome}>Hi, {user?.name} 👋</span>
          <button style={styles.navBtn} onClick={() => navigate('/expenses')}>Expenses</button>
          <button style={styles.navBtn} onClick={() => navigate('/budget')}>Budget</button>
          <button style={{...styles.navBtn, backgroundColor: '#e53e3e'}}
            onClick={() => { logout(); navigate('/') }}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <h3 style={styles.heading}>Dashboard — This Month</h3>

        {/* Summary Cards */}
        <div style={styles.cards}>
          <div style={{...styles.card, borderTop: '4px solid #4f63d2'}}>
            <p style={styles.cardLabel}>Total Spent</p>
            <p style={styles.cardValue}>₹{summary?.total_spent?.toFixed(2) || '0.00'}</p>
          </div>
          <div style={{...styles.card, borderTop: '4px solid #68d391'}}>
            <p style={styles.cardLabel}>Monthly Budget</p>
            <p style={styles.cardValue}>₹{summary?.monthly_budget?.toFixed(2) || '0.00'}</p>
          </div>
          <div style={{...styles.card, borderTop: summary?.remaining < 0 ? '4px solid #fc8181' : '4px solid #f6ad55'}}>
            <p style={styles.cardLabel}>Remaining</p>
            <p style={{...styles.cardValue, color: summary?.remaining < 0 ? '#e53e3e' : '#2d3748'}}>
              ₹{summary?.remaining?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        {/* Budget Progress Bar */}
        {summary?.monthly_budget > 0 && (
          <div style={styles.progressBox}>
            <p style={styles.progressLabel}>
              Budget Used: {budgetPercent.toFixed(0)}%
              {budgetPercent >= 100 && <span style={{color: '#e53e3e'}}> ⚠️ Over Budget!</span>}
            </p>
            <div style={styles.progressBar}>
              <div style={{
                ...styles.progressFill,
                width: `${budgetPercent}%`,
                backgroundColor: budgetPercent >= 90 ? '#e53e3e' : budgetPercent >= 70 ? '#f6ad55' : '#68d391'
              }} />
            </div>
          </div>
        )}

        {/* Charts */}
        <div style={styles.charts}>
          <div style={styles.chartBox}>
            <h4 style={styles.chartTitle}>Spending by Category</h4>
            {Object.keys(categories).length > 0
              ? <Pie data={pieData} />
              : <p style={styles.noData}>No expenses this month</p>}
          </div>
          <div style={styles.chartBox}>
            <h4 style={styles.chartTitle}>Recent Expenses</h4>
            {last5.length > 0
              ? <Bar data={barData} options={{ plugins: { legend: { display: false } } }} />
              : <p style={styles.noData}>No expenses yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container:    { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  navbar:       { backgroundColor: '#fff', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  logo:         { color: '#2d3748', margin: 0 },
  navRight:     { display: 'flex', alignItems: 'center', gap: '12px' },
  welcome:      { color: '#718096', fontSize: '14px' },
  navBtn:       { padding: '8px 16px', backgroundColor: '#4f63d2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  content:      { padding: '32px' },
  heading:      { color: '#2d3748', marginBottom: '24px' },
  cards:        { display: 'flex', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' },
  card:         { backgroundColor: '#fff', padding: '20px 28px', borderRadius: '10px', flex: 1, minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardLabel:    { color: '#718096', fontSize: '13px', marginBottom: '6px' },
  cardValue:    { color: '#2d3748', fontSize: '24px', fontWeight: '700', margin: 0 },
  progressBox:  { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  progressLabel:{ color: '#4a5568', fontSize: '14px', marginBottom: '10px' },
  progressBar:  { height: '12px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '6px', transition: 'width 0.4s ease' },
  charts:       { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  chartBox:     { backgroundColor: '#fff', padding: '24px', borderRadius: '10px', flex: 1, minWidth: '300px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  chartTitle:   { color: '#2d3748', marginBottom: '16px', marginTop: 0 },
  noData:       { color: '#a0aec0', textAlign: 'center', padding: '40px 0' },
  loading:      { textAlign: 'center', marginTop: '100px', color: '#718096', fontSize: '16px' }
}