from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
from datetime import timedelta

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'expense-tracker-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

CORS(app)
jwt = JWTManager(app)

@app.route('/')
def home():
    return jsonify({'message': 'Backend is running!'})                                                                                          

def get_db():
    conn = sqlite3.connect('expenses.db')
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            name     TEXT    NOT NULL,
            email    TEXT    UNIQUE NOT NULL,
            password TEXT    NOT NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id  INTEGER NOT NULL,
            title    TEXT    NOT NULL,
            amount   REAL    NOT NULL,
            category TEXT    NOT NULL,
            date     TEXT    NOT NULL,
            note     TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS budgets (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id        INTEGER UNIQUE NOT NULL,
            monthly_budget REAL    NOT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    conn.commit()
    conn.close()
    

@app.route('/api/signup', methods=['POST'])
def signup():
    data     = request.get_json()
    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({'message': 'All fields are required'}), 400

    hashed = generate_password_hash(password)

    try:
        conn = get_db()
        conn.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            (name, email, hashed)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Account created successfully'}), 201

    except sqlite3.IntegrityError:
        return jsonify({'message': 'Email already registered'}), 409
    
    
@app.route('/api/login', methods=['POST'])
def login():
    data     = request.get_json()
    email    = data.get('email', '').strip()
    password = data.get('password', '')

    conn = get_db()
    user = conn.execute(
        'SELECT * FROM users WHERE email = ?', (email,)
    ).fetchone()
    conn.close()

    if not user or not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = create_access_token(identity=str(user['id']))
    return jsonify({
        'token': token,
        'user': {
            'id':    user['id'],
            'name':  user['name'],
            'email': user['email']
        }
    }), 200
    
@app.route('/api/expenses', methods=['GET'])
@jwt_required()
def get_expenses():
    user_id = get_jwt_identity()
    conn    = get_db()
    rows    = conn.execute(
        'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC',
        (user_id,)
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows]), 200


@app.route('/api/expenses', methods=['POST'])
@jwt_required()
def add_expense():
    user_id  = get_jwt_identity()
    data     = request.get_json()
    title    = data.get('title', '').strip()
    amount   = data.get('amount')
    category = data.get('category', '').strip()
    date     = data.get('date', '').strip()
    note     = data.get('note', '').strip()

    if not title or amount is None or not category or not date:
        return jsonify({'message': 'title, amount, category and date are required'}), 400

    conn = get_db()
    conn.execute(
        'INSERT INTO expenses (user_id, title, amount, category, date, note) VALUES (?, ?, ?, ?, ?, ?)',
        (user_id, title, float(amount), category, date, note)
    )
    conn.commit()
    conn.close()
    return jsonify({'message': 'Expense added'}), 201


@app.route('/api/expenses/<int:expense_id>', methods=['PUT'])
@jwt_required()
def update_expense(expense_id):
    user_id = get_jwt_identity()
    data    = request.get_json()

    conn    = get_db()
    expense = conn.execute(
        'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
        (expense_id, user_id)
    ).fetchone()

    if not expense:
        conn.close()
        return jsonify({'message': 'Expense not found'}), 404

    conn.execute(
        '''UPDATE expenses
           SET title = ?, amount = ?, category = ?, date = ?, note = ?
           WHERE id = ?''',
        (data.get('title'), float(data.get('amount')),
         data.get('category'), data.get('date'),
         data.get('note', ''), expense_id)
    )
    conn.commit()
    conn.close()
    return jsonify({'message': 'Expense updated'}), 200


@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    user_id = get_jwt_identity()
    conn    = get_db()
    expense = conn.execute(
        'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
        (expense_id, user_id)
    ).fetchone()

    if not expense:
        conn.close()
        return jsonify({'message': 'Expense not found'}), 404

    conn.execute('DELETE FROM expenses WHERE id = ?', (expense_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Expense deleted'}), 200

@app.route('/api/budget', methods=['GET'])
@jwt_required()
def get_budget():
    user_id = get_jwt_identity()
    conn    = get_db()
    budget  = conn.execute(
        'SELECT * FROM budgets WHERE user_id = ?', (user_id,)
    ).fetchone()
    conn.close()

    if budget:
        return jsonify(dict(budget)), 200
    return jsonify({'monthly_budget': 0}), 200


@app.route('/api/budget', methods=['POST'])
@jwt_required()
def set_budget():
    user_id        = get_jwt_identity()
    data           = request.get_json()
    monthly_budget = data.get('monthly_budget')

    conn     = get_db()
    existing = conn.execute(
        'SELECT * FROM budgets WHERE user_id = ?', (user_id,)
    ).fetchone()

    if existing:
        conn.execute(
            'UPDATE budgets SET monthly_budget = ? WHERE user_id = ?',
            (float(monthly_budget), user_id)
        )
    else:
        conn.execute(
            'INSERT INTO budgets (user_id, monthly_budget) VALUES (?, ?)',
            (user_id, float(monthly_budget))
        )

    conn.commit()
    conn.close()
    return jsonify({'message': 'Budget saved'}), 200


@app.route('/api/summary', methods=['GET'])
@jwt_required()
def get_summary():
    user_id = get_jwt_identity()
    conn    = get_db()

    expenses = conn.execute(
        """SELECT * FROM expenses
           WHERE user_id = ?
           AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')""",
        (user_id,)
    ).fetchall()

    budget = conn.execute(
        'SELECT monthly_budget FROM budgets WHERE user_id = ?', (user_id,)
    ).fetchone()

    conn.close()

    total_spent    = sum(e['amount'] for e in expenses)
    monthly_budget = budget['monthly_budget'] if budget else 0

    category_breakdown = {}
    for e in expenses:
        cat = e['category']
        category_breakdown[cat] = category_breakdown.get(cat, 0) + e['amount']

    return jsonify({
        'total_spent':        total_spent,
        'monthly_budget':     monthly_budget,
        'remaining':          monthly_budget - total_spent,
        'category_breakdown': category_breakdown
    }), 200


if __name__ == '__main__':
    init_db()
    print('Database initialised ✓')
    app.run(debug=True, port=5000)
    
    
