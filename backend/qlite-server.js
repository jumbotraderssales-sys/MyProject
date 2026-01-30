// backend/sqlite-server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.json());

// Single database file
const db = new sqlite3.Database(path.join(__dirname, 'paper2real.db'));

// Initialize tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      realBalance REAL DEFAULT 5000,
      paperBalance REAL DEFAULT 100000,
      accountStatus TEXT DEFAULT 'active',
      role TEXT DEFAULT 'user',
      currentPlan TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      symbol TEXT,
      side TEXT,
      size REAL,
      leverage INTEGER,
      entryPrice REAL,
      stopLoss REAL,
      takeProfit REAL,
      status TEXT DEFAULT 'OPEN',
      pnl REAL DEFAULT 0,
      positionValue REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);
});

// Register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (row) return res.status(400).json({ success: false, error: 'User exists' });
    
    db.run(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      [name, email, password],
      function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, user) => {
          res.json({
            success: true,
            token: `sqlite-token-${user.id}`,
            user: { ...user, password: undefined }
          });
        });
      }
    );
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, user) => {
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    res.json({
      success: true,
      token: `sqlite-token-${user.id}`,
      user: { ...user, password: undefined }
    });
  });
});

app.listen(3001, () => console.log('SQLite server running on port 3001'));