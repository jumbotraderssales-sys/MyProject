export class PlanMonitor {
  constructor(userAccount) {
    this.userAccount = userAccount;
    this.plan = userAccount.currentPlan;
  }
  
  // Check if daily loss limit is breached
  checkDailyLossLimit(currentBalance) {
    const startingDailyBalance = this.plan.currentBalance;
    const dailyPnL = ((currentBalance - startingDailyBalance) / startingDailyBalance) * 100;
    
    if (dailyPnL <= -this.plan.dailyLossLimit) {
      return {
        breached: true,
        type: "daily_loss",
        currentLoss: Math.abs(dailyPnL).toFixed(2),
        allowedLoss: this.plan.dailyLossLimit,
        message: `Daily loss limit breached! You lost ${Math.abs(dailyPnL).toFixed(2)}% (Limit: ${this.plan.dailyLossLimit}%)`
      };
    }
    
    return { breached: false, dailyPnL: dailyPnL.toFixed(2) };
  }
  
  // Check if max loss limit is breached
  checkMaxLossLimit(currentBalance) {
    const startingBalance = this.plan.startingBalance;
    const totalLoss = ((startingBalance - currentBalance) / startingBalance) * 100;
    
    if (totalLoss >= this.plan.maxLossLimit) {
      return {
        breached: true,
        type: "max_loss",
        currentLoss: totalLoss.toFixed(2),
        allowedLoss: this.plan.maxLossLimit,
        message: `Maximum loss limit breached! Total loss: ${totalLoss.toFixed(2)}% (Limit: ${this.plan.maxLossLimit}%)`
      };
    }
    
    return { breached: false, totalLoss: totalLoss.toFixed(2) };
  }
  
  // Check for profit payout eligibility
  checkProfitPayout(currentBalance) {
    const profit = currentBalance - this.plan.startingBalance;
    if (profit > 0) {
      const eligiblePayout = (profit * this.plan.profitPayoutRate) / 100;
      return {
        eligible: true,
        profit: profit.toFixed(2),
        payoutRate: this.plan.profitPayoutRate,
        eligibleAmount: eligiblePayout.toFixed(2),
        message: `You're eligible for ₹${eligiblePayout.toFixed(2)} payout!`
      };
    }
    return { eligible: false };
  }
  
  // Update plan performance
  updatePerformance(currentBalance) {
    const startingBalance = this.plan.startingBalance;
    const totalPnL = ((currentBalance - startingBalance) / startingBalance) * 100;
    
    // Update max balance reached
    if (currentBalance > this.plan.maxBalanceReached) {
      this.plan.maxBalanceReached = currentBalance;
    }
    
    // Calculate drawdown
    const drawdown = ((this.plan.maxBalanceReached - currentBalance) / this.plan.maxBalanceReached) * 100;
    
    this.plan.currentBalance = currentBalance;
    this.plan.totalPnL = totalPnL;
    this.plan.drawdown = drawdown;
    
    return {
      totalPnL: totalPnL.toFixed(2),
      drawdown: drawdown.toFixed(2),
      maxBalance: this.plan.maxBalanceReached.toFixed(2)
    };
  }
  
  // Get account warnings
  getAccountWarnings(currentBalance) {
    const warnings = [];
    
    // Check daily loss
    const dailyCheck = this.checkDailyLossLimit(currentBalance);
    if (dailyCheck.breached) {
      warnings.push({
        level: "critical",
        type: "daily_loss",
        message: dailyCheck.message
      });
    } else if (dailyCheck.dailyPnL <= -this.plan.dailyLossLimit * 0.8) {
      warnings.push({
        level: "warning",
        type: "daily_loss_warning",
        message: `Warning: Daily loss approaching limit (${Math.abs(dailyCheck.dailyPnL)}% / ${this.plan.dailyLossLimit}%)`
      });
    }
    
    // Check max loss
    const maxCheck = this.checkMaxLossLimit(currentBalance);
    if (maxCheck.breached) {
      warnings.push({
        level: "critical",
        type: "max_loss",
        message: maxCheck.message
      });
    } else if (maxCheck.totalLoss >= this.plan.maxLossLimit * 0.8) {
      warnings.push({
        level: "warning",
        type: "max_loss_warning",
        message: `Warning: Maximum loss approaching limit (${maxCheck.totalLoss}% / ${this.plan.maxLossLimit}%)`
      });
    }
    
    return warnings;
  }
}