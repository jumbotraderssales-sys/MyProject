// server.js - Paper2Real Trading Platform Backend
const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const DOLLAR_RATE = 90;

// ========== STARTUP VERIFICATION ==========
console.log('\n==========================================');
console.log('🚀 SERVER STARTING...');
console.log('📅 Time:', new Date().toISOString());
console.log('📂 Directory:', __dirname);
console.log('🌍 Node Version:', process.version);
console.log('==========================================\n');

const app = express();

// ========== MONGODB CONNECTION ==========
let isMongoConnected = false;
let UserModel, TradeModel, OrderModel, PaymentModel, WithdrawalModel, ReferralModel, SettingModel;

const MONGO_URI = "mongodb+srv://jumbotraderssales_db_user:rnNATQD0EBxIL4Ax@paper2real0.dsopqy5.mongodb.net/paper2real?retryWrites=true&w=majority&appName=Paper2real0";

const connectWithRetry = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });
    isMongoConnected = true;
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('🔄 Retrying in 5 seconds...');
    return false;
  }
};

(async function initDB() {
  let connected = false;
  while (!connected) {
    connected = await connectWithRetry();
    if (!connected) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
})();

// ========== SCHEMAS ==========
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, unique: true },
  password: String,
  realBalance: Number,
  paperBalance: Number,
  accountStatus: String,
  role: String,
  currentChallenge: String,
  createdAt: Date,
  lastLogin: Date,
  updatedAt: Date,
  bankAccount: mongoose.Schema.Types.Mixed,
  challengeStats: mongoose.Schema.Types.Mixed,
  referralCode: String,
  referredBy: String,
  referralCount: Number,
  referredUsers: [String],
  referralReward: mongoose.Schema.Types.Mixed
});

const tradeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String,
  userName: String,
  symbol: String,
  side: String,
  size: Number,
  leverage: Number,
  entryPrice: Number,
  stopLoss: Number,
  takeProfit: Number,
  status: String,
  positionValue: Number,
  marginUsed: Number,
  pnl: Number,
  currentPrice: Number,
  exitPrice: Number,
  closeReason: String,
  closedAt: Date,
  createdAt: Date,
  updatedAt: Date
});

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String,
  userName: String,
  symbol: String,
  side: String,
  size: Number,
  leverage: Number,
  entryPrice: Number,
  stopLoss: Number,
  takeProfit: Number,
  status: String,
  currentPrice: Number,
  positionValue: Number,
  marginUsed: Number,
  pnl: Number,
  exitPrice: Number,
  exitTime: Date,
  closeReason: String,
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
});

const paymentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String,
  userName: String,
  userEmail: String,
  challengeName: String,
  amount: Number,
  paymentMethod: String,
  transactionId: String,
  status: String,
  submittedAt: Date,
  notes: String,
  receiptUrl: String,
  processedAt: Date,
  processedBy: String,
  adminNotes: String,
  updatedAt: Date
});

const withdrawalSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String,
  userName: String,
  userEmail: String,
  amount: Number,
  status: String,
  bankName: String,
  accountNumber: String,
  accountHolderName: String,
  ifscCode: String,
  requestedAt: Date,
  transactionId: String,
  processedAt: Date,
  processedBy: String,
  notes: String,
  rejectionReason: String
});

const referralSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  referrerId: String,
  referredId: String,
  referredName: String,
  referredEmail: String,
  createdAt: Date,
  rewardClaimed: Boolean
});

const settingSchema = new mongoose.Schema({
  upiQrCode: String,
  upiId: String,
  merchantName: String,
  referralTarget: Number,
  referralRewardName: String,
  referralRewardAmount: Number,
  updatedAt: Date,
  updatedBy: String
});

// Create models
UserModel = mongoose.model('User', userSchema);
TradeModel = mongoose.model('Trade', tradeSchema);
OrderModel = mongoose.model('Order', orderSchema);
PaymentModel = mongoose.model('Payment', paymentSchema);
WithdrawalModel = mongoose.model('Withdrawal', withdrawalSchema);
ReferralModel = mongoose.model('Referral', referralSchema);
SettingModel = mongoose.model('Setting', settingSchema);

// ========== CORS CONFIGURATION ==========
app.use(cors({
  origin: [
    'https://paper2real.com',
    'https://www.paper2real.com',
    'https://admin.paper2real.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ========== CHALLENGE CONFIGURATION ==========
const CHALLENGES = {
  "🚀 Beginner Challenge": {
    id: 1,
    fee: "₹1,000",
    paperBalance: 20000,
    profitTarget: 10,
    dailyLossLimit: 4,
    maxLossLimit: 10,
    maxOrderSize: 20,
    maxLeverage: 10,
    autoStopLossTarget: 10,
    oneTradeAtTime: true,
    reward: "Fee Refund + Skill Reward (20% of paper profit)",
    color: "#22c55e"
  },
  "🟡 Intermediate Challenge": {
    id: 2,
    fee: "₹2,500",
    paperBalance: 50000,
    profitTarget: 10,
    dailyLossLimit: 4,
    maxLossLimit: 10,
    maxOrderSize: 20,
    maxLeverage: 10,
    autoStopLossTarget: 10,
    oneTradeAtTime: true,
    reward: "Fee Refund + Skill Reward (20% of paper profit)",
    color: "#eab308"
  },
  "🔴 PRO Challenge": {
    id: 3,
    fee: "₹5,000",
    paperBalance: 100000,
    profitTarget: 10,
    dailyLossLimit: 4,
    maxLossLimit: 10,
    maxOrderSize: 20,
    maxLeverage: 10,
    autoStopLossTarget: 10,
    oneTradeAtTime: true,
    reward: "Fee Refund + Skill Reward (20% of paper profit)",
    color: "#ef4444"
  }
};

// ========== FILE UPLOAD CONFIGURATION ==========
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Only images (JPEG, JPG, PNG, GIF) and PDF files are allowed!'));
    }
  }
});

app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
  }
}));

// ========== USER AUTH MIDDLEWARE ==========
const requireValidUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const users = await readUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      console.log(`🚫 Deleted user attempted access: ${userId}`);
      return res.status(401).json({ 
        success: false, 
        error: 'User account no longer exists',
        code: 'USER_DELETED'
      });
    }
    
    if (user.accountStatus !== 'active') {
      console.log(`🚫 Inactive user attempted access: ${userId} (status: ${user.accountStatus})`);
      return res.status(403).json({ 
        success: false, 
        error: 'User account is inactive',
        code: 'USER_INACTIVE'
      });
    }
    
    req.user = user;
    req.userId = userId;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication error' 
    });
  }
};

// ========== HELPER FUNCTIONS ==========
const readUsers = async () => {
  try {
    const users = await UserModel.find().lean();
    return users;
  } catch (error) {
    console.error('Error reading users from MongoDB:', error.message);
    throw error;
  }
};

const writeUsers = async (users) => {
  try {
    await UserModel.deleteMany({});
    await UserModel.insertMany(users);
    return true;
  } catch (error) {
    console.error('Error writing users to MongoDB:', error.message);
    throw error;
  }
};

const readTrades = async () => {
  try {
    const trades = await TradeModel.find().lean();
    return trades;
  } catch (error) {
    console.error('Error reading trades from MongoDB:', error.message);
    throw error;
  }
};

const writeTrades = async (trades) => {
  try {
    await TradeModel.deleteMany({});
    await TradeModel.insertMany(trades);
    return true;
  } catch (error) {
    console.error('Error writing trades to MongoDB:', error.message);
    throw error;
  }
};

const readOrders = async () => {
  try {
    const orders = await OrderModel.find().lean();
    return orders;
  } catch (error) {
    console.error('Error reading orders from MongoDB:', error.message);
    throw error;
  }
};

const writeOrders = async (orders) => {
  try {
    await OrderModel.deleteMany({});
    await OrderModel.insertMany(orders);
    return true;
  } catch (error) {
    console.error('Error writing orders to MongoDB:', error.message);
    throw error;
  }
};

const readPayments = async () => {
  try {
    const payments = await PaymentModel.find().lean();
    return payments;
  } catch (error) {
    console.error('Error reading payments from MongoDB:', error.message);
    throw error;
  }
};

const writePayments = async (payments) => {
  try {
    await PaymentModel.deleteMany({});
    await PaymentModel.insertMany(payments);
    return true;
  } catch (error) {
    console.error('Error writing payments to MongoDB:', error.message);
    throw error;
  }
};

const readWithdrawals = async () => {
  try {
    const withdrawals = await WithdrawalModel.find().lean();
    return withdrawals;
  } catch (error) {
    console.error('Error reading withdrawals from MongoDB:', error.message);
    throw error;
  }
};

const writeWithdrawals = async (withdrawals) => {
  try {
    await WithdrawalModel.deleteMany({});
    await WithdrawalModel.insertMany(withdrawals);
    return true;
  } catch (error) {
    console.error('Error writing withdrawals to MongoDB:', error.message);
    throw error;
  }
};

const readSettings = async () => {
  try {
    let settings = await SettingModel.findOne().lean();
    if (!settings) {
      settings = {
        upiQrCode: null,
        upiId: '7799191208-2@ybl',
        merchantName: 'Paper2Real Trading',
        referralTarget: 20,
        referralRewardName: 'Beginner Challenge',
        referralRewardAmount: 20000,
        updatedAt: new Date().toISOString()
      };
      await SettingModel.create(settings);
    }
    return settings;
  } catch (error) {
    console.error('Error reading settings from MongoDB:', error.message);
    throw error;
  }
};

const writeSettings = async (settings) => {
  try {
    await SettingModel.deleteMany({});
    await SettingModel.create(settings);
    return true;
  } catch (error) {
    console.error('Error writing settings to MongoDB:', error.message);
    throw error;
  }
};

const readReferrals = async () => {
  try {
    const referrals = await ReferralModel.find().lean();
    return referrals;
  } catch (error) {
    console.error('Error reading referrals from MongoDB:', error.message);
    throw error;
  }
};

const writeReferrals = async (referrals) => {
  try {
    await ReferralModel.deleteMany({});
    await ReferralModel.insertMany(referrals);
    return true;
  } catch (error) {
    console.error('Error writing referrals to MongoDB:', error.message);
    throw error;
  }
};

// ========== SHARED POSITION CLOSING FUNCTION ==========
const closePositionServerSide = async (positionId, exitPrice, reason) => {
  console.log(`\n🔴 EXECUTING CLOSE for position ${positionId} (${reason}) at $${exitPrice}`);
  
  try {
    const trades = await readTrades();
    const users = await readUsers();
    const orders = await readOrders();
    
    const tradeIndex = trades.findIndex(t => t.id === positionId);
    if (tradeIndex === -1) {
      console.log(`❌ Position ${positionId} not found`);
      return { success: false, error: 'Position not found' };
    }
    
    const trade = trades[tradeIndex];
    
    if (trade.status !== 'open') {
      console.log(`⚠️ Position ${positionId} is already closed (status: ${trade.status})`);
      return { success: false, error: 'Position already closed' };
    }
    
    const priceDiff = exitPrice - trade.entryPrice;
    let pnl;
    if (trade.side === 'long') {
      pnl = priceDiff * trade.size * trade.leverage;
    } else {
      pnl = -priceDiff * trade.size * trade.leverage;
    }
    
    const userIndex = users.findIndex(u => u.id === trade.userId);
    if (userIndex !== -1) {
      const user = users[userIndex];
      const marginINR = trade.marginUsed * DOLLAR_RATE;
      const pnlINR = pnl * DOLLAR_RATE;
      user.paperBalance += marginINR + pnlINR;
      
      if (!user.challengeStats) user.challengeStats = {};
      
      if (pnl > 0) {
        user.challengeStats.totalProfit = (user.challengeStats.totalProfit || 0) + pnl;
        user.challengeStats.currentProfit = (user.challengeStats.currentProfit || 0) + pnl;
      } else {
        user.challengeStats.totalLoss = (user.challengeStats.totalLoss || 0) + Math.abs(pnl);
      }
      
      user.updatedAt = new Date().toISOString();
    }
    
    trades[tradeIndex].status = 'closed';
    trades[tradeIndex].exitPrice = exitPrice;
    trades[tradeIndex].pnl = pnl;
    trades[tradeIndex].closeReason = reason;
    trades[tradeIndex].closedAt = new Date().toISOString();
    trades[tradeIndex].updatedAt = new Date().toISOString();
    
    const orderIndex = orders.findIndex(o => o.id === positionId);
    if (orderIndex !== -1) {
      orders[orderIndex].status = 'closed';
      orders[orderIndex].exitPrice = exitPrice;
      orders[orderIndex].pnl = pnl;
      orders[orderIndex].exitTime = new Date().toISOString();
      orders[orderIndex].closeReason = reason;
      orders[orderIndex].updatedAt = new Date().toISOString();
    }
    
    await writeTrades(trades);
    await writeUsers(users);
    await writeOrders(orders);
    
    console.log(`✅ Position ${positionId} closed successfully`);
    
    return { success: true, pnl };
    
  } catch (error) {
    console.error('❌ Error in closePositionServerSide:', error);
    return { success: false, error: error.message };
  }
};

// ========== WEBSOCKET SETUP (NO MANUAL UPGRADE HANDLER) ==========
// Create HTTP server from Express app
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });
const clients = new Map();

console.log('🔧 WebSocket server configured on path: /ws');

wss.on('connection', (ws, req) => {
  console.log('📱 New WebSocket client connected');
  
  const url = req.url || '';
  const urlParts = url.split('?');
  let userId = null;
  
  if (urlParts.length > 1) {
    const params = new URLSearchParams(urlParts[1]);
    userId = params.get('userId');
  }
  
  if (userId) {
    clients.set(userId, ws);
    console.log(`✅ User ${userId} registered for WebSocket`);
    
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      message: 'WebSocket connected successfully',
      userId: userId
    }));
  } else {
    console.log('⚠️ WebSocket connected without userId');
  }
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG' }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    if (userId) {
      clients.delete(userId);
      console.log(`📴 User ${userId} disconnected`);
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const notifyUser = (userId, data) => {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
    return true;
  }
  return false;
};

// ========== POSITION MONITORING ==========
let monitorInterval;

const monitorPositions = async () => {
  try {
    const trades = await readTrades();
    const openPositions = trades.filter(t => t.status === 'open');
    
    if (openPositions.length === 0) return;
    
    console.log(`🔍 Monitoring ${openPositions.length} positions...`);
    
    const symbols = [];
    openPositions.forEach(p => {
      if (!symbols.includes(p.symbol)) {
        symbols.push(p.symbol);
      }
    });
    
    const prices = {};
    for (const symbol of symbols) {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        if (response.ok) {
          const data = await response.json();
          prices[symbol] = parseFloat(data.price);
        }
      } catch (error) {
        console.error(`Failed to fetch ${symbol}:`, error.message);
      }
    }
    
    for (const position of openPositions) {
      const currentPrice = prices[position.symbol];
      if (!currentPrice) continue;
      
      let shouldClose = false;
      let closeReason = '';
      
      if (position.stopLoss) {
        if (position.side === 'long' && currentPrice <= position.stopLoss) {
          shouldClose = true;
          closeReason = 'STOP_LOSS';
        } else if (position.side === 'short' && currentPrice >= position.stopLoss) {
          shouldClose = true;
          closeReason = 'STOP_LOSS';
        }
      }
      
      if (position.takeProfit && !shouldClose) {
        if (position.side === 'long' && currentPrice >= position.takeProfit) {
          shouldClose = true;
          closeReason = 'TAKE_PROFIT';
        } else if (position.side === 'short' && currentPrice <= position.takeProfit) {
          shouldClose = true;
          closeReason = 'TAKE_PROFIT';
        }
      }
      
      if (shouldClose) {
        console.log(`🎯 Closing ${position.id} - ${closeReason}`);
        await closePositionServerSide(position.id, currentPrice, closeReason);
        
        // Send WebSocket notification
        const notification = {
          type: 'POSITION_CLOSED',
          data: {
            positionId: position.id,
            symbol: position.symbol,
            side: position.side,
            entryPrice: position.entryPrice,
            exitPrice: currentPrice,
            pnl: (currentPrice - position.entryPrice) * position.size * position.leverage * (position.side === 'long' ? 1 : -1),
            reason: closeReason,
            closedAt: new Date().toISOString()
          }
        };
        notifyUser(position.userId, notification);
      }
    }
  } catch (error) {
    console.error('Monitor error:', error);
  }
};

const startMonitoring = () => {
  console.log('🚀 Starting position monitor...');
  monitorInterval = setInterval(monitorPositions, 10000);
  setTimeout(monitorPositions, 2000);
};

startMonitoring();

process.on('SIGTERM', () => {
  if (monitorInterval) clearInterval(monitorInterval);
  process.exit(0);
});

process.on('SIGINT', () => {
  if (monitorInterval) clearInterval(monitorInterval);
  process.exit(0);
});

// ========== SERVER START ==========
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log('\n==========================================');
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📱 WebSocket server running on ws://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Storage: MongoDB (primary)`);
  console.log(`🌐 API URL: https://myproject1-d097.onrender.com`);
  console.log('==========================================\n');
  console.log('✅ WebSocket server ready - waiting for connections');
  console.log('✅ Position monitoring active');
  console.log('');
    console.log('👥 USER ENDPOINTS:');
  console.log('  POST /api/register             - User registration (with ref support)');
  console.log('  POST /api/login                - User login');
  console.log('  GET  /api/user/profile         - Get user profile');
  console.log('  GET  /api/user/referral        - Get user referral info (NEW)');
  console.log('  GET  /api/upi-qr               - Get UPI QR code');
  console.log('  GET  /api/withdrawals/history  - Get user withdrawal history');
  console.log('  PUT  /api/user/bank-account    - Update bank account');
  console.log('');
  console.log('🎯 CHALLENGE ENDPOINTS:');
  console.log('  GET  /api/challenges           - Get available challenges');
  console.log('  PUT  /api/challenge/status     - Update challenge status');
  console.log('');
  console.log('📈 TRADING ENDPOINTS (with Challenge Rules):');
  console.log('  POST /api/trades               - Create trade (with validation)');
  console.log('  GET  /api/trades/positions     - Get open positions');
  console.log('  POST /api/trades/:id/close     - Close a position');
  console.log('  POST /api/trades/:id/cancel    - Cancel an order');
  console.log('  PUT  /api/trades/:id/update-sltp - Update SL/TP');
  console.log('  GET  /api/trades/history       - Get order history');
  console.log('');
  console.log('💳 PAYMENT SYSTEM:');
  console.log('  POST /api/payments/request     - Submit payment for challenge');
  console.log('  GET  /api/payments             - Get user payments');
  console.log('  GET  /api/payments/stats       - Get payment statistics');
  console.log('  PUT  /api/payments/:id/status  - Update payment status');
  console.log('');
  console.log('🏦 WALLET MANAGEMENT:');
  console.log('  POST /api/admin/users/:id/wallet/add    - Add funds');
  console.log('  POST /api/admin/users/:id/wallet/deduct - Deduct funds');
  console.log('');
  console.log('💸 WITHDRAWAL ENDPOINTS:');
  console.log('  POST /api/withdrawals/request  - Submit withdrawal request');
  console.log('  GET  /api/withdrawals/history  - Get withdrawal history');
  console.log('  POST /api/admin/withdrawal/:id/approve - Approve withdrawal');
  console.log('  POST /api/admin/withdrawal/:id/reject  - Reject withdrawal');
  console.log('');
  console.log('👑 ADMIN ENDPOINTS:');
  console.log('  GET  /api/admin/users          - Get all users');
  console.log('  GET  /api/admin/trades         - Get all trades');
  console.log('  GET  /api/admin/orders         - Get all orders');
  console.log('  GET  /api/admin/stats          - Get platform statistics');
  console.log('  GET  /api/admin/payments       - Get all payments');
  console.log('  GET  /api/admin/withdrawals    - Get all withdrawals');
  console.log('  GET  /api/admin/upi-settings   - Get UPI settings');
  console.log('  POST /api/admin/upi-qr/upload  - Upload UPI QR code');
  console.log('  PUT  /api/admin/upi-settings   - Update UPI settings');
  console.log('  DELETE /api/admin/upi-qr       - Delete UPI QR code');
  console.log('');
  console.log('🎁 REFERRAL SYSTEM (NEW):');
  console.log('  GET  /api/admin/referrals           - Get all referral data');
  console.log('  GET  /api/admin/referral-settings   - Get referral settings');
  console.log('  PUT  /api/admin/referral-settings   - Update referral settings');
  console.log('  POST /api/admin/referrals/approve/:userId - Approve reward');
  console.log('');
  console.log('🌐 GENERAL ENDPOINTS:');
  console.log('  GET  /                         - API root');
  console.log('  GET  /api                      - API info');
  console.log('  GET  /api/test                 - Test endpoint');
  console.log('  GET  /api/health               - Health check');
  console.log('==========================================');
});
