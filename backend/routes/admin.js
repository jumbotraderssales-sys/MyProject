const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// ===== Helper functions (same as in server.js) =====
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const TRADES_FILE = path.join(__dirname, '..', 'data', 'trades.json');
const ORDERS_FILE = path.join(__dirname, '..', 'data', 'orders.json');
const PAYMENTS_FILE = path.join(__dirname, '..', 'data', 'payments.json');
const WITHDRAWALS_FILE = path.join(__dirname, '..', 'data', 'withdrawals.json');
const SETTINGS_FILE = path.join(__dirname, '..', 'data', 'settings.json');
const REFERRALS_FILE = path.join(__dirname, '..', 'data', 'referrals.json');

const readUsers = async () => {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeUsers = async (users) => {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
};

const readTrades = async () => {
  try {
    const data = await fs.readFile(TRADES_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const readOrders = async () => {
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const readPayments = async () => {
  try {
    const data = await fs.readFile(PAYMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const readWithdrawals = async () => {
  try {
    const data = await fs.readFile(WITHDRAWALS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeWithdrawals = async (withdrawals) => {
  await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));
};

const readSettings = async () => {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {
      upiId: '7799191208-2@ybl',
      merchantName: 'Paper2Real Trading',
      referralTarget: 20,
      referralRewardName: 'Beginner Challenge',
      referralRewardAmount: 20000
    };
  }
};

const readReferrals = async () => {
  try {
    const data = await fs.readFile(REFERRALS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// ===== Authentication middleware =====
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ success: false, error: 'No token provided' });

  const userId = token.replace('token-', '');
  req.userId = userId;
  next();
};

const requireAdmin = async (req, res, next) => {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== ADMIN ENDPOINTS ==========

// Get all users (sanitized)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await readUsers();
    const sanitized = users.map(user => {
      const copy = { ...user };
      delete copy.password;
      return copy;
    });
    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const userResponse = { ...user };
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user status
router.put('/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { accountStatus } = req.body;
    if (!['active', 'suspended', 'inactive'].includes(accountStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) return res.status(404).json({ success: false, error: 'User not found' });

    users[userIndex].accountStatus = accountStatus;
    users[userIndex].updatedAt = new Date().toISOString();
    await writeUsers(users);

    const userResponse = { ...users[userIndex] };
    delete userResponse.password;
    res.json({ success: true, message: `Status updated to ${accountStatus}`, user: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add funds to user wallet
router.post('/users/:id/wallet/add', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type } = req.body; // type: 'real' or 'paper'
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount required' });

    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    if (type === 'real') users[userIndex].realBalance += parseFloat(amount);
    else if (type === 'paper') users[userIndex].paperBalance += parseFloat(amount);
    else return res.status(400).json({ error: 'Invalid type (must be real or paper)' });

    users[userIndex].updatedAt = new Date().toISOString();
    await writeUsers(users);
    res.json({ success: true, message: `Added ${amount} to ${type} balance`, user: users[userIndex] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deduct funds from user wallet
router.post('/users/:id/wallet/deduct', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let { amount, type } = req.body;
    amount = Number(amount);
    if (!amount || amount <= 0) return res.status(400).json({ success: false, error: 'Invalid amount' });

    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) return res.status(404).json({ success: false, error: 'User not found' });

    const user = users[userIndex];
    if (type === 'paper') {
      if (user.paperBalance < amount) return res.status(400).json({ success: false, error: 'Insufficient paper balance' });
      user.paperBalance -= amount;
    } else {
      if (user.realBalance < amount) return res.status(400).json({ success: false, error: 'Insufficient real balance' });
      user.realBalance -= amount;
    }
    user.updatedAt = new Date().toISOString();
    await writeUsers(users);
    res.json({ success: true, message: `Funds deducted from ${type === 'paper' ? 'paper balance' : 'real balance'}`, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all trades
router.get('/trades', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const trades = await readTrades();
    const normalized = trades.map(t => ({
      id: t.id || '',
      userId: t.userId || '',
      userName: t.userName || 'Unknown',
      symbol: t.symbol || 'N/A',
      side: t.side ? t.side.toLowerCase() : 'long',
      size: t.size || 0,
      entryPrice: t.entryPrice || 0,
      currentPrice: t.currentPrice || t.entryPrice || 0,
      pnl: t.pnl || 0,
      status: (t.status || 'unknown').toLowerCase(),
      createdAt: t.createdAt || t.timestamp || '',
      ...t
    }));
    res.json(normalized);
  } catch (error) {
    res.status(500).json([]);
  }
});

// Get all orders
router.get('/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await readOrders();
    const normalized = orders.map(o => ({
      id: o.id || '',
      userId: o.userId || '',
      userName: o.userName || 'Unknown',
      symbol: o.symbol || 'N/A',
      side: o.side || 'buy',
      size: o.size || 0,
      entryPrice: o.entryPrice || 0,
      currentPrice: o.currentPrice || 0,
      pnl: o.pnl || 0,
      status: o.status || 'open',
      createdAt: o.createdAt || o.timestamp || '',
      ...o
    }));
    res.json(normalized);
  } catch (error) {
    res.status(500).json([]);
  }
});

// Get platform statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
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
      totalRealBalance: users.reduce((sum, u) => sum + (u.realBalance || 0), 0),
      totalPaperBalance: users.reduce((sum, u) => sum + (u.paperBalance || 0), 0),
      activeChallenges: users.filter(u => u.currentChallenge).length
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all payments
router.get('/payments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const payments = await readPayments();
    payments.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    res.json(payments);
  } catch (error) {
    res.status(500).json([]);
  }
});

// Get all withdrawals
router.get('/withdrawals', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let withdrawals = await readWithdrawals();
    const { status } = req.query;
    if (status && status !== 'all') {
      withdrawals = withdrawals.filter(w => w.status === status);
    }
    withdrawals.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json([]);
  }
});

// Approve withdrawal
router.post('/withdrawal/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;
    if (!transactionId) return res.status(400).json({ success: false, error: 'Transaction ID required' });

    const withdrawals = await readWithdrawals();
    const wIndex = withdrawals.findIndex(w => w.id === id);
    if (wIndex === -1) return res.status(404).json({ success: false, error: 'Withdrawal not found' });
    if (withdrawals[wIndex].status !== 'pending') return res.status(400).json({ success: false, error: 'Not pending' });

    withdrawals[wIndex].status = 'approved';
    withdrawals[wIndex].transactionId = transactionId;
    withdrawals[wIndex].processedAt = new Date().toISOString();
    withdrawals[wIndex].processedBy = 'admin';
    await writeWithdrawals(withdrawals);
    res.json({ success: true, message: 'Withdrawal approved', withdrawal: withdrawals[wIndex] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reject withdrawal
router.post('/withdrawal/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, error: 'Rejection reason required' });

    const withdrawals = await readWithdrawals();
    const users = await readUsers();
    const wIndex = withdrawals.findIndex(w => w.id === id);
    if (wIndex === -1) return res.status(404).json({ success: false, error: 'Withdrawal not found' });
    if (withdrawals[wIndex].status !== 'pending') return res.status(400).json({ success: false, error: 'Not pending' });

    const withdrawal = withdrawals[wIndex];
    withdrawal.status = 'rejected';
    withdrawal.rejectionReason = reason;
    withdrawal.processedAt = new Date().toISOString();
    withdrawal.processedBy = 'admin';

    // Return money to user
    const userIndex = users.findIndex(u => u.id === withdrawal.userId);
    if (userIndex !== -1) {
      users[userIndex].realBalance += withdrawal.amount;
      users[userIndex].updatedAt = new Date().toISOString();
      await writeUsers(users);
    }
    await writeWithdrawals(withdrawals);
    res.json({ success: true, message: 'Withdrawal rejected', withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== Referral management endpoints =====
// Get all users with referral data
router.get('/referrals', authenticateToken, requireAdmin, async (req, res) => {
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
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get referral settings
router.get('/referral-settings', authenticateToken, requireAdmin, async (req, res) => {
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

// Update referral settings
router.put('/referral-settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { referralTarget, referralRewardName, referralRewardAmount } = req.body;
    const settings = await readSettings();

    if (referralTarget !== undefined) settings.referralTarget = parseInt(referralTarget);
    if (referralRewardName !== undefined) settings.referralRewardName = referralRewardName;
    if (referralRewardAmount !== undefined) settings.referralRewardAmount = parseFloat(referralRewardAmount);

    settings.updatedAt = new Date().toISOString();
    settings.updatedBy = req.userId;
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

// Approve referral reward for a user
router.post('/referrals/approve/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ success: false, error: 'User not found' });

    const user = users[userIndex];
    if (user.referralReward?.awarded) {
      return res.json({ success: false, error: 'Reward already awarded' });
    }

    const settings = await readSettings();
    const target = settings.referralTarget || 20;
    const rewardName = settings.referralRewardName || 'Beginner Challenge';
    const rewardAmount = settings.referralRewardAmount || 20000;

    if ((user.referralCount || 0) < target) {
      return res.json({ success: false, error: `User has only ${user.referralCount} referrals, need ${target}` });
    }

    // Grant reward
    user.paperBalance = (user.paperBalance || 0) + rewardAmount;
    user.currentChallenge = rewardName;
    user.referralReward = {
      awarded: true,
      awardedAt: new Date().toISOString(),
      rewardType: 'challenge',
      rewardName: rewardName,
      approvedBy: req.userId
    };

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

    users[userIndex] = user;
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

module.exports = router;
