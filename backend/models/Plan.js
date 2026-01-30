const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  paperMoney: {
    type: Number,
    required: true
  },
  dailyLoss: {
    type: String,
    required: true
  },
  maxLoss: {
    type: String,
    required: true
  },
  profitPayout: {
    type: String,
    required: true
  },
  minWithdrawal: {
    type: String,
    required: true
  },
  maxWithdrawal: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Plan', planSchema);