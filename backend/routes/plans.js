const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Plan = require('../models/Plan');
const User = require('../models/User');

// Get all plans
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json({ success: true, plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch plans' });
  }
});

// Purchase plan
router.post('/purchase', auth, async (req, res) => {
  try {
    const { planId } = req.body;
    
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Update user's plan and paper balance
    user.currentPlan = planId;
    user.paperBalance = plan.paperMoney;
    await user.save();
    
    res.json({
      success: true,
      message: `Plan ${plan.name} purchased successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        realBalance: user.realBalance,
        paperBalance: user.paperBalance,
        accountStatus: user.accountStatus,
        currentPlan: user.currentPlan
      }
    });
  } catch (error) {
    console.error('Purchase plan error:', error);
    res.status(500).json({ success: false, error: 'Plan purchase failed' });
  }
});

module.exports = router;