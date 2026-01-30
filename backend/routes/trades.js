const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Trade = require('../models/Trade');
const User = require('../models/User');

// Create new trade
router.post('/', auth, async (req, res) => {
  try {
    const { symbol, side, size, leverage, entryPrice, stopLoss, takeProfit } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Check if user has sufficient paper balance
    const positionValue = entryPrice * size * leverage;
    if (positionValue > user.paperBalance) {
      return res.status(400).json({ success: false, error: 'Insufficient paper balance' });
    }
    
    // Deduct position value from paper balance
    user.paperBalance -= positionValue;
    await user.save();
    
    // Create new trade
    const trade = new Trade({
      user: user._id,
      symbol,
      side,
      size,
      leverage,
      entryPrice,
      stopLoss,
      takeProfit,
      positionValue,
      currentPrice: entryPrice
    });
    
    await trade.save();
    
    res.json({
      success: true,
      trade,
      newBalance: user.paperBalance
    });
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({ success: false, error: 'Trade creation failed' });
  }
});

// Get user's trades
router.get('/my-trades', auth, async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user.userId })
      .sort({ entryTime: -1 })
      .limit(50);
    
    res.json({ success: true, trades });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trades' });
  }
});

// Close trade
router.post('/:id/close', auth, async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user.userId,
      status: 'OPEN'
    });
    
    if (!trade) {
      return res.status(404).json({ success: false, error: 'Trade not found or already closed' });
    }
    
    const user = await User.findById(req.user.userId);
    
    // Calculate PnL
    const currentPrice = trade.currentPrice;
    const pnl = (currentPrice - trade.entryPrice) * trade.size * trade.leverage * 
                (trade.side === 'LONG' ? 1 : -1);
    
    // Update trade
    trade.status = 'CLOSED';
    trade.pnl = pnl;
    trade.exitTime = Date.now();
    trade.closedAt = Date.now();
    trade.closeReason = 'MANUAL';
    await trade.save();
    
    // Update user balance
    user.paperBalance += trade.positionValue + pnl;
    await user.save();
    
    res.json({
      success: true,
      trade,
      newBalance: user.paperBalance
    });
  } catch (error) {
    console.error('Close trade error:', error);
    res.status(500).json({ success: false, error: 'Failed to close trade' });
  }
});

module.exports = router;