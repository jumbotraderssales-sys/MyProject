import React, { useState, useEffect } from 'react';
import { PlanMonitor } from '../utils/planMonitor';

const UserWallet = ({ userAccount, setUserAccount }) => {
  const [monitor, setMonitor] = useState(null);
  const [warnings, setWarnings] = useState([]);
  
  useEffect(() => {
    if (userAccount) {
      const planMonitor = new PlanMonitor(userAccount);
      setMonitor(planMonitor);
      
      // Check for breaches
      const currentWarnings = planMonitor.getAccountWarnings(userAccount.currentPlan.currentBalance);
      setWarnings(currentWarnings);
      
      // Update performance
      planMonitor.updatePerformance(userAccount.currentPlan.currentBalance);
    }
  }, [userAccount]);
  
  const handleDeposit = (amount) => {
    setUserAccount(prev => ({
      ...prev,
      realBalance: prev.realBalance + amount,
      transactions: [
        {
          id: Date.now(),
          type: "deposit",
          amount: amount,
          method: "UPI",
          status: "completed",
          date: new Date().toLocaleDateString()
        },
        ...prev.transactions
      ]
    }));
  };
  
  const handlePlanPurchase = (plan) => {
    if (userAccount.realBalance < plan.price) {
      alert("Insufficient balance!");
      return;
    }
    
    setUserAccount(prev => ({
      ...prev,
      realBalance: prev.realBalance - plan.price,
      paperBalance: plan.paperMoney,
      currentPlan: {
        ...plan,
        startingBalance: plan.paperMoney,
        currentBalance: plan.paperMoney,
        maxBalanceReached: plan.paperMoney,
        purchasedDate: new Date().toLocaleDateString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        accountStatus: "active",
        dailyLossBreached: false,
        maxLossBreached: false
      },
      notifications: [
        {
          id: Date.now(),
          type: "success",
          title: "Plan Activated!",
          message: `Your ${plan.name} has been activated. $${plan.paperMoney} credited to paper balance.`,
          date: new Date().toLocaleString(),
          read: false
        },
        ...prev.notifications
      ],
      transactions: [
        {
          id: Date.now(),
          type: "plan_purchase",
          plan: plan.name,
          amount: plan.price,
          status: "completed",
          date: new Date().toLocaleString()
        },
        ...prev.transactions
      ]
    }));
  };
  
  const handleWithdrawal = (amount) => {
    if (amount < userAccount.currentPlan.minWithdrawal) {
      alert(`Minimum withdrawal is ${userAccount.currentPlan.minWithdrawal}%`);
      return;
    }
    
    if (amount > userAccount.currentPlan.maxDailyWithdrawal) {
      alert(`Maximum daily withdrawal is ${userAccount.currentPlan.maxDailyWithdrawal}`);
      return;
    }
    
    setUserAccount(prev => ({
      ...prev,
      realBalance: prev.realBalance + amount,
      transactions: [
        {
          id: Date.now(),
          type: "withdrawal",
          amount: amount,
          status: "pending",
          date: new Date().toLocaleString()
        },
        ...prev.transactions
      ]
    }));
  };
  
  return (
    <div className="user-wallet">
      {/* Account Status Banner */}
      {userAccount.currentPlan?.accountStatus === "breached" && (
        <div className="breach-banner critical">
          ⚠️ ACCOUNT BREACHED: {userAccount.currentPlan.breachReason}
        </div>
      )}
      
      {userAccount.currentPlan?.accountStatus === "warning" && (
        <div className="breach-banner warning">
          ⚠️ WARNING: Approaching loss limits
        </div>
      )}
      
      {/* Wallet Overview */}
      <div className="wallet-overview">
        <div className="balance-card">
          <h3>Real Balance</h3>
          <div className="balance-amount">₹{userAccount.realBalance.toLocaleString()}</div>
          <button 
            className="deposit-btn"
            onClick={() => handleDeposit(1000)}
          >
            + Add Money
          </button>
        </div>
        
        <div className="balance-card">
          <h3>Paper Balance</h3>
          <div className="balance-amount">${userAccount.paperBalance.toLocaleString()}</div>
          <div className="balance-subtext">
            {userAccount.currentPlan?.name || "No Active Plan"}
          </div>
        </div>
        
        <div className="balance-card">
          <h3>Plan P&L</h3>
          <div className={`balance-amount ${userAccount.currentPlan?.totalPnL >= 0 ? 'positive' : 'negative'}`}>
            {userAccount.currentPlan?.totalPnL >= 0 ? '+' : ''}{userAccount.currentPlan?.totalPnL?.toFixed(2) || '0.00'}%
          </div>
          <div className="balance-subtext">
            Drawdown: {userAccount.currentPlan?.drawdown?.toFixed(2) || '0.00'}%
          </div>
        </div>
      </div>
      
      {/* Plan Conditions */}
      {userAccount.currentPlan && (
        <div className="plan-conditions">
          <h3>Plan Conditions</h3>
          <div className="conditions-grid">
            <div className={`condition-card ${warnings.some(w => w.type === 'daily_loss') ? 'critical' : ''}`}>
              <h4>Daily Loss Limit</h4>
              <div className="condition-value">
                {warnings.find(w => w.type === 'daily_loss')?.currentLoss || '0.00'}% / {userAccount.currentPlan.dailyLossLimit}%
              </div>
              <div className="condition-progress">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${Math.min(100, (Math.abs(warnings.find(w => w.type === 'daily_loss')?.currentLoss || 0) / userAccount.currentPlan.dailyLossLimit) * 100)}%`,
                    backgroundColor: warnings.some(w => w.type === 'daily_loss') ? '#ef4444' : '#f59e0b'
                  }}
                ></div>
              </div>
            </div>
            
            <div className={`condition-card ${warnings.some(w => w.type === 'max_loss') ? 'critical' : ''}`}>
              <h4>Max Loss Limit</h4>
              <div className="condition-value">
                {warnings.find(w => w.type === 'max_loss')?.currentLoss || '0.00'}% / {userAccount.currentPlan.maxLossLimit}%
              </div>
              <div className="condition-progress">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${Math.min(100, ((warnings.find(w => w.type === 'max_loss')?.currentLoss || 0) / userAccount.currentPlan.maxLossLimit) * 100)}%`,
                    backgroundColor: warnings.some(w => w.type === 'max_loss') ? '#ef4444' : '#10b981'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="condition-card">
              <h4>Profit Payout</h4>
              <div className="condition-value">
                {userAccount.currentPlan.profitPayoutRate}%
              </div>
              <div className="condition-subtext">
                of paper profits
              </div>
            </div>
            
            <div className="condition-card">
              <h4>Plan Validity</h4>
              <div className="condition-value">
                {userAccount.currentPlan.expiryDate}
              </div>
              <div className="condition-subtext">
                {Math.ceil((new Date(userAccount.currentPlan.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Warnings & Notifications */}
      {warnings.length > 0 && (
        <div className="warnings-section">
          <h3>⚠️ Account Warnings</h3>
          <div className="warnings-list">
            {warnings.map((warning, index) => (
              <div key={index} className={`warning-item ${warning.level}`}>
                {warning.message}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Notifications */}
      <div className="notifications-section">
        <h3>Notifications ({userAccount.notifications.filter(n => !n.read).length})</h3>
        <div className="notifications-list">
          {userAccount.notifications.slice(0, 5).map(notification => (
            <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
              <div className="notification-header">
                <span className="notification-type">{notification.type}</span>
                <span className="notification-date">{notification.date}</span>
              </div>
              <div className="notification-title">{notification.title}</div>
              <div className="notification-message">{notification.message}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Transaction History */}
      <div className="transaction-history">
        <h3>Transaction History</h3>
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {userAccount.transactions.slice(0, 10).map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td>
                    <span className={`transaction-type ${transaction.type}`}>
                      {transaction.type.toUpperCase()}
                    </span>
                  </td>
                  <td className={`amount ${transaction.type}`}>
                    {transaction.type === 'deposit' || transaction.type === 'withdrawal' ? '₹' : '$'}{transaction.amount}
                  </td>
                  <td>
                    <span className={`status ${transaction.status}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td>{transaction.plan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserWallet;