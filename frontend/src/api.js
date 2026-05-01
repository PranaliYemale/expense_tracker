const BASE_URL = 'http://localhost:5000/api'

export const api = {

  // Auth
  signup: async (name, email, password) => {
    const res = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    return res.json()
  },

  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return res.json()
  },

  // Expenses
  getExpenses: async (token) => {
    const res = await fetch(`${BASE_URL}/expenses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.json()
  },

  addExpense: async (token, data) => {
    const res = await fetch(`${BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  updateExpense: async (token, id, data) => {
    const res = await fetch(`${BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  deleteExpense: async (token, id) => {
    const res = await fetch(`${BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.json()
  },

  // Budget
  getBudget: async (token) => {
    const res = await fetch(`${BASE_URL}/budget`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.json()
  },

  setBudget: async (token, monthly_budget) => {
    const res = await fetch(`${BASE_URL}/budget`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ monthly_budget })
    })
    return res.json()
  },

  // Summary
  getSummary: async (token) => {
    const res = await fetch(`${BASE_URL}/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.json()
  }
}