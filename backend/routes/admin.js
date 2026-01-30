const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Admin middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

// Get all users (admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// Update user status (admin only)
router.put('/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { accountStatus } = req.body;
    const userId = req.params.id;
    
    if (!['active', 'suspended', 'blocked'].includes(accountStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    user.accountStatus = accountStatus;
    await user.save();
    
    res.json({
      success: true,
      message: `User status updated to ${accountStatus}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update user status' });
  }
});

// Get admin dashboard stats
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ accountStatus: 'active' });
    const totalRevenue = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$realBalance' } } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers: await User.countDocuments({ accountStatus: 'suspended' }),
        totalRevenue: totalRevenue[0]?.total || 0,
        recentUsers: await User.find({})
          .select('name email createdAt accountStatus')
          .sort({ createdAt: -1 })
          .limit(10)
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;