const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// ===== Helper functions =====
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const REFERRALS_FILE = path.join(__dirname, '..', 'data', 'referrals.json');

const readUsers = async () => {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
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
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token provided' });

  const userId = token.replace('token-', '');
  req.userId = userId;
  next();
};

// ===== User endpoints =====

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === req.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const userResponse = { ...user };
    delete userResponse.password;
    res.json({ success: true, user: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user profile (only name allowed)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === req.userId);
    if (userIndex === -1) return res.status(404).json({ success: false, error: 'User not found' });

    if (name) users[userIndex].name = name;
    users[userIndex].updatedAt = new Date().toISOString();
    await writeUsers(users);

    const userResponse = { ...users[userIndex] };
    delete userResponse.password;
    res.json({ success: true, message: 'Profile updated', user: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get referral info for the logged-in user
router.get('/referral', authenticateToken, async (req, res) => {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === req.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const referrals = await readReferrals();
    const referredUsers = referrals
      .filter(r => r.referrerId === user.id)
      .map(r => ({
        id: r.referredId,
        name: r.referredName,
        email: r.referredEmail,
        joinedAt: r.createdAt
      }));

    // Read settings
    const SETTINGS_FILE = path.join(__dirname, '..', 'data', 'settings.json');
    let settings = {};
    try {
      settings = JSON.parse(await fs.readFile(SETTINGS_FILE, 'utf8'));
    } catch {
      settings = {
        referralTarget: 20,
        referralRewardName: 'Beginner Challenge',
        referralRewardAmount: 20000
      };
    }

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
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper to write users (only used in this file for profile update)
const writeUsers = async (users) => {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
};

module.exports = router;
