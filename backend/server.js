// server.js - Paper2Real Trading Platform Backend (Complete Updated Version)
const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const app = express();

// Load environment variables
dotenv.config();

// ========== CORS CONFIGURATION ==========
app.use(cors({
  origin: [
    'https://myproject-frontend1.onrender.com',
    'https://myproject-admin1.onrender.com',
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

// ========== FILE PATHS ==========
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const TRADES_FILE = path.join(__dirname, 'data', 'trades.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');
const TRANSACTIONS_FILE = path.join(__dirname, 'data', 'transactions.json');
const PAYMENTS_FILE = path.join(__dirname, 'data', 'payments.json');
const DEPOSITS_FILE = path.join(__dirname, 'data', 'deposits.json');
const WITHDRAWALS_FILE = path.join(__dirname, 'data', 'withdrawals.json');
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');

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

// ========== CREATE DIRECTORIES ==========
const createDirectories = async () => {
  const dirs = [
    path.join(__dirname, 'data'),
    path.join(__dirname, 'public', 'uploads')
  ];
  
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }
};

// Initialize directories
createDirectories();

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
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error.message);
    return [];
  }
};

const writeUsers = async (users) => {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users:', error.message);
    return false;
  }
};

const readTrades = async () => {
  try {
    const data = await fs.readFile(TRADES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading trades:', error.message);
    return [];
  }
};

const writeTrades = async (trades) => {
  try {
    await fs.writeFile(TRADES_FILE, JSON.stringify(trades, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing trades:', error.message);
    return false;
  }
};

const readOrders = async () => {
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading orders:', error.message);
    return [];
  }
};

const writeOrders = async (orders) => {
  try {
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing orders:', error.message);
    return false;
  }
};

const readPayments = async () => {
  try {
    const data = await fs.readFile(PAYMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading payments:', error.message);
    return [];
  }
};

const writePayments = async (payments) => {
  try {
    await fs.writeFile(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing payments:', error.message);
    return false;
  }
};

const readWithdrawals = async () => {
  try {
    if (!fsSync.existsSync(WITHDRAWALS_FILE)) {
      await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify([]));
      return [];
    }
    
    const data = await fs.readFile(WITHDRAWALS_FILE, 'utf8');
    if (!data || data.trim() === '') {
      await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify([]));
      return [];
    }
    
    const withdrawals = JSON.parse(data);
    if (!Array.isArray(withdrawals)) {
      await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify([]));
      return [];
    }
    
    return withdrawals;
    
  } catch (error) {
    console.error('Error reading withdrawals:', error.message);
    return [];
  }
};

const writeWithdrawals = async (withdrawals) => {
  try {
    const dataDir = path.join(__dirname, 'data');
    if (!fsSync.existsSync(dataDir)) {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing withdrawals:', error.message);
    return false;
  }
};

const readSettings = async () => {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      upiQrCode: null,
      upiId: '7799191208-2@ybl',
      merchantName: 'Paper2Real Trading',
      updatedAt: new Date().toISOString()
    };
  }
};

const writeSettings = async (settings) => {
  try {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing settings:', error.message);
    return false;
  }
};

// ========== GENERAL ENDPOINTS ==========

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
    features: ['Challenge System', 'Trading with Rules', 'UPI Payments', 'Withdrawals']
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

// Register route (POST)
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
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
      }
    };
    
    users.push(newUser);
    await writeUsers(users);
    
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
app.get('/api/user/profile', async (req, res) => {
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
    
    const userResponse = { ...user };
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
app.get('/api/user', async (req, res) => {
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
    
    const userResponse = { ...user };
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
app.put('/api/user/bank-account', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const { bankAccount } = req.body;
    
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
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
app.put('/api/challenge/status', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    const { status, reason } = req.body;
    
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
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
app.post('/api/trades', async (req, res) => {
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
    user.paperBalance -= marginRequired;
    
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
app.get('/api/trades/positions', async (req, res) => {
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

// Close a position with challenge stats update
app.post('/api/trades/:id/close', async (req, res) => {
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
    
    const trades = await readTrades();
    const users = await readUsers();
    const orders = await readOrders();
    
    // Find the trade
    const tradeIndex = trades.findIndex(t => t.id === id && t.userId === userId);
    if (tradeIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Trade not found' 
      });
    }
    
    const trade = trades[tradeIndex];
    
    // Find user
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const user = users[userIndex];
    
    // Calculate PnL
    const currentPrice = exitPrice || trade.currentPrice || trade.entryPrice;
    const pnl = (currentPrice - trade.entryPrice) * trade.size * trade.leverage * 
                (trade.side === 'long' ? 1 : -1);
    
    // Return margin and add PnL to paper balance
    user.paperBalance += trade.marginUsed;
    user.paperBalance += pnl;
    
    // Update challenge stats
    if (pnl > 0) {
      user.challengeStats.totalProfit += pnl;
      user.challengeStats.currentProfit += pnl;
    } else {
      user.challengeStats.totalLoss += Math.abs(pnl);
    }
    
    // Calculate win rate
    const closedTrades = trades.filter(t => t.userId === userId && t.status === 'closed').length + 1;
    const winningTrades = trades.filter(t => 
      t.userId === userId && 
      t.status === 'closed' && 
      t.pnl > 0
    ).length + (pnl > 0 ? 1 : 0);
    
    user.challengeStats.winRate = (winningTrades / closedTrades) * 100;
    
    // Check challenge rules if user has active challenge
    if (user.currentChallenge && user.challengeStats.status === 'active') {
      const challenge = CHALLENGES[user.currentChallenge];
      
      // Calculate percentages
      const profitPercentage = (user.challengeStats.currentProfit / user.paperBalance) * 100;
      const lossPercentage = (user.challengeStats.totalLoss / user.paperBalance) * 100;
      
      // Check profit target
      if (profitPercentage >= challenge.profitTarget) {
        user.challengeStats.status = 'passed';
        user.challengeStats.endReason = 'Profit target achieved';
      }
      
      // Check max loss limit
      if (lossPercentage >= challenge.maxLossLimit) {
        user.challengeStats.status = 'failed';
        user.challengeStats.endReason = 'Maximum loss limit exceeded';
      }
    }
    
    user.updatedAt = new Date().toISOString();
    
    // Update trade
    trades[tradeIndex].status = 'closed';
    trades[tradeIndex].exitPrice = currentPrice;
    trades[tradeIndex].pnl = pnl;
    trades[tradeIndex].closeReason = closeReason || 'manual';
    trades[tradeIndex].closedAt = new Date().toISOString();
    trades[tradeIndex].updatedAt = new Date().toISOString();
    
    // Update order if exists
    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex !== -1) {
      orders[orderIndex].status = 'closed';
      orders[orderIndex].exitPrice = currentPrice;
      orders[orderIndex].pnl = pnl;
      orders[orderIndex].exitTime = new Date().toISOString();
      orders[orderIndex].closeReason = closeReason || 'manual';
      orders[orderIndex].updatedAt = new Date().toISOString();
    }
    
    // Save data
    await writeTrades(trades);
    await writeUsers(users);
    await writeOrders(orders);
    
    const userResponse = { ...user };
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Position closed successfully',
      pnl,
      user: userResponse,
      newBalance: user.paperBalance
    });
    
  } catch (error) {
    console.error('Error closing position:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Cancel an order
app.post('/api/trades/:id/cancel', async (req, res) => {
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
app.put('/api/trades/:id/update-sltp', async (req, res) => {
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
app.get('/api/trades/history', async (req, res) => {
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
app.post('/api/payments/request', async (req, res) => {
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
app.get('/api/payments', async (req, res) => {
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
app.get('/api/withdrawals/history', async (req, res) => {
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

// ================= ADMIN DEDUCT WALLET =================
// ================= ADMIN DEDUCT WALLET =================
app.post('/api/admin/users/:id/wallet/deduct', async (req, res) => {
  try {
    const userId = req.params.id;
    let { amount } = req.body;

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
    user.balance = Number(user.balance) || 0;

    if (user.balance < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }

    // 🔴 REAL DEDUCTION
    user.balance = user.balance - amount;

    users[userIndex] = user;
    await writeUsers(users);

    res.json({
      success: true,
      message: 'Funds deducted successfully',
      newBalance: user.balance,
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

// ========== SERVER START ==========
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('==========================================');
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: https://myproject1-d097.onrender.com`);
  console.log(`✅ Paper2Real Backend with Challenge System`);
  console.log('');
  console.log('👥 USER ENDPOINTS:');
  console.log('  POST /api/register             - User registration');
  console.log('  POST /api/login                - User login');
  console.log('  GET  /api/user/profile         - Get user profile');
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
  console.log('  GET  /api/admin/deposits       - Get all deposits');
  console.log('  GET  /api/admin/payments       - Get all payments');
  console.log('  GET  /api/admin/withdrawals    - Get all withdrawals');
  console.log('  GET  /api/admin/upi-settings   - Get UPI settings');
  console.log('  POST /api/admin/upi-qr/upload  - Upload UPI QR code');
  console.log('  PUT  /api/admin/upi-settings   - Update UPI settings');
  console.log('  DELETE /api/admin/upi-qr       - Delete UPI QR code');
  console.log('');
  console.log('🌐 GENERAL ENDPOINTS:');
  console.log('  GET  /                         - API root');
  console.log('  GET  /api                      - API info');
  console.log('  GET  /api/test                 - Test endpoint');
  console.log('  GET  /api/health               - Health check');
  console.log('==========================================');
});
