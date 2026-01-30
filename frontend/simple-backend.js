// simple-backend.js - GUARANTEED WORKING
const express = require('express');
const app = express();

// Enable CORS for ALL origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

// Sample data
const tradingData = {
  users: [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      balance: 10000,
      status: 'active',
      role: 'user',
      createdAt: new Date()
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      balance: 25000,
      status: 'active',
      role: 'user',
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      balance: 15000,
      status: 'inactive',
      role: 'user',
      createdAt: new Date(Date.now() - 172800000)
    }
  ],
  trades: [
    {
      id: 1,
      userId: 1,
      symbol: 'BTC/USD',
      side: 'buy',
      quantity: 0.1,
      price: 45000,
      pnl: 250,
      status: 'open',
      timestamp: new Date()
    },
    {
      id: 2,
      userId: 2,
      symbol: 'ETH/USD',
      side: 'sell',
      quantity: 2,
      price: 3200,
      pnl: -120,
      status: 'closed',
      timestamp: new Date(Date.now() - 3600000)
    }
  ]
};

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Trading Platform Admin API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Dashboard endpoint
app.get('/api/admin/dashboard', (req, res) => {
  const stats = {
    totalUsers: tradingData.users.length,
    activeUsers: tradingData.users.filter(u => u.status === 'active').length,
    totalBalance: tradingData.users.reduce((sum, u) => sum + (u.balance || 0), 0),
    activeTrades: tradingData.trades.filter(t => t.status === 'open').length,
    dailyVolume: tradingData.trades
      .filter(t => new Date(t.timestamp) > new Date(Date.now() - 24*60*60*1000))
      .reduce((sum, t) => sum + (t.quantity * t.price), 0),
    totalPnl: tradingData.trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  };
  
  res.json({
    success: true,
    stats,
    message: 'Dashboard data loaded successfully'
  });
});

// Users endpoint
app.get('/api/admin/users', (req, res) => {
  res.json({
    success: true,
    users: tradingData.users,
    total: tradingData.users.length
  });
});

// Trades endpoint
app.get('/api/admin/trades', (req, res) => {
  res.json({
    success: true,
    trades: tradingData.trades,
    total: tradingData.trades.length
  });
});

// Seed data endpoint
app.post('/api/admin/seed-data', (req, res) => {
  res.json({
    success: true,
    message: 'Sample data is already loaded'
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'Admin API Server',
    endpoints: [
      'GET  /api/health',
      'GET  /api/admin/dashboard',
      'GET  /api/admin/users',
      'GET  /api/admin/trades',
      'POST /api/admin/seed-data'
    ]
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Admin API Server running on http://localhost:${PORT}`);
  console.log(`\n📊 Test these endpoints:`);
  console.log(`   http://localhost:${PORT}/api/health`);
  console.log(`   http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`\n✅ CORS enabled for ALL origins (*)`);
});