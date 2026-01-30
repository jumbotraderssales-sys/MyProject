// backend-server.js - UPDATED WITH PROPER CORS
const express = require('express');
const cors = require('cors');

const app = express();

// Configure CORS properly
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  next();
});

app.use(express.json());

// Simulated database
let tradingData = {
  users: [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      balance: 10000,
      status: 'active',
      role: 'user',
      createdAt: new Date(Date.now() - 7*24*60*60*1000)
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      balance: 25000,
      status: 'active',
      role: 'user',
      createdAt: new Date(Date.now() - 3*24*60*60*1000)
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
      timestamp: new Date(Date.now() - 2*60*60*1000)
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
      timestamp: new Date(Date.now() - 5*60*60*1000)
    }
  ],
  orders: [],
  positions: []
};

// API Routes
app.get('/api/admin/dashboard', (req, res) => {
  console.log('Dashboard endpoint called from:', req.headers.origin);
  
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
    stats
  });
});

app.get('/api/admin/users', (req, res) => {
  console.log('Users endpoint called');
  
  res.json({
    success: true,
    users: tradingData.users.map(user => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
      email: user.email,
      status: user.status || 'active',
      balance: user.balance || 0,
      role: user.role || 'user',
      createdAt: user.createdAt
    })),
    total: tradingData.users.length
  });
});

app.get('/api/admin/trades', (req, res) => {
  console.log('Trades endpoint called');
  
  const { limit = 50, offset = 0 } = req.query;
  const trades = tradingData.trades.slice(offset, offset + limit);
  
  res.json({
    success: true,
    trades: trades.map(trade => ({
      id: trade.id,
      userId: trade.userId,
      symbol: trade.symbol,
      side: trade.side,
      quantity: trade.quantity,
      price: trade.price,
      pnl: trade.pnl,
      status: trade.status,
      timestamp: trade.timestamp
    })),
    total: tradingData.trades.length
  });
});

app.post('/api/admin/seed-data', (req, res) => {
  console.log('Seed data endpoint called');
  
  // Add more sample data
  tradingData.users.push({
    id: 3,
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@example.com',
    balance: 15000,
    status: 'active',
    role: 'user',
    createdAt: new Date()
  });
  
  tradingData.trades.push({
    id: 3,
    userId: 3,
    symbol: 'SOL/USD',
    side: 'buy',
    quantity: 5,
    price: 95,
    pnl: 175,
    status: 'open',
    timestamp: new Date()
  });
  
  res.json({ 
    success: true, 
    message: 'Sample data added',
    newUsers: 1,
    newTrades: 1
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/admin/dashboard',
      '/api/admin/users',
      '/api/admin/trades',
      '/api/admin/seed-data'
    ]
  });
});

const PORT = 3002
app.listen(PORT, () => {
  console.log(`🚀 Admin API server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`👥 Users: http://localhost:${PORT}/api/admin/users`);
  console.log(`💹 Trades: http://localhost:${PORT}/api/admin/trades`);
  console.log(`🔄 Health: http://localhost:${PORT}/api/health`);
  console.log(`\n✅ CORS enabled for: localhost:3000, localhost:3001, localhost:3002, localhost:3003`);
  console.log(`\n📝 To test API directly, open:`);
  console.log(`   http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`   in your browser or Postman`);
});