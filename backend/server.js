// server.js - Paper2Real Trading Platform Backend
const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const app = express();

// CORS Configuration - Allow all origins for development
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// File paths
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const TRADES_FILE = path.join(__dirname, 'data', 'trades.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');
const TRANSACTIONS_FILE = path.join(__dirname, 'data', 'transactions.json');
const PAYMENTS_FILE = path.join(__dirname, 'data', 'payments.json');
const DEPOSITS_FILE = path.join(__dirname, 'data', 'deposits.json');
const WITHDRAWALS_FILE = path.join(__dirname, 'data', 'withdrawals.json');
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload - FIXED VERSION
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

// FIXED: Multer configuration with correct fileFilter
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// Create directories if they don't exist
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

// Serve static files from public directory - FIXED: Correct static file serving
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    // Set proper headers for images
    if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
  }
}));

// Helper functions with proper error handling
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

const readTransactions = async () => {
  try {
    const data = await fs.readFile(TRANSACTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading transactions:', error.message);
    return { deposits: [], withdrawals: [] };
  }
};

const writeTransactions = async (transactions) => {
  try {
    await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing transactions:', error.message);
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

const readDeposits = async () => {
  try {
    const data = await fs.readFile(DEPOSITS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading deposits:', error.message);
    return [];
  }
};

const readWithdrawals = async () => {
  try {
    console.log('📖 [readWithdrawals] Reading from:', WITHDRAWALS_FILE);
    
    // Check if file exists
    if (!fsSync.existsSync(WITHDRAWALS_FILE)) {
      console.log('📄 [readWithdrawals] File does not exist, creating empty array');
      await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify([]));
      return [];
    }
    
    // Read file
    const data = await fs.readFile(WITHDRAWALS_FILE, 'utf8');
    console.log('📖 [readWithdrawals] File size:', data.length, 'bytes');
    
    // Handle empty file
    if (!data || data.trim() === '') {
      console.log('📄 [readWithdrawals] File is empty, initializing with empty array');
      await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify([]));
      return [];
    }
    
    // Parse JSON
    const withdrawals = JSON.parse(data);
    console.log(`✅ [readWithdrawals] Successfully parsed ${withdrawals.length} withdrawals`);
    
    // Ensure it's an array
    if (!Array.isArray(withdrawals)) {
      console.error('❌ [readWithdrawals] Data is not an array, resetting file');
      await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify([]));
      return [];
    }
    
    return withdrawals;
    
  } catch (error) {
    console.error('❌ [readWithdrawals] ERROR:', error.message);
    
    // If there's an error reading, return empty array
    return [];
  }
};

// Helper functions for settings - UPDATED with correct UPI ID
const readSettings = async () => {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading settings:', error.message);
    // Return default settings if file doesn't exist - UPDATED UPI ID
    return {
      upiQrCode: null,
      upiId: '7799191208-2@ybl', // UPDATED: Your UPI ID
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

// ========== USER MANAGEMENT ROUTES ==========

// Register route
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
      currentPlan: null,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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

// Login route
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

// ========== TRADING SYSTEM ROUTES ==========

// Create a new trade
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
    const user = users.find(u => u.id === userId);
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({ 
        success: false, 
        error: 'User not found. Please login again.' 
      });
    }
    
    // Check if user has a plan and paper balance
    if (!user.currentPlan || user.paperBalance <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please purchase a plan to start trading' 
      });
    }
    
    // Calculate position value
    const positionValue = entryPrice * size * leverage;
    
    // Check if user has enough paper balance
    if (user.paperBalance < positionValue) {
      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient paper balance' 
      });
    }
    
    // Deduct from paper balance
    user.paperBalance -= positionValue;
    user.updatedAt = new Date().toISOString();
    
    // Create new trade
    const newTrade = {
      id: Date.now().toString(),
      userId,
      userName: user.name,
      symbol,
      side: side.toLowerCase(),
      size: parseFloat(size),
      leverage: parseInt(leverage),
      entryPrice: parseFloat(entryPrice),
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      status: 'open',
      positionValue,
      pnl: 0,
      currentPrice: parseFloat(entryPrice),
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
      pnl: 0,
      timestamp: new Date().toISOString()
    };
    
    trades.push(newTrade);
    orders.push(newOrder);
    
    // Save all data
    await writeUsers(users);
    await writeTrades(trades);
    await writeOrders(orders);
    
    res.json({
      success: true,
      message: 'Trade created successfully',
      trade: newTrade,
      order: newOrder,
      newBalance: user.paperBalance
    });
    
  } catch (error) {
    console.error('Error creating trade:', error);
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
    
    const userPositions = trades.filter(t => t.userId === userId && t.status.toLowerCase() === 'open');
    
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

// Close a position
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
    
    // Calculate PnL
    const currentPrice = exitPrice || trade.currentPrice || trade.entryPrice;
    const pnl = (currentPrice - trade.entryPrice) * trade.size * trade.leverage * 
                (trade.side === 'long' ? 1 : -1);
    
    // Update user's paper balance (return the position value)
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].paperBalance += trade.positionValue;
      users[userIndex].paperBalance += pnl; // Add PnL
      users[userIndex].updatedAt = new Date().toISOString();
    }
    
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
    
    const userResponse = { ...users[userIndex] };
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Position closed successfully',
      pnl,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Error closing position:', error);
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
    
    // Return position value to user's paper balance if it's an open position
    if (tradeIndex !== -1 && trades[tradeIndex].status === 'open') {
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].paperBalance += trades[tradeIndex].positionValue;
        users[userIndex].updatedAt = new Date().toISOString();
      }
      
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
    
    const userIndex = users.findIndex(u => u.id === userId);
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

// ========== UPI QR CODE MANAGEMENT ==========

// Get current UPI settings - FIXED: Returns proper format with qrCodeUrl
app.get('/api/admin/upi-settings', async (req, res) => {
  try {
    console.log('Admin: Fetching UPI settings...');
    const settings = await readSettings();
    
    // Check if QR code file exists
    let qrCodeUrl = null;
    if (settings.upiQrCode) {
      const qrFilePath = path.join(uploadsDir, settings.upiQrCode);
      if (fsSync.existsSync(qrFilePath)) {
        qrCodeUrl = `/uploads/${settings.upiQrCode}`;
      } else {
        console.log('QR code file not found:', qrFilePath);
        // Remove the reference if file doesn't exist
        settings.upiQrCode = null;
        await writeSettings(settings);
      }
    }
    
    const response = {
      success: true,
      settings: {
        ...settings,
        qrCodeUrl: qrCodeUrl
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching UPI settings:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// UPDATED: Upload UPI QR code
app.post('/api/admin/upi-qr/upload', upload.single('qrImage'), async (req, res) => {
  try {
    console.log('Admin: Uploading UPI QR code...');
    
    const { upiId, merchantName } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded. Please select a QR code image.' 
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
          console.log('Deleted old QR code:', settings.upiQrCode);
        }
      } catch (error) {
        console.error('Error deleting old QR code:', error.message);
      }
    }
    
    // Update settings with new file
    settings.upiQrCode = req.file.filename;
    settings.upiId = upiId;
    if (merchantName) settings.merchantName = merchantName;
    settings.updatedAt = new Date().toISOString();
    
    await writeSettings(settings);
    
    // Verify file was saved
    const filePath = path.join(uploadsDir, req.file.filename);
    if (!fsSync.existsSync(filePath)) {
      console.error('File not saved to disk:', filePath);
      return res.status(500).json({
        success: false,
        error: 'Failed to save QR code file'
      });
    }
    
    console.log('QR code saved successfully:', req.file.filename);
    
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

// Update UPI settings without changing QR code
app.put('/api/admin/upi-settings', async (req, res) => {
  try {
    const { upiId, merchantName } = req.body;
    
    console.log('Admin: Updating UPI settings...');
    
    const settings = await readSettings();
    
    if (upiId) settings.upiId = upiId;
    if (merchantName) settings.merchantName = merchantName;
    settings.updatedAt = new Date().toISOString();
    
    await writeSettings(settings);
    
    res.json({
      success: true,
      message: 'UPI settings updated successfully',
      settings: {
        ...settings,
        qrCodeUrl: settings.upiQrCode ? `/uploads/${settings.upiQrCode}` : null
      }
    });
    
  } catch (error) {
    console.error('Error updating UPI settings:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== PUBLIC UPI ENDPOINTS ==========

// Get UPI QR code for payment - FIXED: Always returns settings
app.get('/api/upi-qr', async (req, res) => {
  try {
    const settings = await readSettings();
    
    // Check if QR code file exists
    let qrCodeUrl = null;
    if (settings.upiQrCode) {
      const qrFilePath = path.join(uploadsDir, settings.upiQrCode);
      if (fsSync.existsSync(qrFilePath)) {
        qrCodeUrl = `/uploads/${settings.upiQrCode}`;
      } else {
        console.log('QR code file not found for public endpoint:', qrFilePath);
      }
    }
    
    const response = {
      success: true,
      qrCodeUrl: qrCodeUrl,
      upiId: settings.upiId,
      merchantName: settings.merchantName,
      updatedAt: settings.updatedAt
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching UPI QR code:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete UPI QR code
app.delete('/api/admin/upi-qr', async (req, res) => {
  try {
    console.log('Admin: Deleting UPI QR code...');
    
    const settings = await readSettings();
    
    if (!settings.upiQrCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'No QR code to delete' 
      });
    }
    
    // Delete file
    try {
      const filePath = path.join(uploadsDir, settings.upiQrCode);
      if (fsSync.existsSync(filePath)) {
        await fs.unlink(filePath);
        console.log('Deleted QR code file:', settings.upiQrCode);
      }
    } catch (error) {
      console.error('Error deleting QR code file:', error.message);
    }
    
    // Remove QR code reference
    settings.upiQrCode = null;
    settings.updatedAt = new Date().toISOString();
    
    await writeSettings(settings);
    
    res.json({
      success: true,
      message: 'UPI QR code deleted successfully',
      settings: {
        ...settings,
        qrCodeUrl: null
      }
    });
    
  } catch (error) {
    console.error('Error deleting UPI QR code:', error);
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
    console.log('Admin: Fetching all users...');
    const users = await readUsers();
    
    // Remove passwords from response
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
        currentPlan: userCopy.currentPlan || 'No Plan',
        createdAt: userCopy.createdAt || new Date().toISOString(),
        ...userCopy
      };
    });
    
    console.log(`Admin: Returning ${sanitizedUsers.length} users`);
    res.json(sanitizedUsers);
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json([]);
  }
});

// Get all trades (for admin panel) - FIXED VERSION
app.get('/api/admin/trades', async (req, res) => {
  try {
    console.log('Admin: Fetching all trades...');
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
    
    console.log(`Admin: Returning ${normalizedTrades.length} trades`);
    res.json(normalizedTrades);
    
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json([]);
  }
});

// Get all orders (for admin panel)
app.get('/api/admin/orders', async (req, res) => {
  try {
    console.log('Admin: Fetching all orders...');
    const orders = await readOrders();
    res.json(orders);
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json([]);
  }
});

// Get all transactions (for admin panel)
app.get('/api/admin/transactions', async (req, res) => {
  try {
    const transactions = await readTransactions();
    res.json(transactions);
  } catch (error) {
    console.error('Error reading transactions:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get platform statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    const users = await readUsers();
    const trades = await readTrades();
    const payments = await readPayments();
    const deposits = await readDeposits();
    const withdrawals = await readWithdrawals();
    
    const activeUsers = users.filter(u => u.accountStatus === 'active').length;
    const openPositions = trades.filter(t => t.status === 'open' || t.status === 'OPEN').length;
    
    // Calculate total paper balance
    const totalPaperBalance = users.reduce((sum, user) => sum + (user.paperBalance || 0), 0);
    
    // Calculate daily volume (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyTrades = trades.filter(t => new Date(t.createdAt) > twentyFourHoursAgo);
    const dailyVolume = dailyTrades.reduce((sum, trade) => sum + (trade.positionValue || 0), 0);
    
    // Payment stats
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const approvedPayments = payments.filter(p => p.status === 'approved').length;
    const totalRevenue = payments
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Get open trades (active trades)
    const activeTrades = trades.filter(t => t.status === 'open' || t.status === 'OPEN').length;
    
    // Calculate total P&L
    const totalPnl = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    
    // Calculate winning trades
    const winningTrades = trades.filter(t => (t.pnl || 0) > 0).length;
    
    // Deposit/Withdrawal stats
    const totalDeposits = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
    
    res.json({
      totalUsers: users.length,
      activeUsers,
      openPositions,
      totalBalance: totalPaperBalance,
      activeTrades,
      dailyVolume,
      totalPnl,
      totalTrades: trades.length,
      winningTrades,
      pendingPayments,
      approvedPayments,
      totalRevenue,
      totalDeposits,
      totalWithdrawals
    });
    
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== WITHDRAWAL MANAGEMENT ROUTES ==========

// FIXED: Write withdrawals function
const writeWithdrawals = async (withdrawals) => {
  try {
    console.log('💾 [writeWithdrawals] Starting to write withdrawals...');
    console.log('💾 File path:', WITHDRAWALS_FILE);
    console.log('💾 Number of withdrawals to write:', withdrawals.length);
    
    // Ensure the data directory exists
    const dataDir = path.join(__dirname, 'data');
    if (!fsSync.existsSync(dataDir)) {
      console.log('📁 Creating data directory:', dataDir);
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    // Convert to JSON with pretty printing
    const dataToWrite = JSON.stringify(withdrawals, null, 2);
    console.log('💾 Data size:', dataToWrite.length, 'bytes');
    
    // Write to file
    await fs.writeFile(WITHDRAWALS_FILE, dataToWrite, 'utf8');
    console.log('✅ [writeWithdrawals] File written successfully');
    
    // Verify file was written
    if (fsSync.existsSync(WITHDRAWALS_FILE)) {
      const stats = fsSync.statSync(WITHDRAWALS_FILE);
      console.log(`✅ [writeWithdrawals] File verified: ${stats.size} bytes`);
      return true;
    } else {
      console.error('❌ [writeWithdrawals] File was not created!');
      return false;
    }
    
  } catch (error) {
    console.error('❌ [writeWithdrawals] ERROR:', error.message);
    console.error('❌ [writeWithdrawals] Full error:', error);
    return false;
  }
};

// Get withdrawal requests with filtering
app.get('/api/admin/withdrawals', async (req, res) => {
  try {
    console.log('📊 Admin: Fetching withdrawals...');
    const { status } = req.query;
    let withdrawals = await readWithdrawals();
    
    console.log(`📊 Found ${withdrawals.length} withdrawals total`);
    
    // Filter by status if provided
    if (status && status !== 'all') {
      const filtered = withdrawals.filter(w => w.status === status);
      console.log(`📊 Filtered to ${filtered.length} withdrawals with status: ${status}`);
      withdrawals = filtered;
    }
    
    // Sort by latest first
    withdrawals.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    
    console.log(`📊 Returning ${withdrawals.length} withdrawals`);
    res.json(withdrawals);
  } catch (error) {
    console.error('❌ Error fetching withdrawals:', error);
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
    const users = await readUsers();
    const transactions = await readTransactions();
    
    // Find withdrawal
    const withdrawalIndex = withdrawals.findIndex(w => w.id === id);
    if (withdrawalIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Withdrawal not found' 
      });
    }
    
    const withdrawal = withdrawals[withdrawalIndex];
    
    // Check if withdrawal is pending
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Withdrawal is not pending' 
      });
    }
    
    // Find user
    const userIndex = users.findIndex(u => u.id === withdrawal.userId);
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Update withdrawal status
    withdrawals[withdrawalIndex].status = 'approved';
    withdrawals[withdrawalIndex].transactionId = transactionId;
    withdrawals[withdrawalIndex].processedAt = new Date().toISOString();
    withdrawals[withdrawalIndex].processedBy = 'admin';
    withdrawals[withdrawalIndex].notes = 'Approved and processed';
    
    // Record transaction
    const transaction = {
      id: Date.now().toString(),
      userId: withdrawal.userId,
      userName: withdrawal.userName,
      amount: withdrawal.amount,
      type: 'withdrawal',
      subtype: 'bank_transfer',
      status: 'completed',
      transactionId: transactionId,
      notes: `Withdrawal to ${withdrawal.bankName} - ${withdrawal.accountNumber}`,
      timestamp: new Date().toISOString()
    };
    
    transactions.withdrawals.push(transaction);
    
    // Save data
    await writeWithdrawals(withdrawals);
    await writeTransactions(transactions);
    
    // Return updated user without password
    const userResponse = { ...users[userIndex] };
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Withdrawal approved successfully',
      withdrawal: withdrawals[withdrawalIndex],
      user: userResponse
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
    
    // Find withdrawal
    const withdrawalIndex = withdrawals.findIndex(w => w.id === id);
    if (withdrawalIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Withdrawal not found' 
      });
    }
    
    const withdrawal = withdrawals[withdrawalIndex];
    
    // Check if withdrawal is pending
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
    
    // Save withdrawal data
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

// FIXED: Create withdrawal request (user side) - COMPLETE CORRECTED VERSION
app.post('/api/withdrawals/request', async (req, res) => {
  try {
    console.log('📤 ===== WITHDRAWAL REQUEST RECEIVED =====');
    console.log('📤 Request body:', JSON.stringify(req.body, null, 2));
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.error('❌ No token provided');
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const userId = token.replace('token-', '');
    console.log('👤 User ID from token:', userId);
    
    const { 
      amount, 
      bankName, 
      accountNumber, 
      accountHolderName, 
      ifscCode 
    } = req.body;
    
    console.log('💰 Withdrawal details:', { 
      amount, 
      bankName, 
      accountNumber, 
      accountHolderName, 
      ifscCode 
    });
    
    // Validation
    if (!amount || amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      return res.status(400).json({ 
        success: false, 
        error: 'Valid amount is required' 
      });
    }
    
    if (!bankName || !accountNumber || !accountHolderName || !ifscCode) {
      console.error('❌ Missing bank details');
      return res.status(400).json({ 
        success: false, 
        error: 'All bank details are required' 
      });
    }
    
    console.log('📖 Reading users and withdrawals...');
    const users = await readUsers();
    const withdrawals = await readWithdrawals();
    
    console.log(`👥 Found ${users.length} users`);
    console.log(`💰 Found ${withdrawals.length} existing withdrawals`);
    
    // Find user
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      console.error('❌ User not found for ID:', userId);
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const user = users[userIndex];
    console.log('✅ User found:', { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      realBalance: user.realBalance 
    });
    
    // Check if user has enough real balance
    const withdrawalAmount = parseFloat(amount);
    if (user.realBalance < withdrawalAmount) {
      console.error('❌ Insufficient balance:', user.realBalance, '<', withdrawalAmount);
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient real balance. Available: ₹${user.realBalance}, Requested: ₹${withdrawalAmount}` 
      });
    }
    
    // Check minimum withdrawal amount
    if (withdrawalAmount < 500) {
      console.error('❌ Amount below minimum:', withdrawalAmount);
      return res.status(400).json({ 
        success: false, 
        error: 'Minimum withdrawal amount is ₹500' 
      });
    }
    
    // Create withdrawal request with proper data structure
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
    
    console.log('📝 Created new withdrawal:', JSON.stringify(newWithdrawal, null, 2));
    
    // Add to withdrawals array
    withdrawals.push(newWithdrawal);
    console.log(`📊 Total withdrawals after adding: ${withdrawals.length}`);
    
    // IMPORTANT: Write withdrawals FIRST (before deducting balance)
    console.log('💾 Writing withdrawals to file...');
    const writeSuccess = await writeWithdrawals(withdrawals);
    
    if (!writeSuccess) {
      console.error('❌ Failed to write withdrawals to file');
      return res.status(500).json({
        success: false,
        error: 'Failed to save withdrawal request. Please try again.'
      });
    }
    
    console.log('✅ Withdrawals saved successfully');
    
    // Verify file was written
    if (fsSync.existsSync(WITHDRAWALS_FILE)) {
      const fileContent = await fs.readFile(WITHDRAWALS_FILE, 'utf8');
      console.log(`✅ File verification: ${fileContent.length} bytes`);
      try {
        const parsed = JSON.parse(fileContent);
        console.log(`✅ File contains ${parsed.length} withdrawals`);
      } catch (e) {
        console.error('❌ File is not valid JSON:', e.message);
      }
    } else {
      console.error('❌ File was not created!');
    }
    
    // Now deduct from user's real balance
    console.log(`💰 Deducting ₹${withdrawalAmount} from user balance...`);
    const oldBalance = user.realBalance;
    user.realBalance -= withdrawalAmount;
    user.updatedAt = new Date().toISOString();
    
    console.log(`💰 Balance updated: ${oldBalance} -> ${user.realBalance}`);
    
    // Update users file
    console.log('💾 Updating user balance...');
    const userWriteSuccess = await writeUsers(users);
    
    if (!userWriteSuccess) {
      console.error('⚠️ Failed to update user balance file');
      // Still return success since withdrawal was saved
    } else {
      console.log('✅ User balance updated successfully');
    }
    
    console.log('🎉 Withdrawal request completed successfully!');
    
    // Return response
    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal: newWithdrawal,
      newBalance: user.realBalance
    });
    
  } catch (error) {
    console.error('❌ ===== ERROR IN WITHDRAWAL REQUEST =====');
    console.error('❌ Error:', error.message);
    console.error('❌ Stack trace:', error.stack);
    
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
    
    // Sort by latest first
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

// ========== ADMIN WALLET MANAGEMENT ROUTES ==========

// Add funds to user wallet
app.post('/api/admin/users/:id/wallet/add', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, notes } = req.body;
    
    console.log('Add funds request:', { id, amount, type, notes });
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid amount is required' 
      });
    }
    
    if (!['real', 'paper'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Type must be "real" or "paper"' 
      });
    }
    
    const users = await readUsers();
    const transactions = await readTransactions();
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Add funds
    if (type === 'real') {
      users[userIndex].realBalance += parseFloat(amount);
    } else {
      users[userIndex].paperBalance += parseFloat(amount);
    }
    
    users[userIndex].updatedAt = new Date().toISOString();
    
    // Create transaction record
    const transaction = {
      id: Date.now().toString(),
      userId: id,
      userName: users[userIndex].name,
      amount: parseFloat(amount),
      type: 'admin_adjustment',
      subtype: type === 'real' ? 'real_deposit' : 'paper_deposit',
      notes: notes || 'Admin adjustment - Funds added',
      status: 'completed',
      processedBy: 'admin',
      timestamp: new Date().toISOString()
    };
    
    transactions.deposits.push(transaction);
    
    // Save data
    await writeUsers(users);
    await writeTransactions(transactions);
    
    const userResponse = { ...users[userIndex] };
    delete userResponse.password;
    
    res.json({
      success: true,
      message: `₹${amount} added to user's ${type} balance`,
      user: userResponse,
      transaction
    });
    
  } catch (error) {
    console.error('Error adding funds:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Deduct funds from user wallet
app.post('/api/admin/users/:id/wallet/deduct', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, notes } = req.body;
    
    console.log('Deduct funds request:', { id, amount, type, notes });
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid amount is required' 
      });
    }
    
    if (!['real', 'paper'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Type must be "real" or "paper"' 
      });
    }
    
    const users = await readUsers();
    const transactions = await readTransactions();
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Check if user has sufficient balance
    const currentBalance = type === 'real' ? users[userIndex].realBalance : users[userIndex].paperBalance;
    if (currentBalance < parseFloat(amount)) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient ${type} balance. Available: ₹${currentBalance}` 
      });
    }
    
    // Deduct funds
    if (type === 'real') {
      users[userIndex].realBalance -= parseFloat(amount);
    } else {
      users[userIndex].paperBalance -= parseFloat(amount);
    }
    
    users[userIndex].updatedAt = new Date().toISOString();
    
    // Create transaction record
    const transaction = {
      id: Date.now().toString(),
      userId: id,
      userName: users[userIndex].name,
      amount: parseFloat(amount),
      type: 'admin_adjustment',
      subtype: type === 'real' ? 'real_deduction' : 'paper_deduction',
      notes: notes || 'Admin adjustment - Funds deducted',
      status: 'completed',
      processedBy: 'admin',
      timestamp: new Date().toISOString()
    };
    
    transactions.withdrawals.push(transaction);
    
    // Save data
    await writeUsers(users);
    await writeTransactions(transactions);
    
    const userResponse = { ...users[userIndex] };
    delete userResponse.password;
    
    res.json({
      success: true,
      message: `₹${amount} deducted from user's ${type} balance`,
      user: userResponse,
      transaction
    });
    
  } catch (error) {
    console.error('Error deducting funds:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get user wallet details
app.get('/api/admin/users/:id/wallet', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await readUsers();
    
    const user = users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Return wallet info without password
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== PAYMENT SYSTEM ROUTES ==========

// Submit payment request (from frontend) - SIMPLIFIED WITHOUT FILE UPLOAD
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
    const { planName, amount, paymentMethod, transactionId, notes } = req.body;
    
    if (!planName || !amount || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    const users = await readUsers();
    const payments = await readPayments();
    
    // Find user
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Check if user already has a pending payment for this plan
    const existingPending = payments.find(p => 
      p.userId === userId && 
      p.planName === planName && 
      p.status === 'pending'
    );
    
    if (existingPending) {
      return res.status(400).json({ 
        success: false, 
        error: 'You already have a pending payment for this plan' 
      });
    }
    
    // Create payment request
    const newPayment = {
      id: Date.now().toString(),
      userId,
      userName: user.name,
      userEmail: user.email,
      planName,
      amount: parseFloat(amount),
      paymentMethod,
      transactionId: transactionId || `TRX${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      notes: notes || '',
      screenshotUrl: '',
      receiptFilename: '',
      processedAt: null,
      processedBy: null,
      processNotes: null
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

// Get all payments for admin panel
app.get('/api/admin/payments', async (req, res) => {
  try {
    console.log('Admin: Fetching all payments...');
    const payments = await readPayments();
    
    // Sort by latest first
    const sortedPayments = payments.sort((a, b) => 
      new Date(b.submittedAt) - new Date(a.submittedAt)
    );
    
    console.log(`Admin: Returning ${sortedPayments.length} payments`);
    res.json(sortedPayments);
    
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json([]);
  }
});

// Update payment status (approve/reject)
app.put('/api/payments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, processedBy } = req.body;
    
    console.log('Updating payment status:', { id, status, notes, processedBy });
    
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid status is required (approved/rejected/pending)' 
      });
    }
    
    const payments = await readPayments();
    const users = await readUsers();
    const transactions = await readTransactions();
    
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
    payments[paymentIndex].processNotes = notes || '';
    payments[paymentIndex].updatedAt = new Date().toISOString();
    
    // If approved, add paper money to user
    if (status === 'approved') {
      const userIndex = users.findIndex(u => u.id === payment.userId);
      if (userIndex !== -1) {
        // Update user plan
        users[userIndex].currentPlan = payment.planName;
        
        // Add paper money based on plan
        let paperMoneyAmount = 0;
        switch (payment.planName.toLowerCase()) {
          case 'plan a':
            paperMoneyAmount = 100000;
            break;
          case 'plan b':
            paperMoneyAmount = 250000;
            break;
          case 'plan c':
            paperMoneyAmount = 500000;
            break;
          default:
            paperMoneyAmount = 100000;
        }
        
        users[userIndex].paperBalance += paperMoneyAmount;
        users[userIndex].updatedAt = new Date().toISOString();
        
        // Create transaction record
        const transaction = {
          id: Date.now().toString(),
          userId: payment.userId,
          userName: payment.userName,
          amount: paperMoneyAmount,
          type: 'plan_purchase',
          subtype: 'paper_deposit',
          plan: payment.planName,
          notes: `Plan purchase: ${payment.planName}`,
          status: 'completed',
          processedBy: 'system',
          timestamp: new Date().toISOString()
        };
        
        transactions.deposits.push(transaction);
      }
    }
    
    // Save all data
    await writePayments(payments);
    await writeUsers(users);
    await writeTransactions(transactions);
    
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

// Get payment statistics
app.get('/api/payments/stats', async (req, res) => {
  try {
    const payments = await readPayments();
    
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const totalRevenue = payments
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    res.json({
      pendingPayments,
      totalRevenue
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all payments
app.get('/api/payments', async (req, res) => {
  try {
    const payments = await readPayments();
    
    // Sort by latest first
    payments.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    // Get counts for dashboard
    const pendingCount = payments.filter(p => p.status === 'pending').length;
    const approvedCount = payments.filter(p => p.status === 'approved').length;
    const rejectedCount = payments.filter(p => p.status === 'rejected').length;
    
    res.json({
      success: true,
      payments,
      counts: {
        total: payments.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== DEPOSITS AND WITHDRAWALS ROUTES ==========

// Get all deposits
app.get('/api/admin/deposits', async (req, res) => {
  try {
    const deposits = await readDeposits();
    res.json(deposits);
  } catch (error) {
    console.error('Error reading deposits:', error.message);
    res.status(500).json([]);
  }
});

// ========== GENERAL ROUTES ==========

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Paper2Real Trading Platform Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Paper2Real Trading Platform'
  });
});

// Add debug endpoint for withdrawals
app.get('/api/debug/withdrawals', async (req, res) => {
  try {
    console.log('🔍 Debug: Checking withdrawals file...');
    
    // Check if file exists
    const fileExists = fsSync.existsSync(WITHDRAWALS_FILE);
    console.log('📁 File exists:', fileExists);
    
    if (!fileExists) {
      return res.json({
        fileExists: false,
        message: 'Withdrawals file does not exist',
        path: WITHDRAWALS_FILE
      });
    }
    
    // Get file stats
    const stats = fsSync.statSync(WITHDRAWALS_FILE);
    
    // Read file content
    const fileContent = await fs.readFile(WITHDRAWALS_FILE, 'utf8');
    
    let withdrawals = [];
    let parseError = null;
    
    // Try to parse JSON
    try {
      withdrawals = JSON.parse(fileContent);
      console.log(`✅ Parsed ${withdrawals.length} withdrawals`);
    } catch (error) {
      parseError = error.message;
      console.error('❌ Parse error:', parseError);
    }
    
    res.json({
      fileExists: true,
      filePath: WITHDRAWALS_FILE,
      fileSize: stats.size,
      fileSizeKB: (stats.size / 1024).toFixed(2),
      contentLength: fileContent.length,
      parseError: parseError,
      withdrawalsCount: withdrawals.length,
      withdrawals: withdrawals.slice(0, 5), // First 5 only
      sample: withdrawals.length > 0 ? withdrawals[0] : null
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log('==========================================');
  console.log('✅ Paper2Real Backend running on port', PORT);
  console.log('📁 Data directory: backend/data/');
  console.log('📁 Uploads directory: backend/public/uploads/');
  console.log('🌐 Test endpoint: http://localhost:3001/api/test');
  console.log('🔍 Debug endpoint: http://localhost:3001/api/debug/withdrawals');
  console.log('');
  console.log('👥 USER ENDPOINTS:');
  console.log('  POST /api/register             - User registration');
  console.log('  POST /api/login                - User login');
  console.log('  GET  /api/user/profile         - Get user profile');
  console.log('  GET  /api/upi-qr               - Get UPI QR code');
  console.log('  POST /api/withdrawals/request  - Submit withdrawal request');
  console.log('  GET  /api/withdrawals/history  - Get user withdrawal history');
  console.log('');
  console.log('📈 TRADING ENDPOINTS:');
  console.log('  POST /api/trades               - Create trade');
  console.log('  GET  /api/trades/positions     - Get open positions');
  console.log('  POST /api/trades/:id/close     - Close a position');
  console.log('  POST /api/trades/:id/cancel    - Cancel an order');
  console.log('  PUT  /api/trades/:id/update-sltp - Update SL/TP');
  console.log('  GET  /api/trades/history       - Get order history');
  console.log('');
  console.log('👑 ADMIN ENDPOINTS:');
  console.log('  GET  /api/admin/users          - Get all users');
  console.log('  GET  /api/admin/trades         - Get all trades');
  console.log('  GET  /api/admin/orders         - Get all orders');
  console.log('  GET  /api/admin/stats          - Get platform statistics');
  console.log('  GET  /api/admin/deposits       - Get all deposits');
  console.log('  GET  /api/admin/withdrawals    - Get all withdrawals');
  console.log('  GET  /api/payments             - Get all payments');
  console.log('  GET  /api/payments/stats       - Get payment statistics');
  console.log('  GET  /api/admin/upi-settings   - Get UPI settings');
  console.log('  POST /api/admin/upi-qr/upload  - Upload UPI QR code (with settings)');
  console.log('  PUT  /api/admin/upi-settings   - Update UPI settings (without QR)');
  console.log('  DELETE /api/admin/upi-qr       - Delete UPI QR code');
  console.log('');
  console.log('🏦 WALLET MANAGEMENT:');
  console.log('  POST /api/admin/users/:id/wallet/add    - Add funds');
  console.log('  POST /api/admin/users/:id/wallet/deduct - Deduct funds');
  console.log('  GET  /api/admin/users/:id/wallet        - Get wallet info');
  console.log('');
  console.log('💳 PAYMENT SYSTEM:');
  console.log('  POST /api/payments/request     - Submit payment');
  console.log('  PUT  /api/payments/:id/status  - Update payment status');
  console.log('💸 WITHDRAWAL ENDPOINTS:');
  console.log('  GET  /api/admin/withdrawals        - Get withdrawal requests');
  console.log('  POST /api/admin/withdrawal/:id/approve - Approve withdrawal');
  console.log('  POST /api/admin/withdrawal/:id/reject  - Reject withdrawal');
  console.log('  POST /api/withdrawals/request      - User withdrawal request');
  console.log('  GET  /api/withdrawals/history      - User withdrawal history');
  console.log('==========================================');
});