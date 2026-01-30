// backend/lowdb-server.js
const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const app = express();
app.use(express.json());

// Setup database
const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

// Set defaults
db.defaults({ 
  users: [],
  trades: [],
  plans: []
}).write();

// Register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  
  const existingUser = db.get('users').find({ email }).value();
  if (existingUser) {
    return res.status(400).json({ success: false, error: 'User exists' });
  }
  
  const user = {
    id: Date.now().toString(),
    name,
    email,
    password,
    realBalance: 5000,
    paperBalance: 100000,
    accountStatus: 'active',
    role: 'user',
    currentPlan: null,
    createdAt: new Date().toISOString()
  };
  
  db.get('users').push(user).write();
  
  res.json({
    success: true,
    token: `lowdb-token-${user.id}`,
    user: { ...user, password: undefined }
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = db.get('users').find({ email, password }).value();
  
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  
  res.json({
    success: true,
    token: `lowdb-token-${user.id}`,
    user: { ...user, password: undefined }
  });
});

app.listen(3001, () => console.log('LowDB server running on port 3001'));