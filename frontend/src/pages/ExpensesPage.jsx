import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Other']
const emptyForm  = { title: '', amount: '', category: 'Food', date: '', note: '' }

const BADGE_COLORS = {
  Food: '#fef3c7', Travel: '#dbeafe', Bills: '#fee2e2',
  Shopping: '#dcfce7', Other: '#ede9fe'
}

export default function ExpensesPage() {
  const { token }   = useAuth()
  const navigate    = useNavigate()
  const [expenses, setExpenses]           = useState([])
  const [form, setForm]                   = useState(emptyForm)
  const [editId, setEditId]               = useState(null)
  const [showForm, setShowForm]           = useState(false)
  const [filterCategory, setFilterCategory] = useState('All')
  const [message, setMessage]             = useState('')

  useEffect(() => {
    if (!token) { navigate('/'); return }
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    const data = await api.getExpenses(token)
    setExpenses(data)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form, amount: parseFloat(form.amount) }

    if (editId) {
      await api.updateExpense(token, editId, data)
      setMessage('Expense updated!')
    } else {
      await api.addExpense(token, data)
      setMessage('Expense added!')
    }

    setForm(emptyForm)
    setEditId(null)
    setShowForm(false)
    loadExpenses()
    setTimeout(() => setMessage(''), 2500)
  }

  const handleEdit = (expense) => {
    setForm({ title: expense.title, amount: expense.amount,
              category: expense.category, date: expense.date, note: expense.note || '' })
    setEditId(expense.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense?')) {
      await api.deleteExpense(token, id)
      setMessage('Expense deleted!')
      loadExpenses()
      setTimeout(() => setMessage(''), 2500)
    }
  }

  const filtered = filterCategory === 'All'
    ? expenses
    : expenses.filter(e => e.category === filterCategory)

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h2 style={styles.logo}>💰 Expense Tracker</h2>
        <div style={styles.navRight}>
          <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button style={styles.navBtn} onClick={() => navigate('/budget')}>Budget</button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.topRow}>
          <h3 style={styles.heading}>My Expenses</h3>
          <button style={styles.addBtn} onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditId(null) }}>
            {showForm ? '✕ Cancel' : '+ Add Expense'}
          </button>
        </div>

        {message && <p style={styles.message}>{message}</p>}

        {/* Add/Edit Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h4 style={styles.formTitle}>{editId ? 'Edit Expense' : 'Add New Expense'}</h4>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input style={styles.input} name="title" placeholder="Title e.g. Lunch"
                value={form.title} onChange={handleChange} required />
              <input style={styles.input} name="amount" type="number" placeholder="Amount (₹)"
                value={form.amount} onChange={handleChange} required />
              <select style={styles.input} name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input style={styles.input} name="date" type="date"
                value={form.date} onChange={handleChange} required />
              <input style={styles.input} name="note" placeholder="Note (optional)"
                value={form.note} onChange={handleChange} />
              <button style={styles.submitBtn} type="submit">
                {editId ? 'Update Expense' : 'Add Expense'}
              </button>
            </form>
          </div>
        )}

        {/* Category Filter */}
        <div style={styles.filterRow}>
          {['All', ...CATEGORIES].map(c => (
            <button key={c} style={{...styles.filterBtn, ...(filterCategory === c ? styles.filterActive : {})}}
              onClick={() => setFilterCategory(c)}>{c}</button>
          ))}
        </div>

        {/* Expense List */}
        {filtered.length === 0
          ? <p style={styles.noData}>No expenses found. Add one above!</p>
          : filtered.map(expense => (
            <div key={expense.id} style={styles.expenseCard}>
              <div style={styles.expenseLeft}>
                <span style={{...styles.badge, backgroundColor: BADGE_COLORS[expense.category]}}>
                  {expense.category}
                </span>
                <div>
                  <p style={styles.expenseTitle}>{expense.title}</p>
                  <p style={styles.expenseDate}>{expense.date}{expense.note && ` • ${expense.note}`}</p>
                </div>
              </div>
              <div style={styles.expenseRight}>
                <p style={styles.expenseAmount}>₹{parseFloat(expense.amount).toFixed(2)}</p>
                <button style={styles.editBtn} onClick={() => handleEdit(expense)}>Edit</button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(expense.id)}>Delete</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

const styles = {
  container:     { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  navbar:        { backgroundColor: '#fff', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  logo:          { color: '#2d3748', margin: 0 },
  navRight:      { display: 'flex', gap: '12px' },
  navBtn:        { padding: '8px 16px', backgroundColor: '#4f63d2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  content:       { padding: '32px' },
  topRow:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  heading:       { color: '#2d3748', margin: 0 },
  addBtn:        { padding: '10px 20px', backgroundColor: '#4f63d2', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  message:       { color: '#2f855a', backgroundColor: '#f0fff4', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  formCard:      { backgroundColor: '#fff', padding: '24px', borderRadius: '10px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitle:     { color: '#2d3748', marginTop: 0, marginBottom: '16px' },
  form:          { display: 'flex', flexDirection: 'column', gap: '12px' },
  input:         { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  submitBtn:     { padding: '11px', backgroundColor: '#4f63d2', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  filterRow:     { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtn:     { padding: '7px 16px', border: '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', backgroundColor: '#fff', color: '#4a5568' },
  filterActive:  { backgroundColor: '#4f63d2', color: '#fff', border: '1px solid #4f63d2' },
  expenseCard:   { backgroundColor: '#fff', padding: '16px 20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', marginBottom: '12px' },
  expenseLeft:   { display: 'flex', alignItems: 'center', gap: '14px' },
  badge:         { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: '#4a5568', whiteSpace: 'nowrap' },
  expenseTitle:  { margin: 0, fontWeight: '600', color: '#2d3748', fontSize: '14px' },
  expenseDate:   { margin: '3px 0 0', color: '#a0aec0', fontSize: '12px' },
  expenseRight:  { display: 'flex', alignItems: 'center', gap: '10px' },
  expenseAmount: { margin: 0, fontWeight: '700', color: '#2d3748', fontSize: '16px' },
  editBtn:       { padding: '6px 12px', backgroundColor: '#fefcbf', color: '#744210', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  deleteBtn:     { padding: '6px 12px', backgroundColor: '#fed7d7', color: '#c53030', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  noData:        { color: '#a0aec0', textAlign: 'center', padding: '60px 0' }
}