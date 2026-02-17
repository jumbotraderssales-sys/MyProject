const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// ===== Helper functions =====
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

const writeSettings = async (settings) => {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
};

const readReferrals = async () => {
  try {
    const data = await fs.readFile(REFERRALS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeReferrals = async (referrals) => {
  await fs.writeFile(REFERRALS_FILE, JSON.stringify(referrals, null, 2));
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

// ===== Admin endpoints =====

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
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

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

// Dashboard stats
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await readUsers();
    const trades = await readTrades();
    const payments = await readPayments();
    const withdrawals = await readWithdrawals();

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.accountStatus === 'active').length,
      suspendedUsers: users.filter(u => u.accountStatus === 'suspended').length,
      totalTrades: trades.length,
      openTrades: trades.filter(t => t.status === 'open').length,
      totalRevenue: payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length,
      recentUsers: users.slice(0, 10).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        accountStatus: u.accountStatus
      }))
    };
    res.json({ success: true, stats });
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
        rewardName: user.referralReward?.rewardName || null
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
    user.currentChallenge = rewardName; // or currentPlan if you prefer
    user.referralReward = {
      awarded: true,
      awardedAt: new Date().toISOString(),
      rewardType: 'challenge',
      rewardName: rewardName,
      approvedBy: req.userId
    };

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
