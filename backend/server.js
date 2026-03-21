// server.js - Paper2Real Trading Platform Backend (MongoDB backup, routes unchanged)
const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const mongoose = require('mongoose');
const WebSocket = require('ws');          
const http = require('http');
const DOLLAR_RATE = 90;

// ========== STARTUP VERIFICATION ==========
console.log('\n==========================================');
console.log('🚀 SERVER STARTING...');
console.log('📅 Time:', new Date().toISOString());
console.log('📂 Directory:', __dirname);
console.log('🌍 Node Version:', process.version);
console.log('==========================================\n');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ 
  server,
  // Add path to avoid conflict with HTTP routes
  path: '/ws'
});
const clients = new Map();


// Load environment variables
dotenv.config();


let UserModel, TradeModel, OrderModel, PaymentModel, WithdrawalModel, ReferralModel, SettingModel;

const MONGO_URI = "mongodb+srv://jumbotraderssales_db_user:rnNATQD0EBxIL4Ax@paper2real0.dsopqy5.mongodb.net/paper2real?retryWrites=true&w=majority&appName=Paper2real0";
// ========== WEBSOCKET CONNECTION HANDLER ==========
wss.on('connection', (ws, req) => {
  console.log('📱 New WebSocket client connected');
  
  // Extract userId from query string more reliably
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
    
    // Send confirmation
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      message: 'WebSocket connected successfully',
      userId: userId
    }));
  } else {
    console.log('⚠️ WebSocket connected without userId');
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'No userId provided'
    }));
  }
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 WebSocket message received:', data);
      
      // Handle ping messages to keep connection alive
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', (code, reason) => {
    console.log(`📴 WebSocket closed: ${code} - ${reason}`);
    if (userId) {
      clients.delete(userId);
      console.log(`User ${userId} removed from clients map`);
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Helper function to send notification to specific user
const notifyUser = (userId, data) => {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    try {
      client.send(JSON.stringify(data));
      console.log(`📱 Notification sent to user ${userId}`);
      return true;
    } catch (error) {
      console.error(`Error sending to user ${userId}:`, error);
      return false;
    }
  }
  return false;
};
// Helper function to broadcast to all users (admin use)
const broadcastToAll = (data) => {
  clients.forEach((client, userId) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Wait for MongoDB connection before starting server
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

// Keep trying until connected
(async function initDB() {
  let connected = false;
  while (!connected) {
    connected = await connectWithRetry();
    if (!connected) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
})();

// Define schemas
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
    'http://localhost:3002'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

// Handle preflight requests
app.options('*', cors());

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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


// Serve static files
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
  }
}));

// ========== HELPER FUNCTIONS ==========
const readUsers = async () => {
  try {
    const users = await UserModel.find().lean();
    return users;
  } catch (error) {
    console.error('Error reading users from MongoDB:', error.message);
    throw error; // Let the caller handle the error
  }
};
const writeUsers = async (users) => {
     try {
      await UserModel.deleteMany({});
      await UserModel.insertMany(users);
      return true;
    } catch (error) {
      console.error('Error writing users to MongoDB:',  error.message);
       throw error;
    }
  }
 

const readTrades = async () => {
    try {
      const trades = await TradeModel.find().lean();
      return trades;
    } catch (error) {
      console.error('Error reading trades from MongoDB:',  error.message);
       throw error;
    }
  }
 
const writeTrades = async (trades) => {
     try {
      await TradeModel.deleteMany({});
      await TradeModel.insertMany(trades);
      return true;
    } catch (error) {
      console.error('Error writing trades to MongoDB:',  error.message);
        throw error;
    }
  }
  
const readOrders = async () => {
     try {
      const orders = await OrderModel.find().lean();
      return orders;
    } catch (error) {
      console.error('Error reading orders from MongoDB:',  error.message);
        throw error;
    }
  }


const writeOrders = async (orders) => {
      try {
      await OrderModel.deleteMany({});
      await OrderModel.insertMany(orders);
      return true;
    } catch (error) {
      console.error('Error writing orders to MongoDB:',  error.message);
         throw error;
    }
  }
 
const readPayments = async () => {
    try {
      const payments = await PaymentModel.find().lean();
      return payments;
    } catch (error) {
      console.error('Error reading payments from MongoDB:',  error.message);
       throw error;
    }
  }

const writePayments = async (payments) => {
    try {
      await PaymentModel.deleteMany({});
      await PaymentModel.insertMany(payments);
      return true;
    } catch (error) {
      console.error('Error writing payments to MongoDB:',  error.message);
       throw error;
    }
  }
 
const readWithdrawals = async () => {
      try {
      const withdrawals = await WithdrawalModel.find().lean();
      return withdrawals;
    } catch (error) {
      console.error('Error reading withdrawals from MongoDB:',  error.message);
         throw error;
    }
  }

const writeWithdrawals = async (withdrawals) => {
    try {
      await WithdrawalModel.deleteMany({});
      await WithdrawalModel.insertMany(withdrawals);
      return true;
    } catch (error) {
      console.error('Error writing withdrawals to MongoDB:',  error.message);
       throw error;
    }
  }
 
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
      console.error('Error reading settings from MongoDB:',  error.message);
        throw error;
    }
  }
  
const writeSettings = async (settings) => {
      try {
      await SettingModel.deleteMany({});
      await SettingModel.create(settings);
      return true;
    } catch (error) {
      console.error('Error writing settings to MongoDB:',  error.message);
         throw error;
    }
  }


const readReferrals = async () => {
     try {
      const referrals = await ReferralModel.find().lean();
      return referrals;
    } catch (error) {
      console.error('Error reading referrals from MongoDB:',  error.message);
        throw error;
    }
  }
 
const writeReferrals = async (referrals) => {
    try {
      await ReferralModel.deleteMany({});
      await ReferralModel.insertMany(referrals);
      return true;
    } catch (error) {
      console.error('Error writing referrals to MongoDB:',  error.message);
       throw error;
    }
  }
 

// ========== ALL YOUR EXISTING ROUTES – UNCHANGED ==========
// (they all use the helpers above, so they now transparently use MongoDB when connected)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Paper2Real Trading Platform API',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      user: '/api/user/profile',
      auth: '/api/login, /api/register',
      challenges: '/api/challenges',
      trading: '/api/trades',
      payments: '/api/payments',
      withdrawals: '/api/withdrawals',
      admin: '/api/admin/*'
    }
  });
});

// API root
app.get('/api', (req, res) => {
  res.json({
    message: 'Paper2Real Trading Platform API',
    version: '1.1.0',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Paper2Real Trading Platform Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.1.0',
    features: ['Challenge System', 'Trading with Rules', 'UPI Payments', 'Withdrawals', 'Referral System']
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Backend is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========== USER MANAGEMENT ROUTES ==========

// Register route (POST) - UPDATED with referral support
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, ref } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }
    
    const users = await readUsers();
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already exists' 
      });
    }
    
    // Generate unique referral code
    const baseCode = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const random = Math.random().toString(36).substring(2, 8);
    let referralCode = `${baseCode}${random}`;
    while (users.some(u => u.referralCode === referralCode)) {
      referralCode = `${baseCode}${Math.random().toString(36).substring(2, 8)}`;
    }
    
    // Check if referred by someone
    let referredBy = null;
    if (ref) {
      const referrer = users.find(u => u.referralCode === ref);
      if (referrer) {
        referredBy = referrer.id;
      }
    }
    
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      realBalance: 0,
      paperBalance: 0,
      accountStatus: 'active',
      role: 'user',
      currentChallenge: null,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bankAccount: {
        accountNumber: '',
        accountHolder: '',
        bankName: '',
        ifscCode: '',
        upiId: ''
      },
      challengeStats: {
        startDate: null,
        dailyLoss: 0,
        totalLoss: 0,
        totalProfit: 0,
        currentProfit: 0,
        maxDrawdown: 0,
        tradesCount: 0,
        winRate: 0,
        status: 'not_started',
        dailyResetTime: null
      },
      referralCode,
      referredBy,
      referralCount: 0,
      referralReward: {
        awarded: false,
        awardedAt: null,
        rewardType: null,
        rewardName: null,
        approvedBy: null
      }
    };
    
    users.push(newUser);
    await writeUsers(users);
    
    // If referred, update referrer and create referral record
    if (referredBy) {
      const referrerIndex = users.findIndex(u => u.id === referredBy);
      if (referrerIndex !== -1) {
        users[referrerIndex].referralCount = (users[referrerIndex].referralCount || 0) + 1;
        if (!users[referrerIndex].referredUsers) users[referrerIndex].referredUsers = [];
        users[referrerIndex].referredUsers.push(newUser.id);
        users[referrerIndex].updatedAt = new Date().toISOString();
        await writeUsers(users);
        
        const referrals = await readReferrals();
        referrals.push({
          id: `REF${Date.now()}${Math.floor(Math.random()*1000)}`,
          referrerId: referredBy,
          referredId: newUser.id,
          referredName: newUser.name,
          referredEmail: newUser.email,
          createdAt: new Date().toISOString(),
          rewardClaimed: false
        });
        await writeReferrals(referrals);
      }
    }
    
    const userResponse = { ...newUser };
    delete userResponse.password;
    
    res.json({
      success: true,
      token: `token-${newUser.id}`,
      user: userResponse
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Register route (GET) - Handle browser GET requests
app.get('/api/register', (req, res) => {
  res.status(405).json({
    success: false,
    error: 'Method Not Allowed',
    message: 'Use POST method to register',
    example: {
      method: 'POST',
      url: '/api/register',
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'yourpassword'
      }
    }
  });
});

// Login route (POST)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }
    
    const users = await readUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }
    
    // Check if user exists and is active
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Account not found' 
      });
    }
    
    // Check if user is active
    if (user.accountStatus !== 'active') {
      return res.status(403).json({ 
        success: false, 
        error: 'Your account has been deactivated. Please contact support.',
        code: 'ACCOUNT_INACTIVE'
      });
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    await writeUsers(users);
    
    const userResponse = { ...user };
    delete userResponse.password;
    
    res.json({
      success: true,
      token: `token-${user.id}`,
      user: userResponse
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Login route (GET) - Handle browser GET requests
app.get('/api/login', (req, res) => {
  res.status(405).json({
    success: false,
    error: 'Method Not Allowed',
    message: 'Use POST method to login',
    example: {
      method: 'POST',
      url: '/api/login',
      body: {
        email: 'john@example.com',
        password: 'yourpassword'
      }
    }
  });
});

// Get user profile
app.get('/api/user/profile', requireValidUser, async (req, res) => {
  try {
    const userResponse = { ...req.user };
    delete userResponse.password;
    
    res.json({
      success: true,
      user: userResponse
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
// Alternative user endpoint
app.get('/api/user', requireValidUser, async (req, res) => {
  try {
    const userResponse = { ...req.user };
    delete userResponse.password;
    
    res.json({
      success: true,
      user: userResponse
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
// Update user profile
app.put('/api/user/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const { name, email } = req.body;
    
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Update user fields
    if (name) users[userIndex].name = name;
    if (email) {
      // Check if email is already taken by another user
      const emailExists = users.some(u => u.email === email && u.id !== userId);
      if (emailExists) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email already in use' 
        });
      }
      users[userIndex].email = email;
    }
    
    users[userIndex].updatedAt = new Date().toISOString();
    
    await writeUsers(users);
    
    const userResponse = { ...users[userIndex] };
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update user bank account
app.put('/api/user/bank-account', requireValidUser, async (req, res) => {
  try {
    const { bankAccount } = req.body;
    const userId = req.userId;
    
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    users[userIndex].bankAccount = bankAccount;
    users[userIndex].updatedAt = new Date().toISOString();
    
    await writeUsers(users);
    
    const userResponse = { ...users[userIndex] };
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Bank account updated successfully',
      user: userResponse
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
// ========== NEW USER REFERRAL INFO ENDPOINT ==========
app.get('/api/user/referral', requireValidUser, async (req, res) => {
  try {
    const userId = req.userId;
    const user = req.user;
    
    const referrals = await readReferrals();
    const referredUsers = referrals
      .filter(r => r.referrerId === userId)
      .map(r => ({
        id: r.referredId,
        name: r.referredName,
        email: r.referredEmail,
        joinedAt: r.createdAt
      }));
    
    const settings = await readSettings();
    
    res.json({
      success: true,
      referralCode: user.referralCode,
      referralCount: user.referralCount || 0,
      referredUsers,
      rewardAwarded: user.referralReward?.awarded || false,
      rewardAwardedAt: user.referralReward?.awardedAt || null,
      target: settings.referralTarget || 20,
      rewardName: settings.referralRewardName || 'Beginner Challenge',
      rewardAmount: settings.referralRewardAmount || 20000
    });
    
  } catch (error) {
    console.error('Error fetching referral info:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
// ========== CHALLENGE MANAGEMENT ROUTES ==========

// Get available challenges
app.get('/api/challenges', (req, res) => {
  try {
    res.json({
      success: true,
      challenges: Object.values(CHALLENGES)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update challenge status
app.put('/api/challenge/status', requireValidUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { status, reason } = req.body;
    
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (!users[userIndex].currentChallenge) {
      return res.status(400).json({ 
        success: false, 
        error: 'User does not have an active challenge' 
      });
    }
    
    users[userIndex].challengeStats.status = status;
    if (reason) {
      users[userIndex].challengeStats.endReason = reason;
    }
    users[userIndex].updatedAt = new Date().toISOString();
    
    await writeUsers(users);
    
    const userResponse = { ...users[userIndex] };
    delete userResponse.password;
    
    res.json({
      success: true,
      message: `Challenge status updated to ${status}`,
      user: userResponse
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
// ========== TRADING SYSTEM ROUTES ==========

// Validate trade against challenge rules
const validateTrade = (user, tradeData) => {
  if (!user.currentChallenge || user.paperBalance === 0) {
    return { valid: false, error: 'Please purchase a challenge to start trading' };
  }
  
  const challenge = CHALLENGES[user.currentChallenge];
  if (!challenge) {
    return { valid: false, error: 'Invalid challenge configuration' };
  }
  
  // Check challenge status
  if (user.challengeStats.status !== 'active') {
    return { 
      valid: false, 
      error: `Challenge ${user.challengeStats.status}. Cannot trade.` 
    };
  }
  
  // Check one trade at a time
  if (challenge.oneTradeAtTime) {
    // This check should be done by checking open positions
    // For now, we'll rely on frontend validation for this
  }
  
  // Check max order size (20% of capital)
  const currentPrice = tradeData.entryPrice;
  const orderValue = currentPrice * tradeData.size;
  const maxOrderValue = (user.paperBalance * challenge.maxOrderSize) / 100;
  
  if (orderValue > maxOrderValue) {
    return { 
      valid: false, 
      error: `Order exceeds maximum size (${challenge.maxOrderSize}% of capital)` 
    };
  }
  
  // Check leverage limit
  if (tradeData.leverage > challenge.maxLeverage) {
    return { 
      valid: false, 
      error: `Leverage exceeds maximum (${challenge.maxLeverage}x)` 
    };
  }
  
  // Calculate margin required
  const margin = orderValue / tradeData.leverage;
  
  // Check if user has enough paper balance for margin
  if (margin > user.paperBalance) {
    return { 
      valid: false, 
      error: 'Insufficient margin. Reduce order size or increase leverage.' 
    };
  }
  
  // Calculate auto SL and TP if not provided (10% of order value)
  let stopLoss = tradeData.stopLoss;
  let takeProfit = tradeData.takeProfit;
  
  if (!stopLoss) {
    const slPercentage = challenge.autoStopLossTarget / 100;
    stopLoss = tradeData.side === 'LONG' 
      ? currentPrice * (1 - slPercentage)
      : currentPrice * (1 + slPercentage);
  }
  
  if (!takeProfit) {
    const tpPercentage = challenge.autoStopLossTarget / 100;
    takeProfit = tradeData.side === 'LONG'
      ? currentPrice * (1 + tpPercentage)
      : currentPrice * (1 - tpPercentage);
  }
  
  return { 
    valid: true, 
    marginRequired: margin,
    stopLoss,
    takeProfit
  };
};

// Create a new trade with challenge validation (POST)
app.post('/api/trades', requireValidUser, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const { symbol, side, size, leverage, entryPrice, stopLoss, takeProfit } = req.body;
    
    if (!symbol || !side || !size || !leverage || !entryPrice) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    const users = await readUsers();
    const trades = await readTrades();
    const orders = await readOrders();
    
    // Find user
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const user = users[userIndex];
    
    // Validate trade against challenge rules
    const tradeData = {
      symbol,
      side: side.toUpperCase(),
      size: parseFloat(size),
      leverage: parseInt(leverage),
      entryPrice: parseFloat(entryPrice),
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null
    };
    
    const validation = validateTrade(user, tradeData);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: validation.error 
      });
    }
    
    // Use auto SL/TP from validation if not provided
    if (!tradeData.stopLoss && validation.stopLoss) {
      tradeData.stopLoss = validation.stopLoss;
    }
    
    if (!tradeData.takeProfit && validation.takeProfit) {
      tradeData.takeProfit = validation.takeProfit;
    }
    
    // Calculate position value and margin
    const positionValue = tradeData.entryPrice * tradeData.size * tradeData.leverage;
    const marginRequired = validation.marginRequired;
    
    // Check if user has enough paper balance for margin
    if (user.paperBalance < marginRequired) {
      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient paper balance for margin requirement' 
      });
    }
    
    // Deduct margin from paper balance
   const marginINR = marginRequired * DOLLAR_RATE;
user.paperBalance -= marginINR;
    
    // Update challenge stats
    user.challengeStats.tradesCount += 1;
    user.updatedAt = new Date().toISOString();
    
    // Create new trade
    const newTrade = {
      id: Date.now().toString(),
      userId,
      userName: user.name,
      symbol,
      side: tradeData.side.toLowerCase(),
      size: tradeData.size,
      leverage: tradeData.leverage,
      entryPrice: tradeData.entryPrice,
      stopLoss: tradeData.stopLoss,
      takeProfit: tradeData.takeProfit,
      status: 'open',
      positionValue,
      marginUsed: marginRequired,
      pnl: 0,
      currentPrice: tradeData.entryPrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Create order entry
    const newOrder = {
      id: newTrade.id,
      userId,
      userName: user.name,
      symbol,
      side: newTrade.side,
      size: newTrade.size,
      leverage: newTrade.leverage,
      entryPrice: newTrade.entryPrice,
      stopLoss: newTrade.stopLoss,
      takeProfit: newTrade.takeProfit,
      status: 'open',
      currentPrice: newTrade.entryPrice,
      positionValue: newTrade.positionValue,
      marginUsed: marginRequired,
      pnl: 0,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    trades.push(newTrade);
    orders.push(newOrder);
    
    // Save all data
    await writeUsers(users);
    await writeTrades(trades);
    await writeOrders(orders);
    
    const userResponse = { ...user };
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Trade created successfully',
      trade: newTrade,
      order: newOrder,
      newBalance: user.paperBalance,
      user: userResponse,
      marginRequired
    });
    
  } catch (error) {
    console.error('Error creating trade:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all trades for user (GET)
app.get('/api/trades', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const trades = await readTrades();
    
    const userTrades = trades.filter(t => t.userId === userId);
    
    res.json({
      success: true,
      message: 'Use /api/trades/positions for open positions or /api/trades/history for order history',
      trades: userTrades,
      count: userTrades.length
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get user positions
app.get('/api/trades/positions', requireValidUser, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const trades = await readTrades();
    
    const userPositions = trades.filter(t => t.userId === userId && t.status === 'open');
    
    res.json({
      success: true,
      positions: userPositions,
      count: userPositions.length
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== SHARED POSITION CLOSING FUNCTION ==========
// This function is used by all close operations (manual, auto, frontend-requested)
const closePositionServerSide = async (positionId, exitPrice, reason) => {
  console.log(`\n🔴 EXECUTING CLOSE for position ${positionId} (${reason}) at $${exitPrice}`);
  
  try {
    // Read all data
    const trades = await readTrades();
    const users = await readUsers();
    const orders = await readOrders();
    
    // Find the trade
    const tradeIndex = trades.findIndex(t => t.id === positionId);
    if (tradeIndex === -1) {
      console.log(`❌ Position ${positionId} not found`);
      return { success: false, error: 'Position not found' };
    }
    
    const trade = trades[tradeIndex];
    
    // Check if already closed
    if (trade.status !== 'open') {
      console.log(`⚠️ Position ${positionId} is already closed (status: ${trade.status})`);
      return { success: false, error: 'Position already closed' };
    }
    
    console.log(`📊 Closing trade:`, {
      id: trade.id,
      userId: trade.userId,
      symbol: trade.symbol,
      side: trade.side,
      entry: trade.entryPrice,
      exit: exitPrice,
      size: trade.size,
      leverage: trade.leverage
    });
    
    // Calculate PnL
    const priceDiff = exitPrice - trade.entryPrice;
    let pnl;
    if (trade.side === 'long') {
      pnl = priceDiff * trade.size * trade.leverage;
    } else {
      pnl = -priceDiff * trade.size * trade.leverage;
    }
    
    console.log(`💰 Calculated PnL: $${pnl.toFixed(2)}`);
    
    // Find and update user
    const userIndex = users.findIndex(u => u.id === trade.userId);
    if (userIndex !== -1) {
      const user = users[userIndex];
      const oldBalance = user.paperBalance;
      
      // Return margin + PnL to paper balance
      const marginINR = trade.marginUsed * DOLLAR_RATE;
      const pnlINR = pnl * DOLLAR_RATE;
      user.paperBalance += marginINR + pnlINR;
      
      console.log(`👤 User ${user.name}: ₹${oldBalance} → ₹${user.paperBalance}`);
      
      // Update challenge stats
      if (!user.challengeStats) user.challengeStats = {};
      
      if (pnl > 0) {
        user.challengeStats.totalProfit = (user.challengeStats.totalProfit || 0) + pnl;
        user.challengeStats.currentProfit = (user.challengeStats.currentProfit || 0) + pnl;
      } else {
        user.challengeStats.totalLoss = (user.challengeStats.totalLoss || 0) + Math.abs(pnl);
      }
      
      // Update win rate
      const userTrades = trades.filter(t => t.userId === trade.userId);
      const closedTrades = userTrades.filter(t => t.status === 'closed').length + 1;
      const winningTrades = userTrades.filter(t => t.status === 'closed' && t.pnl > 0).length + (pnl > 0 ? 1 : 0);
      user.challengeStats.winRate = closedTrades > 0 ? (winningTrades / closedTrades) * 100 : 0;
      
      user.updatedAt = new Date().toISOString();
    }
    
    // Update trade
    trades[tradeIndex].status = 'closed';
    trades[tradeIndex].exitPrice = exitPrice;
    trades[tradeIndex].pnl = pnl;
    trades[tradeIndex].closeReason = reason;
    trades[tradeIndex].closedAt = new Date().toISOString();
    trades[tradeIndex].updatedAt = new Date().toISOString();
    
    // Update order
    const orderIndex = orders.findIndex(o => o.id === positionId);
    if (orderIndex !== -1) {
      orders[orderIndex].status = 'closed';
      orders[orderIndex].exitPrice = exitPrice;
      orders[orderIndex].pnl = pnl;
      orders[orderIndex].exitTime = new Date().toISOString();
      orders[orderIndex].closeReason = reason;
      orders[orderIndex].updatedAt = new Date().toISOString();
    }
    
    // Save all changes
    await writeTrades(trades);
    await writeUsers(users);
    await writeOrders(orders);
    
 console.log(`✅ Position ${positionId} closed successfully`);

// Send WebSocket notification to user
if (trade && trade.userId) {
  const notification = {
    type: 'POSITION_CLOSED',
    data: {
      positionId: trade.id,
      symbol: trade.symbol,
      side: trade.side,
      entryPrice: trade.entryPrice,
      exitPrice: exitPrice,
      pnl: pnl,
      reason: reason,
      closedAt: new Date().toISOString()
    }
  };
  
  const sent = notifyUser(trade.userId, notification);
  if (sent) {
    console.log(`📱 WebSocket notification sent to user ${trade.userId}`);
  }
}

return { success: true, pnl };
    
  } catch (error) {
    console.error('❌ Error in closePositionServerSide:', error);
    return { success: false, error: error.message };
  }
};

// ========== POSITION CLOSING ENDPOINTS ==========

// NEW ENDPOINT: Check and close position (called by frontend when it detects SL/TP)
app.post('/api/trades/:id/check-close', requireValidUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { exitPrice, reason } = req.body;
    const userId = req.userId;
    
    console.log(`🔍 Frontend requested close for ${id} (${reason}) at $${exitPrice}`);
    
    // Call the server-side close function
    const result = await closePositionServerSide(id, exitPrice, reason);
    
    if (result.success) {
      // Get updated user data to return
      const users = await readUsers();
      const user = users.find(u => u.id === userId);
      const userResponse = { ...user };
      delete userResponse.password;
      
      res.json({
        success: true,
        message: 'Position closed successfully',
        pnl: result.pnl,
        user: userResponse
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to close position'
      });
    }
    
  } catch (error) {
    console.error('Error in check-close:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// UPDATED: Close a position with challenge stats update (now uses shared function)
app.post('/api/trades/:id/close', requireValidUser, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const { id } = req.params;
    const { exitPrice, closeReason } = req.body;
    
    console.log(`📝 Manual close requested for ${id} (${closeReason}) by user ${userId}`);
    
    // Call the server-side close function
    const result = await closePositionServerSide(id, exitPrice, closeReason || 'manual');
    
    if (result.success) {
      // Get updated user data to return
      const users = await readUsers();
      const user = users.find(u => u.id === userId);
      const userResponse = { ...user };
      delete userResponse.password;
      
      res.json({
        success: true,
        message: 'Position closed successfully',
        pnl: result.pnl,
        user: userResponse
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to close position'
      });
    }
    
  } catch (error) {
    console.error('Error closing position:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cancel an order
app.post('/api/trades/:id/cancel', requireValidUser, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const { id } = req.params;
    
    const trades = await readTrades();
    const users = await readUsers();
    const orders = await readOrders();
    
    // Find the trade/order
    const tradeIndex = trades.findIndex(t => t.id === id && t.userId === userId);
    const orderIndex = orders.findIndex(o => o.id === id && o.userId === userId);
    
    if (tradeIndex === -1 && orderIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Return margin to user's paper balance if it's an open position
    if (tradeIndex !== -1 && trades[tradeIndex].status === 'open') {
      users[userIndex].paperBalance += trades[tradeIndex].marginUsed;
      users[userIndex].updatedAt = new Date().toISOString();
      
      // Update trade status
      trades[tradeIndex].status = 'cancelled';
      trades[tradeIndex].updatedAt = new Date().toISOString();
    }
    
    // Update order status
    if (orderIndex !== -1) {
      orders[orderIndex].status = 'cancelled';
      orders[orderIndex].updatedAt = new Date().toISOString();
    }
    
    // Save data
    await writeTrades(trades);
    await writeUsers(users);
    await writeOrders(orders);
    
    const userResponse = { ...users[userIndex] };
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      newBalance: users[userIndex].paperBalance,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update SL/TP for a position
app.put('/api/trades/:id/update-sltp', requireValidUser, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const { id } = req.params;
    const { stopLoss, takeProfit } = req.body;
    
    const trades = await readTrades();
    const orders = await readOrders();
    
    // Update in trades
    const tradeIndex = trades.findIndex(t => t.id === id && t.userId === userId);
    if (tradeIndex !== -1) {
      if (stopLoss !== undefined) {
        trades[tradeIndex].stopLoss = parseFloat(stopLoss);
      }
      if (takeProfit !== undefined) {
        trades[tradeIndex].takeProfit = parseFloat(takeProfit);
      }
      trades[tradeIndex].updatedAt = new Date().toISOString();
    }
    
    // Update in orders
    const orderIndex = orders.findIndex(o => o.id === id && o.userId === userId);
    if (orderIndex !== -1) {
      if (stopLoss !== undefined) {
        orders[orderIndex].stopLoss = parseFloat(stopLoss);
      }
      if (takeProfit !== undefined) {
        orders[orderIndex].takeProfit = parseFloat(takeProfit);
      }
      orders[orderIndex].updatedAt = new Date().toISOString();
    }
    
    // Save data
    await writeTrades(trades);
    await writeOrders(orders);
    
    res.json({
      success: true,
      message: 'SL/TP updated successfully',
      stopLoss,
      takeProfit
    });
    
  } catch (error) {
    console.error('Error updating SL/TP:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get user order history
app.get('/api/trades/history', requireValidUser, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const orders = await readOrders();
    
    const userOrders = orders.filter(o => o.userId === userId);
    
    res.json({
      success: true,
      orders: userOrders,
      count: userOrders.length
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== PAYMENT SYSTEM ROUTES ==========

// Submit payment request for challenge
app.post('/api/payments/request', requireValidUser, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const { challengeName, amount, paymentMethod, transactionId, notes } = req.body;
    
    if (!challengeName || !amount || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    // Validate challenge
    if (!CHALLENGES[challengeName]) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid challenge name' 
      });
    }
    
    const users = await readUsers();
    const payments = await readPayments();
    
    // Find user
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const user = users[userIndex];
    
    // Check if user already has a pending payment for this challenge
    const existingPending = payments.find(p => 
      p.userId === userId && 
      p.challengeName === challengeName && 
      p.status === 'pending'
    );
    
    if (existingPending) {
      return res.status(400).json({ 
        success: false, 
        error: 'You already have a pending payment for this challenge' 
      });
    }
    
    // Create payment request
    const newPayment = {
      id: `PAY${Date.now()}`,
      userId,
      userName: user.name,
      userEmail: user.email,
      challengeName,
      amount: parseFloat(amount),
      paymentMethod,
      transactionId: transactionId || `TXN${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      notes: notes || `Payment for ${challengeName} challenge`,
      receiptUrl: '',
      processedAt: null,
      processedBy: null,
      adminNotes: null,
      updatedAt: new Date().toISOString()
    };
    
    payments.push(newPayment);
    await writePayments(payments);
    
    res.json({
      success: true,
      message: 'Payment request submitted successfully',
      payment: newPayment
    });
    
  } catch (error) {
    console.error('Error submitting payment:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Payment submission failed' 
    });
  }
});

// Get all payments for user
app.get('/api/payments', requireValidUser, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const payments = await readPayments();
    
    const userPayments = payments.filter(p => p.userId === userId);
    
    // Sort by latest first
    userPayments.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    res.json({
      success: true,
      payments: userPayments,
      count: userPayments.length
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get payment statistics
app.get('/api/payments/stats', async (req, res) => {
  try {
    const payments = await readPayments();
    
    const stats = {
      total: payments.length,
      pending: payments.filter(p => p.status === 'pending').length,
      approved: payments.filter(p => p.status === 'approved' || p.status === 'completed').length,
      rejected: payments.filter(p => p.status === 'rejected').length,
      totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0)
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting payment stats:', error);
    res.status(500).json({ error: 'Failed to get payment statistics' });
  }
});

// Update payment status (approve/reject)
app.put('/api/payments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, processedBy } = req.body;
    
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid status is required (approved/rejected/pending)' 
      });
    }
    
    const payments = await readPayments();
    const users = await readUsers();
    
    const paymentIndex = payments.findIndex(p => p.id === id);
    if (paymentIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment not found' 
      });
    }
    
    const payment = payments[paymentIndex];
    
    // Update payment
    payments[paymentIndex].status = status;
    payments[paymentIndex].processedAt = new Date().toISOString();
    payments[paymentIndex].processedBy = processedBy || 'admin';
    payments[paymentIndex].adminNotes = notes || '';
    payments[paymentIndex].updatedAt = new Date().toISOString();
    
    // If approved, add paper money to user and set challenge
    if (status === 'approved') {
      const userIndex = users.findIndex(u => u.id === payment.userId);
      if (userIndex !== -1) {
        const challenge = CHALLENGES[payment.challengeName];
        
        // Update user challenge and paper balance
        users[userIndex].currentChallenge = payment.challengeName;
        users[userIndex].paperBalance = challenge.paperBalance;
        
        // Initialize challenge stats
        users[userIndex].challengeStats = {
          startDate: new Date().toISOString(),
          dailyLoss: 0,
          totalLoss: 0,
          totalProfit: 0,
          currentProfit: 0,
          maxDrawdown: 0,
          tradesCount: 0,
          winRate: 0,
          status: 'active',
          dailyResetTime: new Date().toISOString()
        };
        
        users[userIndex].updatedAt = new Date().toISOString();
      }
    }
    
    // Save all data
    await writePayments(payments);
    await writeUsers(users);
    
    res.json({
      success: true,
      message: `Payment ${status} successfully`,
      payment: payments[paymentIndex]
    });
    
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== UPI QR CODE MANAGEMENT ==========

// Get UPI settings
app.get('/api/admin/upi-settings', async (req, res) => {
  try {
    const settings = await readSettings();
    
    let qrCodeUrl = null;
    if (settings.upiQrCode) {
      const qrFilePath = path.join(uploadsDir, settings.upiQrCode);
      if (fsSync.existsSync(qrFilePath)) {
        qrCodeUrl = `/uploads/${settings.upiQrCode}`;
      } else {
        settings.upiQrCode = null;
        await writeSettings(settings);
      }
    }
    
    res.json({
      success: true,
      settings: {
        ...settings,
        qrCodeUrl: qrCodeUrl
      }
    });
  } catch (error) {
    console.error('Error fetching UPI settings:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Upload UPI QR code
app.post('/api/admin/upi-qr/upload', upload.single('qrImage'), async (req, res) => {
  try {
    const { upiId, merchantName } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }
    
    if (!upiId) {
      return res.status(400).json({ 
        success: false, 
        error: 'UPI ID is required' 
      });
    }
    
    const settings = await readSettings();
    
    // Delete old QR code if exists
    if (settings.upiQrCode) {
      try {
        const oldFilePath = path.join(uploadsDir, settings.upiQrCode);
        if (fsSync.existsSync(oldFilePath)) {
          await fs.unlink(oldFilePath);
        }
      } catch (error) {
        console.error('Error deleting old QR code:', error.message);
      }
    }
    
    // Update settings
    settings.upiQrCode = req.file.filename;
    settings.upiId = upiId;
    if (merchantName) settings.merchantName = merchantName;
    settings.updatedAt = new Date().toISOString();
    
    await writeSettings(settings);
    
    res.json({
      success: true,
      message: 'UPI QR code uploaded successfully',
      settings: {
        ...settings,
        qrCodeUrl: `/uploads/${req.file.filename}`
      }
    });
    
  } catch (error) {
    console.error('Error uploading UPI QR code:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get UPI QR code for payment
app.get('/api/upi-qr', async (req, res) => {
  try {
    const settings = await readSettings();
    
    let qrCodeUrl = null;
    if (settings.upiQrCode) {
      const qrFilePath = path.join(uploadsDir, settings.upiQrCode);
      if (fsSync.existsSync(qrFilePath)) {
        qrCodeUrl = `/uploads/${settings.upiQrCode}`;
      }
    }
    
    res.json({
      success: true,
      qrCodeUrl: qrCodeUrl,
      upiId: settings.upiId,
      merchantName: settings.merchantName,
      updatedAt: settings.updatedAt
    });
    
  } catch (error) {
    console.error('Error fetching UPI QR code:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update UPI settings without QR
app.put('/api/admin/upi-settings', async (req, res) => {
  try {
    const { upiId, merchantName } = req.body;
    const settings = await readSettings();
    
    if (upiId) settings.upiId = upiId;
    if (merchantName) settings.merchantName = merchantName;
    settings.updatedAt = new Date().toISOString();
    
    await writeSettings(settings);
    
    res.json({
      success: true,
      message: 'UPI settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating UPI settings:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete UPI QR code
app.delete('/api/admin/upi-qr', async (req, res) => {
  try {
    const settings = await readSettings();
    
    if (settings.upiQrCode) {
      try {
        const oldFilePath = path.join(uploadsDir, settings.upiQrCode);
        if (fsSync.existsSync(oldFilePath)) {
          await fs.unlink(oldFilePath);
        }
      } catch (error) {
        console.error('Error deleting QR code:', error.message);
      }
    }
    
    settings.upiQrCode = null;
    settings.updatedAt = new Date().toISOString();
    
    await writeSettings(settings);
    
    res.json({
      success: true,
      message: 'UPI QR code deleted successfully',
      settings
    });
  } catch (error) {
    console.error('Error deleting UPI QR code:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== WITHDRAWAL MANAGEMENT ROUTES ==========

// Create withdrawal request
app.post('/api/withdrawals/request', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const { amount, bankName, accountNumber, accountHolderName, ifscCode } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid amount is required' 
      });
    }
    
    if (!bankName || !accountNumber || !accountHolderName || !ifscCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'All bank details are required' 
      });
    }
    
    const users = await readUsers();
    const withdrawals = await readWithdrawals();
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const user = users[userIndex];
    const withdrawalAmount = parseFloat(amount);
    
    // Check if user has enough real balance
    if (user.realBalance < withdrawalAmount) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient real balance. Available: ₹${user.realBalance}, Requested: ₹${withdrawalAmount}` 
      });
    }
    
    // Check minimum withdrawal amount
    if (withdrawalAmount < 500) {
      return res.status(400).json({ 
        success: false, 
        error: 'Minimum withdrawal amount is ₹500' 
      });
    }
    
    // Create withdrawal request
    const newWithdrawal = {
      id: `WD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      userId: userId,
      userName: user.name,
      userEmail: user.email,
      amount: withdrawalAmount,
      status: 'pending',
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolderName: accountHolderName.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      requestedAt: new Date().toISOString(),
      transactionId: null,
      processedAt: null,
      processedBy: null,
      notes: null,
      rejectionReason: null
    };
    
    // Add to withdrawals array
    withdrawals.push(newWithdrawal);
    
    // Write withdrawals first
    await writeWithdrawals(withdrawals);
    
    // Deduct from user's real balance
    user.realBalance -= withdrawalAmount;
    user.updatedAt = new Date().toISOString();
    
    // Update users file
    await writeUsers(users);
    
    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal: newWithdrawal,
      newBalance: user.realBalance
    });
    
  } catch (error) {
    console.error('Error in withdrawal request:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// Get user withdrawal history
app.get('/api/withdrawals/history', requireValidUser, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const withdrawals = await readWithdrawals();
    
    const userWithdrawals = withdrawals.filter(w => w.userId === userId);
    userWithdrawals.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    
    res.json({
      success: true,
      withdrawals: userWithdrawals,
      count: userWithdrawals.length
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== ADMIN ENDPOINTS ==========

// Simple admin check middleware
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    console.log('Admin auth token:', token);
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    const userId = token.replace('token-', '');
    console.log('User ID extracted:', userId);
    const users = await readUsers();
    const user = users.find(u => u.id === userId);
    console.log('User found:', user ? user.email : 'not found');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    req.userId = userId;
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// ========== ENHANCED REFERRAL SYSTEM WITH COMMISSIONS ==========

// Get user referral dashboard data
app.get('/api/user/referral-dashboard', async (req, res) => {
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
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const referrals = await readReferrals();
    const payments = await readPayments();
    const withdrawals = await readWithdrawals();
    const settings = await readSettings();
    
    // Get referred users with their transaction details
    const referredUsers = await Promise.all(referrals
      .filter(r => r.referrerId === userId)
      .map(async (r) => {
        const referredUser = users.find(u => u.id === r.referredId) || {};
        
        // Get user's challenge purchases
        const userPayments = payments.filter(p => 
          p.userId === r.referredId && p.status === 'approved'
        );
        
        // Calculate commission from challenge fees (10%)
        const challengeCommission = userPayments.reduce((sum, p) => {
          return sum + (p.amount * 0.10); // 10% commission
        }, 0);
        
        // Check if user has funded account and withdrawals
        const userWithdrawals = withdrawals.filter(w => 
          w.userId === r.referredId && w.status === 'approved' && w.isFundedWithdrawal
        );
        
        // Calculate commission from funded withdrawals (10%)
        const fundedCommission = userWithdrawals.reduce((sum, w) => {
          return sum + (w.amount * 0.10); // 10% commission
        }, 0);
        
        return {
          id: r.referredId,
          name: referredUser.name || 'Unknown',
          email: referredUser.email || 'No email',
          joinedAt: r.createdAt,
          challengePurchases: userPayments.length,
          challengeCommission,
          fundedWithdrawals: userWithdrawals.length,
          fundedCommission,
          totalCommission: challengeCommission + fundedCommission,
          lastActivity: userPayments[0]?.submittedAt || userWithdrawals[0]?.requestedAt || r.createdAt
        };
      }));
    
    // Calculate total commissions
    const totalChallengeCommission = referredUsers.reduce((sum, u) => sum + u.challengeCommission, 0);
    const totalFundedCommission = referredUsers.reduce((sum, u) => sum + u.fundedCommission, 0);
    const totalEarned = totalChallengeCommission + totalFundedCommission;
    
    // Get withdrawal history for this user's commissions
    const commissionWithdrawals = withdrawals.filter(w => 
      w.userId === userId && w.type === 'commission' && w.status === 'approved'
    );
    
    const totalWithdrawn = commissionWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const pendingWithdrawals = withdrawals.filter(w => 
      w.userId === userId && w.type === 'commission' && w.status === 'pending'
    ).length;
    
    // Calculate available balance
    const availableBalance = totalEarned - totalWithdrawn;
    
    // Get pending commissions (users who haven't triggered commission yet)
    const pendingCommissions = referredUsers.filter(u => u.totalCommission === 0).length;
    
    // Calculate monthly stats
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const monthlyEarnings = referredUsers.reduce((sum, u) => {
      const joinDate = new Date(u.joinedAt);
      if (joinDate.getMonth() === thisMonth && joinDate.getFullYear() === thisYear) {
        return sum + u.totalCommission;
      }
      return sum;
    }, 0);
    
    res.json({
      success: true,
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL || 'https://paper2real.com'}/?ref=${user.referralCode}`,
      stats: {
        totalReferrals: referredUsers.length,
        activeReferrals: referredUsers.filter(u => u.totalCommission > 0).length,
        pendingReferrals: pendingCommissions,
        totalEarned,
        totalChallengeCommission,
        totalFundedCommission,
        availableBalance,
        totalWithdrawn,
        pendingWithdrawals,
        monthlyEarnings,
        commissionRate: 10 // 10% on all transactions
      },
      referredUsers,
      commissionWithdrawals: commissionWithdrawals.map(w => ({
        id: w.id,
        amount: w.amount,
        status: w.status,
        requestedAt: w.requestedAt,
        processedAt: w.processedAt,
        transactionId: w.transactionId,
        rejectionReason: w.rejectionReason
      })),
      settings: {
        target: settings.referralTarget || 20,
        rewardName: settings.referralRewardName || 'Beginner Challenge',
        rewardAmount: settings.referralRewardAmount || 20000,
        commissionRate: 10
      }
    });
    
  } catch (error) {
    console.error('Error fetching referral dashboard:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Request commission withdrawal
app.post('/api/user/referral/withdraw', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const { amount, bankDetails } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid amount is required' 
      });
    }
    
    if (amount < 500) {
      return res.status(400).json({ 
        success: false, 
        error: 'Minimum withdrawal amount is ₹500' 
      });
    }
    
    const users = await readUsers();
    const withdrawals = await readWithdrawals();
    const referrals = await readReferrals();
    const payments = await readPayments();
    
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Calculate available balance
    const referredUsers = referrals.filter(r => r.referrerId === userId);
    
    let totalEarned = 0;
    for (const ref of referredUsers) {
      const userPayments = payments.filter(p => 
        p.userId === ref.referredId && p.status === 'approved'
      );
      totalEarned += userPayments.reduce((sum, p) => sum + (p.amount * 0.10), 0);
    }
    
    const approvedWithdrawals = withdrawals.filter(w => 
      w.userId === userId && w.type === 'commission' && w.status === 'approved'
    );
    const totalWithdrawn = approvedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const availableBalance = totalEarned - totalWithdrawn;
    
    if (amount > availableBalance) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient balance. Available: ₹${availableBalance}` 
      });
    }
    
    // Create withdrawal request
    const newWithdrawal = {
      id: `WD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      userId,
      userName: user.name,
      userEmail: user.email,
      amount: parseFloat(amount),
      type: 'commission',
      status: 'pending',
      bankDetails: bankDetails || user.bankAccount,
      requestedAt: new Date().toISOString(),
      processedAt: null,
      processedBy: null,
      transactionId: null,
      rejectionReason: null
    };
    
    withdrawals.push(newWithdrawal);
    await writeWithdrawals(withdrawals);
    
    res.json({
      success: true,
      message: 'Commission withdrawal request submitted successfully',
      withdrawal: newWithdrawal,
      remainingBalance: availableBalance - amount
    });
    
  } catch (error) {
    console.error('Error processing commission withdrawal:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Admin: Get all referral commissions
app.get('/api/admin/referral-commissions', requireAdmin, async (req, res) => {
  try {
    const users = await readUsers();
    const referrals = await readReferrals();
    const payments = await readPayments();
    const withdrawals = await readWithdrawals();
    
    const commissionData = await Promise.all(users.map(async (user) => {
      const userReferrals = referrals.filter(r => r.referrerId === user.id);
      
      let totalEarned = 0;
      let pendingCommission = 0;
      let paidCommission = 0;
      
      for (const ref of userReferrals) {
        const userPayments = payments.filter(p => 
          p.userId === ref.referredId && p.status === 'approved'
        );
        const commission = userPayments.reduce((sum, p) => sum + (p.amount * 0.10), 0);
        totalEarned += commission;
      }
      
      const userWithdrawals = withdrawals.filter(w => 
        w.userId === user.id && w.type === 'commission'
      );
      
      paidCommission = userWithdrawals
        .filter(w => w.status === 'approved')
        .reduce((sum, w) => sum + w.amount, 0);
      
      pendingCommission = userWithdrawals
        .filter(w => w.status === 'pending')
        .reduce((sum, w) => sum + w.amount, 0);
      
      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        referralCount: userReferrals.length,
        activeReferrals: userReferrals.filter(r => {
          const hasPayment = payments.some(p => 
            p.userId === r.referredId && p.status === 'approved'
          );
          return hasPayment;
        }).length,
        totalEarned,
        paidCommission,
        pendingCommission,
        availableBalance: totalEarned - paidCommission,
        lastWithdrawal: userWithdrawals[0]?.requestedAt || null
      };
    }));
    
    // Sort by total earned
    commissionData.sort((a, b) => b.totalEarned - a.totalEarned);
    
    res.json({
      success: true,
      commissions: commissionData,
      summary: {
        totalUsers: users.length,
        usersWithReferrals: commissionData.filter(c => c.referralCount > 0).length,
        totalEarnedAll: commissionData.reduce((sum, c) => sum + c.totalEarned, 0),
        totalPaidAll: commissionData.reduce((sum, c) => sum + c.paidCommission, 0),
        totalPendingAll: commissionData.reduce((sum, c) => sum + c.pendingCommission, 0)
      }
    });
    
  } catch (error) {
    console.error('Error fetching referral commissions:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== PERMANENT USER STATUS MANAGEMENT ==========

// Update user account status (Permanent - saves to database/files)
app.put('/api/admin/users/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { accountStatus } = req.body;
    
    console.log(`🔄 Updating user ${userId} status to: ${accountStatus}`);
    
    if (!accountStatus || !['active', 'inactive', 'suspended'].includes(accountStatus)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid account status is required (active/inactive/suspended)' 
      });
    }
    
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === userId || u._id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Update user status
    users[userIndex].accountStatus = accountStatus;
    users[userIndex].status = accountStatus; // Update both fields for compatibility
    users[userIndex].updatedAt = new Date().toISOString();
    
    // Save to database/file
    await writeUsers(users);
    
    // Also update in MongoDB if connected
    if (isMongoConnected) {
      try {
        await UserModel.updateOne(
          { id: userId },
          { 
            accountStatus: accountStatus,
            status: accountStatus,
            updatedAt: new Date().toISOString()
          }
        );
        console.log('✅ MongoDB updated for user status');
      } catch (mongoError) {
        console.error('❌ MongoDB update failed:', mongoError.message);
      }
    }
    
    console.log(`✅ User ${userId} status updated to ${accountStatus} permanently`);
    
    const userResponse = { ...users[userIndex] };
    delete userResponse.password;
    
    res.json({
      success: true,
      message: `User status updated to ${accountStatus} permanently`,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Permanently delete user
app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`🗑️ Attempting to permanently delete user: ${userId}`);
    
    // Read all data
    const users = await readUsers();
    const trades = await readTrades();
    const orders = await readOrders();
    const payments = await readPayments();
    const withdrawals = await readWithdrawals();
    const referrals = await readReferrals();
    
    // Find user
    const userIndex = users.findIndex(u => u.id === userId || u._id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const user = users[userIndex];
    
    // Filter out all user data
    const updatedUsers = users.filter(u => u.id !== userId && u._id !== userId);
    const updatedTrades = trades.filter(t => t.userId !== userId);
    const updatedOrders = orders.filter(o => o.userId !== userId);
    const updatedPayments = payments.filter(p => p.userId !== userId);
    const updatedWithdrawals = withdrawals.filter(w => w.userId !== userId);
    const updatedReferrals = referrals.filter(r => r.referrerId !== userId && r.referredId !== userId);
    
    // Save all filtered data
    await writeUsers(updatedUsers);
    await writeTrades(updatedTrades);
    await writeOrders(updatedOrders);
    await writePayments(updatedPayments);
    await writeWithdrawals(updatedWithdrawals);
    await writeReferrals(updatedReferrals);
    
    // Also delete from MongoDB if connected
    if (isMongoConnected) {
      try {
        await UserModel.deleteOne({ id: userId });
        await TradeModel.deleteMany({ userId });
        await OrderModel.deleteMany({ userId });
        await PaymentModel.deleteMany({ userId });
        await WithdrawalModel.deleteMany({ userId });
        await ReferralModel.deleteMany({ 
          $or: [{ referrerId: userId }, { referredId: userId }] 
        });
        console.log('✅ MongoDB records deleted');
      } catch (mongoError) {
        console.error('❌ MongoDB deletion failed:', mongoError.message);
      }
    }
    
    console.log(`✅ User ${user.name} (${user.email}) permanently deleted`);
    console.log(`   Removed: ${users.length - updatedUsers.length} user, ${trades.length - updatedTrades.length} trades, ${orders.length - updatedOrders.length} orders, ${payments.length - updatedPayments.length} payments`);
    
    res.json({
      success: true,
      message: `User ${user.name} has been permanently deleted`,
      deletedUser: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all users (for admin panel)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await readUsers();
    
    const sanitizedUsers = users.map(user => {
      const userCopy = { ...user };
      delete userCopy.password;
      
      return {
        id: userCopy.id || '',
        name: userCopy.name || 'Unknown',
        email: userCopy.email || '',
        accountStatus: userCopy.accountStatus || 'inactive',
        realBalance: userCopy.realBalance || 0,
        paperBalance: userCopy.paperBalance || 0,
        currentChallenge: userCopy.currentChallenge || 'No Challenge',
        createdAt: userCopy.createdAt || new Date().toISOString(),
        ...userCopy
      };
    });
    
    res.json(sanitizedUsers);
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json([]);
  }
});

// Get user by ID (for admin)
app.get('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await readUsers();
    
    const user = users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userResponse = { ...user };
    delete userResponse.password;
    
    res.json(userResponse);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user account status
app.put('/api/admin/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { accountStatus } = req.body;
    
    if (!accountStatus || !['active', 'suspended', 'inactive'].includes(accountStatus)) {
      return res.status(400).json({ error: 'Valid account status is required' });
    }
    
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    users[userIndex].accountStatus = accountStatus;
    users[userIndex].updatedAt = new Date().toISOString();
    
    await writeUsers(users);
    
    const userResponse = { ...users[userIndex] };
    delete userResponse.password;
    
    res.json({
      success: true,
      message: `User status updated to ${accountStatus}`,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Add funds to user wallet
app.post('/api/admin/users/:id/wallet/add', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, notes } = req.body; // type: 'real' or 'paper'
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }
    
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (type === 'real') {
      users[userIndex].realBalance += parseFloat(amount);
    } else if (type === 'paper') {
      users[userIndex].paperBalance += parseFloat(amount);
    } else {
      return res.status(400).json({ error: 'Invalid type (must be real or paper)' });
    }
    
    users[userIndex].updatedAt = new Date().toISOString();
    
    await writeUsers(users);
    
    res.json({
      success: true,
      message: `Added ${amount} to ${type} balance`,
      user: users[userIndex]
    });
  } catch (error) {
    console.error('Error adding to wallet:', error);
    res.status(500).json({ error: 'Failed to add funds' });
  }
});

// Admin deduct wallet
app.post('/api/admin/users/:id/wallet/deduct', async (req, res) => {
  try {
    const userId = req.params.id;
    let { amount, type } = req.body; // type = "paper" or "real"

    amount = Number(amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    const users = await readUsers();
    const userIndex = users.findIndex(u => String(u.id) === String(userId));

    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = users[userIndex];

    // Ensure fields exist
    user.paperBalance = Number(user.paperBalance || 0);
    user.realBalance = Number(user.realBalance || 0);

    if (type === 'paper') {
      if (user.paperBalance < amount) {
        return res.status(400).json({ success: false, error: 'Insufficient paper balance' });
      }
      user.paperBalance -= amount;
    } else {
      // default = real balance
      if (user.realBalance < amount) {
        return res.status(400).json({ success: false, error: 'Insufficient real balance' });
      }
      user.realBalance -= amount;
    }

    users[userIndex] = user;
    await writeUsers(users);

    res.json({
      success: true,
      message: `Funds deducted from ${type === 'paper' ? 'paper balance' : 'real balance'}`,
      user
    });

  } catch (error) {
    console.error('Deduct error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all trades (for admin panel)
app.get('/api/admin/trades', async (req, res) => {
  try {
    const trades = await readTrades();
    
    const normalizedTrades = trades.map(trade => ({
      id: trade.id || '',
      userId: trade.userId || '',
      userName: trade.userName || 'Unknown',
      symbol: trade.symbol || 'N/A',
      side: trade.side ? trade.side.toLowerCase() : 'long',
      quantity: trade.size || 0,
      size: trade.size || 0,
      price: trade.entryPrice || 0,
      entryPrice: trade.entryPrice || 0,
      currentPrice: trade.currentPrice || trade.entryPrice || 0,
      pnl: trade.pnl || 0,
      status: (trade.status || 'unknown').toLowerCase(),
      createdAt: trade.createdAt || trade.timestamp || '',
      openedAt: trade.createdAt || trade.timestamp || '',
      ...trade
    }));
    
    res.json(normalizedTrades);
    
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json([]);
  }
});

// Get all orders (for admin panel)
app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await readOrders();
    
    const normalizedOrders = orders.map(order => ({
      id: order.id || '',
      userId: order.userId || '',
      userName: order.userName || 'Unknown',
      symbol: order.symbol || 'N/A',
      side: order.side || 'buy',
      size: order.size || 0,
      entryPrice: order.entryPrice || 0,
      currentPrice: order.currentPrice || 0,
      pnl: order.pnl || 0,
      status: order.status || 'open',
      createdAt: order.createdAt || order.timestamp || '',
      ...order
    }));
    
    res.json(normalizedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json([]);
  }
});

// Get platform statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    const users = await readUsers();
    const trades = await readTrades();
    const payments = await readPayments();
    const withdrawals = await readWithdrawals();
    
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.accountStatus === 'active').length,
      totalTrades: trades.length,
      openTrades: trades.filter(t => t.status === 'open').length,
      totalPayments: payments.length,
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      totalWithdrawals: withdrawals.length,
      pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length,
      totalRealBalance: users.reduce((sum, user) => sum + (user.realBalance || 0), 0),
      totalPaperBalance: users.reduce((sum, user) => sum + (user.paperBalance || 0), 0),
      activeChallenges: users.filter(u => u.currentChallenge).length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all payments (for admin panel)
app.get('/api/admin/payments', async (req, res) => {
  try {
    const payments = await readPayments();
    
    // Sort by latest first
    const sortedPayments = payments.sort((a, b) => 
      new Date(b.submittedAt) - new Date(a.submittedAt)
    );
    
    res.json(sortedPayments);
    
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json([]);
  }
});

// Get all withdrawals (for admin panel)
app.get('/api/admin/withdrawals', async (req, res) => {
  try {
    const { status } = req.query;
    let withdrawals = await readWithdrawals();
    
    // Filter by status if provided
    if (status && status !== 'all') {
      withdrawals = withdrawals.filter(w => w.status === status);
    }
    
    // Sort by latest first
    withdrawals.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    
    res.json(withdrawals);
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json([]);
  }
});

// Get all deposits (for admin panel)
app.get('/api/admin/deposits', async (req, res) => {
  try {
    // Since you don't have a deposits file, return empty array
    res.json([]);
  } catch (error) {
    console.error('Error fetching deposits:', error);
    res.status(500).json([]);
  }
});

// Approve withdrawal
app.post('/api/admin/withdrawal/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Transaction ID is required' 
      });
    }
    
    const withdrawals = await readWithdrawals();
    
    const withdrawalIndex = withdrawals.findIndex(w => w.id === id);
    if (withdrawalIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Withdrawal not found' 
      });
    }
    
    const withdrawal = withdrawals[withdrawalIndex];
    
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Withdrawal is not pending' 
      });
    }
    
    // Update withdrawal status
    withdrawals[withdrawalIndex].status = 'approved';
    withdrawals[withdrawalIndex].transactionId = transactionId;
    withdrawals[withdrawalIndex].processedAt = new Date().toISOString();
    withdrawals[withdrawalIndex].processedBy = 'admin';
    withdrawals[withdrawalIndex].notes = 'Approved and processed';
    
    await writeWithdrawals(withdrawals);
    
    res.json({
      success: true,
      message: 'Withdrawal approved successfully',
      withdrawal: withdrawals[withdrawalIndex]
    });
    
  } catch (error) {
    console.error('Error approving withdrawal:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Reject withdrawal
app.post('/api/admin/withdrawal/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ 
        success: false, 
        error: 'Rejection reason is required' 
      });
    }
    
    const withdrawals = await readWithdrawals();
    const users = await readUsers();
    
    const withdrawalIndex = withdrawals.findIndex(w => w.id === id);
    if (withdrawalIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Withdrawal not found' 
      });
    }
    
    const withdrawal = withdrawals[withdrawalIndex];
    
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Withdrawal is not pending' 
      });
    }
    
    // Update withdrawal status
    withdrawals[withdrawalIndex].status = 'rejected';
    withdrawals[withdrawalIndex].rejectionReason = reason;
    withdrawals[withdrawalIndex].processedAt = new Date().toISOString();
    withdrawals[withdrawalIndex].processedBy = 'admin';
    withdrawals[withdrawalIndex].notes = 'Rejected by admin';
    
    // Return money to user's real balance
    const userIndex = users.findIndex(u => u.id === withdrawal.userId);
    if (userIndex !== -1) {
      users[userIndex].realBalance += withdrawal.amount;
      users[userIndex].updatedAt = new Date().toISOString();
      await writeUsers(users);
    }
    
    await writeWithdrawals(withdrawals);
    
    res.json({
      success: true,
      message: 'Withdrawal rejected successfully',
      withdrawal: withdrawals[withdrawalIndex]
    });
    
  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== NEW ADMIN REFERRAL ENDPOINTS ==========

// Get all users with referral data (admin only)
app.get('/api/admin/referrals', requireAdmin, async (req, res) => {
  try {
    const users = await readUsers();
    const referrals = await readReferrals();
    
    const data = users.map(user => {
      const userReferrals = referrals.filter(r => r.referrerId === user.id);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referralCount: user.referralCount || 0,
        referredUsers: userReferrals.map(r => ({
          id: r.referredId,
          name: r.referredName,
          email: r.referredEmail,
          joinedAt: r.createdAt
        })),
        rewardAwarded: user.referralReward?.awarded || false,
        rewardAwardedAt: user.referralReward?.awardedAt || null,
        rewardName: user.referralReward?.rewardName || null,
        role: user.role
      };
    });
    
    res.json({ success: true, users: data });
  } catch (error) {
    console.error('Error fetching referral users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get referral settings (admin only)
app.get('/api/admin/referral-settings', requireAdmin, async (req, res) => {
  try {
    const settings = await readSettings();
    res.json({
      success: true,
      settings: {
        referralTarget: settings.referralTarget || 20,
        referralRewardName: settings.referralRewardName || 'Beginner Challenge',
        referralRewardAmount: settings.referralRewardAmount || 20000
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update referral settings (admin only)
app.put('/api/admin/referral-settings', requireAdmin, async (req, res) => {
  try {
    const { referralTarget, referralRewardName, referralRewardAmount } = req.body;
    const settings = await readSettings();
    
    if (referralTarget !== undefined) settings.referralTarget = parseInt(referralTarget);
    if (referralRewardName !== undefined) settings.referralRewardName = referralRewardName;
    if (referralRewardAmount !== undefined) settings.referralRewardAmount = parseFloat(referralRewardAmount);
    
    settings.updatedAt = new Date().toISOString();
    settings.updatedBy = req.userId; // from middleware
    
    await writeSettings(settings);
    
    res.json({
      success: true,
      message: 'Referral settings updated',
      settings: {
        referralTarget: settings.referralTarget,
        referralRewardName: settings.referralRewardName,
        referralRewardAmount: settings.referralRewardAmount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve referral reward for a user (admin only)
app.post('/api/admin/referrals/approve/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.userId;
    
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const user = users[userIndex];
    
    // Check if already awarded
    if (user.referralReward?.awarded) {
      return res.json({ success: false, error: 'Reward already awarded' });
    }
    
    const settings = await readSettings();
    const target = settings.referralTarget || 20;
    const rewardName = settings.referralRewardName || 'Beginner Challenge';
    const rewardAmount = settings.referralRewardAmount || 20000;
    
    if ((user.referralCount || 0) < target) {
      return res.json({ 
        success: false, 
        error: `User has only ${user.referralCount} referrals, need ${target}` 
      });
    }
    
    // Grant reward: add paper balance and set current challenge
    user.paperBalance = (user.paperBalance || 0) + rewardAmount;
    user.currentChallenge = rewardName;
    user.referralReward = {
      awarded: true,
      awardedAt: new Date().toISOString(),
      rewardType: 'challenge',
      rewardName: rewardName,
      approvedBy: adminId
    };
    
    // Initialize challenge stats if needed
    if (!user.challengeStats) {
      user.challengeStats = {
        startDate: new Date().toISOString(),
        dailyLoss: 0,
        totalLoss: 0,
        totalProfit: 0,
        currentProfit: 0,
        maxDrawdown: 0,
        tradesCount: 0,
        winRate: 0,
        status: 'active',
        dailyResetTime: new Date().toISOString()
      };
    } else {
      user.challengeStats.status = 'active';
      user.challengeStats.startDate = new Date().toISOString();
    }
    
    user.updatedAt = new Date().toISOString();
    
    await writeUsers(users);
    
    res.json({
      success: true,
      message: `Reward approved and granted: ${rewardName}`,
      user: {
        id: user.id,
        name: user.name,
        paperBalance: user.paperBalance,
        currentChallenge: user.currentChallenge,
        referralReward: user.referralReward
      }
    });
    
  } catch (error) {
    console.error('Error approving referral reward:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// ========== TEST ENDPOINTS ==========
// SIMPLE TEST ENDPOINT - Add this to verify server is running
app.get('/api/ping', (req, res) => {
  console.log('📡 Ping received at', new Date().toISOString());
  res.json({ 
    success: true, 
    message: 'Server is running',
    time: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// MANUAL MONITOR TEST - Call this to force a monitoring cycle
app.get('/api/force-monitor', async (req, res) => {
  console.log('🔧 Manual monitoring triggered at', new Date().toISOString());
  try {
    await monitorPositions();
    res.json({ 
      success: true, 
      message: 'Monitoring cycle complete',
      time: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Force monitor error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== SERVE REACT APP (with WebSocket exclusion) ==========
// Serve static files from the React build folder
const frontendBuildPath = path.join(__dirname, '../frontend/build');
if (fsSync.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  
  // For any request that doesn't match an API route, send index.html
  // Exclude WebSocket endpoint
  app.get('*', (req, res, next) => {
    // Skip WebSocket endpoint - let it be handled by WebSocket server
    if (req.path === '/ws' || req.path.startsWith('/ws?')) {
      return next();
    }
    // For all other routes, serve index.html
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  console.log('⚠️ Frontend build folder not found at:', frontendBuildPath);
  console.log('📱 WebSocket will still work, but React app may not load');
}
// ========== ERROR HANDLING ==========

// Handle 404
app.use((req, res) => {
  console.error(`404 - Endpoint not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Endpoint not found',
    requestedUrl: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!',
    message: err.message
  });
});

// ========== SIMPLE SERVER-SIDE POSITION MONITORING ==========
console.log('🔧 Setting up position monitoring...');

let monitorInterval;

const monitorPositions = async () => {
  try {
    const trades = await readTrades();
    const openPositions = trades.filter(t => t.status === 'open');
    
    if (openPositions.length === 0) return;
    
    console.log(`🔍 Monitoring ${openPositions.length} positions...`);
    
    // Get unique symbols
    const symbols = [];
    openPositions.forEach(p => {
      if (!symbols.includes(p.symbol)) {
        symbols.push(p.symbol);
      }
    });
    
    // Fetch prices
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
    
    // Check each position
    for (const position of openPositions) {
      const currentPrice = prices[position.symbol];
      if (!currentPrice) continue;
      
      let shouldClose = false;
      let closeReason = '';
      
      // Check STOP LOSS
      if (position.stopLoss) {
        if (position.side === 'long' && currentPrice <= position.stopLoss) {
          shouldClose = true;
          closeReason = 'STOP_LOSS';
        } else if (position.side === 'short' && currentPrice >= position.stopLoss) {
          shouldClose = true;
          closeReason = 'STOP_LOSS';
        }
      }
      
      // Check TAKE PROFIT
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
      }
    }
  } catch (error) {
    console.error('Monitor error:', error);
  }
};

// Start monitoring
const startMonitoring = () => {
  console.log('🚀 Starting position monitor...');
  monitorInterval = setInterval(monitorPositions, 10000);
  setTimeout(monitorPositions, 2000);
};

startMonitoring();

// Cleanup
process.on('SIGTERM', () => {
  if (monitorInterval) clearInterval(monitorInterval);
  process.exit(0);
});

process.on('SIGINT', () => {
  if (monitorInterval) clearInterval(monitorInterval);
  process.exit(0);
});
console.log('✅ Monitoring setup complete, about to start server...');

// ========== SERVER START ==========
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('\n==========================================');
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📱 WebSocket server running on ws://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Storage: MongoDB (primary)`);
  console.log(`🌐 API URL: https://myproject1-d097.onrender.com`);
  console.log('==========================================\n');
 
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
