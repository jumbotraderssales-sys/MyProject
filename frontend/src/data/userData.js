export const userAccount = {
  id: 1,
  name: "Trader User",
  email: "user@paper2real.com",
  
  // Real Money (INR) - For buying plans
  realBalance: 5000,
  
  // Paper Money (USD) - For trading
  paperBalance: 100000,
  
  // Current Plan Details
  currentPlan: {
    name: "Plan A",
    planId: 1,
    purchasedDate: "2024-01-10",
    expiryDate: "2024-02-10",
    
    // Plan Conditions
    dailyLossLimit: 5, // 5%
    maxLossLimit: 50, // 50%
    profitPayoutRate: 10, // 10%
    minWithdrawal: 5, // 5%
    maxDailyWithdrawal: 4000,
    paperMoneyAllocated: 100000,
    
    // Performance Tracking
    startingBalance: 100000,
    currentBalance: 100000,
    maxBalanceReached: 100000,
    dailyPnL: 0,
    totalPnL: 0,
    drawdown: 0,
    
    // Breach Status
    dailyLossBreached: false,
    maxLossBreached: false,
    accountStatus: "active", // active, warning, breached, suspended, locked
    breachReason: "",
    breachDate: null
  },
  
  // Trading Statistics
  tradingStats: {
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    profitFactor: 0,
    averageWin: 0,
    averageLoss: 0
  },
  
  // Transaction History
  transactions: [
    {
      id: 1,
      type: "deposit",
      amount: 5000,
      method: "UPI",
      status: "completed",
      date: "2024-01-10"
    },
    {
      id: 2,
      type: "plan_purchase",
      plan: "Plan A",
      amount: 1000,
      status: "completed",
      date: "2024-01-10"
    }
  ],
  
  // Breach Notifications
  notifications: [
    {
      id: 1,
      type: "info",
      title: "Welcome to Plan A",
      message: "Your paper trading account has been credited with $100,000",
      date: "2024-01-10",
      read: true
    }
  ]
};