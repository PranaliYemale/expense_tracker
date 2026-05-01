# 💰 Expense Tracker

A full-stack web application to manage and track daily personal expenses with budget management and visual analytics.

## 🔗 Tech Stack
- **Frontend:** React.js, React Router, Chart.js, CSS
- **Backend:** Python, Flask, REST API, SQLite
- **Auth:** JWT (JSON Web Tokens)
- **Tools:** Git, GitHub, Vite

## ✨ Features
- User Signup and Login with secure JWT authentication
- Add, Edit and Delete expenses with category tagging
- Categories — Food, Travel, Bills, Shopping, Other
- Set monthly budget and track remaining balance
- Dashboard with Pie chart and Bar chart for spending insights
- Budget progress bar with color alerts when limit is near
- Filter expenses by category

## 📁 Project Structure
expense-tracker/
├── backend/
│   ├── app.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── context/
    │   ├── api.js
    │   └── App.jsx
    └── index.html

## ⚙️ How to Run Locally

### Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
Backend runs at http://localhost:5000

### Frontend
cd frontend
npm install
npm run dev
Frontend runs at http://localhost:5173

## 🔗 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/signup | Register new user |
| POST | /api/login | Login and get token |
| GET | /api/expenses | Get all expenses |
| POST | /api/expenses | Add new expense |
| PUT | /api/expenses/:id | Edit an expense |
| DELETE | /api/expenses/:id | Delete an expense |
| GET | /api/budget | Get monthly budget |
| POST | /api/budget | Set monthly budget |
| GET | /api/summary | Get dashboard summary |
