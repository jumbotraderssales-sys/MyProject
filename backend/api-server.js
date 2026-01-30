// backend/api-server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
app.use(cors());
app.use(express.json());

// Store trading data in memory (or connect to your main app's state)
let tradingData = {
  users: [],
  trades: [],
  orders: [],
  positions: [],
  marketData: {}
};

// API Routes for Admin Panel
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalUsers: tradingData.users.length,
      activeUsers: tradingData.users.filter(u => u.status === 'active').length,
      totalRealBalance: tradingData.users.reduce((sum, u) => sum + (u.realBalance || 0), 0),
      totalPaperBalance: tradingData.users.reduce((sum, u) => sum + (u.paperBalance || 0), 0),
      totalOrders: tradingData.orders.length,
      pendingOrders: tradingData.orders.filter(o => o.status === 'pending').length,
      totalDeposits: 0,
      pendingDeposits: 0,
      pendingWithdrawals: 0,
      lastUpdated: new Date()
    }
  });
});

app.get('/api/admin/users', (req, res) => {
  res.json({
    success: true,
    users: tradingData.users.map(user => ({
      id: user.id,
      name: user.name || `${user.firstName} ${user.lastName}`,
      email: user.email,
      accountStatus: user.status || 'active',
      realBalance: user.realBalance || 0,
      paperBalance: user.paperBalance || 0,
      role: user.role || 'user',
      createdAt: user.createdAt || new Date()
    })),
    count: tradingData.users.length
  });
});

app.get('/api/admin/orders', (req, res) => {
  res.json({
    success: true,
    orders: tradingData.orders.map(order => ({
      id: order.id,
      userName: tradingData.users.find(u => u.id === order.userId)?.name || 'Unknown',
      type: order.type,
      asset: order.symbol,
      amount: order.quantity,
      price: order.price,
      status: order.status,
      date: order.createdAt
    }))
  });
});

app.get('/api/admin/trades', (req, res) => {
  res.json({
    success: true,
    trades: tradingData.trades.map(trade => ({
      id: trade.id,
      userId: trade.userId,
      symbol: trade.symbol,
      side: trade.side,
      quantity: trade.quantity,
      entryPrice: trade.price,
      currentPrice: trade.currentPrice,
      pnl: trade.pnl,
      pnlPercentage: trade.pnlPercentage,
      status: trade.status,
      openedAt: trade.openedAt,
      closedAt: trade.closedAt
    }))
  });
});

app.get('/api/admin/positions', (req, res) => {
  const openPositions = tradingData.positions.filter(p => p.status === 'open');
  res.json({
    success: true,
    positions: openPositions.map(pos => ({
      id: pos.id,
      userId: pos.userId,
      symbol: pos.symbol,
      side: pos.side,
      quantity: pos.quantity,
      entryPrice: pos.entryPrice,
      currentPrice: pos.currentPrice,
      pnl: pos.pnl,
      pnlPercentage: pos.pnlPercentage,
      stopLoss: pos.stopLoss,
      takeProfit: pos.takeProfit,
      leverage: pos.leverage,
      openedAt: pos.openedAt
    }))
  });
});

// WebSocket setup for real-time updates
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws) => {
  console.log('Admin client connected');
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'subscribe') {
      // Send initial data
      ws.send(JSON.stringify({
        type: 'initial_data',
        data: {
          users: tradingData.users.length,
          trades: tradingData.trades.length,
          positions: tradingData.positions.length,
          totalVolume: tradingData.trades.reduce((sum, t) => sum + (t.quantity * t.price), 0)
        }
      }));
    }
  });
  
  // Send periodic updates
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'update',
        timestamp: new Date(),
        stats: {
          activeUsers: tradingData.users.filter(u => u.status === 'active').length,
          openPositions: tradingData.positions.filter(p => p.status === 'open').length,
          dailyVolume: tradingData.trades
            .filter(t => new Date(t.openedAt) > new Date(Date.now() - 24*60*60*1000))
            .reduce((sum, t) => sum + (t.quantity * t.price), 0)
        }
      }));
    }
  }, 5000);
  
  ws.on('close', () => {
    clearInterval(interval);
    console.log('Admin client disconnected');
  });
});

// Simulate data updates from main trading app
setInterval(() => {
  // In real app, this would come from your main trading app
  if (tradingData.users.length === 0) {
    // Add sample users
    tradingData.users = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: 'active',
        realBalance: 10000,
        paperBalance: 5000,
        role: 'user',
        createdAt: new Date(Date.now() - 7*24*60*60*1000)
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        status: 'active',
        realBalance: 15000,
        paperBalance: 8000,
        role: 'user',
        createdAt: new Date(Date.now() - 3*24*60*60*1000)
      }
    ];
  }
}, 10000);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Admin API server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:8081`);
});