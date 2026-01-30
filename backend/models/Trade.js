const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  side: {
    type: String,
    enum: ['LONG', 'SHORT'],
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  leverage: {
    type: Number,
    required: true,
    default: 1
  },
  entryPrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  stopLoss: {
    type: Number,
    default: 0
  },
  takeProfit: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED', 'PENDING'],
    default: 'OPEN'
  },
  pnl: {
    type: Number,
    default: 0
  },
  positionValue: {
    type: Number,
    default: 0
  },
  closeReason: {
    type: String,
    enum: ['MANUAL', 'STOP_LOSS', 'TAKE_PROFIT', 'MARGIN_CALL'],
    default: null
  },
  entryTime: {
    type: Date,
    default: Date.now
  },
  exitTime: {
    type: Date,
    default: null
  },
  closedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Trade', tradeSchema);