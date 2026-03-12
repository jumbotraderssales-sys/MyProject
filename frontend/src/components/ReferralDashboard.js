import React, { useState, useEffect } from 'react';
import './ReferralDashboard.css';

const ReferralDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const baseURL = process.env.REACT_APP_API_URL || 'https://myproject1-d097.onrender.com';

      const res = await fetch(`${baseURL}/api/user/referral-dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch referral data');
      const data = await res.json();
      
      if (data.success) {
        setDashboardData(data);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (dashboardData?.referralLink) {
      navigator.clipboard.writeText(dashboardData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWithdrawRequest = async () => {
    if (!withdrawAmount || withdrawAmount < 500) {
      alert('Minimum withdrawal amount is ₹500');
      return;
    }

    if (withdrawAmount > dashboardData.stats.availableBalance) {
      alert('Insufficient balance');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const baseURL = process.env.REACT_APP_API_URL || 'https://myproject1-d097.onrender.com';

      const res = await fetch(`${baseURL}/api/user/referral/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount)
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Withdrawal request submitted for ₹${withdrawAmount}`);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        fetchDashboardData(); // Refresh data
      } else {
        alert(data.error || 'Withdrawal failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="loading-container">Loading referral dashboard...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;
  if (!dashboardData) return null;

  const { stats, referredUsers, commissionWithdrawals, referralCode, referralLink, settings } = dashboardData;

  return (
    <div className="referral-dashboard">
      {/* Header */}
      <div className="referral-header">
        <h1><i className="fas fa-gift"></i> Referral Program</h1>
        <p className="header-subtitle">Earn 10% commission on all referral transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total-earned">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Earned</h3>
            <div className="stat-value">₹{stats.totalEarned.toLocaleString()}</div>
            <div className="stat-detail">
              Challenge: ₹{stats.totalChallengeCommission.toLocaleString()} | 
              Funded: ₹{stats.totalFundedCommission.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="stat-card available">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <h3>Available Balance</h3>
            <div className="stat-value">₹{stats.availableBalance.toLocaleString()}</div>
            <button 
              className="withdraw-btn"
              onClick={() => setShowWithdrawModal(true)}
              disabled={stats.availableBalance < 500}
            >
              {stats.availableBalance >= 500 ? 'Withdraw' : 'Min ₹500'}
            </button>
          </div>
        </div>

        <div className="stat-card referrals">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Referrals</h3>
            <div className="stat-value">{stats.totalReferrals}</div>
            <div className="stat-detail">
              {stats.activeReferrals} Active | {stats.pendingReferrals} Pending
            </div>
          </div>
        </div>

        <div className="stat-card monthly">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>This Month</h3>
            <div className="stat-value">₹{stats.monthlyEarnings.toLocaleString()}</div>
            <div className="stat-detail">
              {stats.pendingWithdrawals} pending withdrawals
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="referral-link-section">
        <h3><i className="fas fa-link"></i> Your Referral Link</h3>
        <div className="link-container">
          <div className="link-box">
            <code>{referralLink}</code>
          </div>
          <button className="copy-btn" onClick={copyReferralLink}>
            {copied ? '✅ Copied!' : '📋 Copy Link'}
          </button>
        </div>
        <div className="commission-info">
          <i className="fas fa-info-circle"></i>
          <span>You earn <strong>10% commission</strong> on every challenge purchase and funded withdrawal made by your referrals</span>
        </div>
      </div>

      {/* Commission Breakdown */}
      <div className="commission-breakdown">
        <h3><i className="fas fa-chart-pie"></i> How You Earn</h3>
        <div className="breakdown-grid">
          <div className="breakdown-card challenge">
            <div className="breakdown-icon">🎯</div>
            <h4>Challenge Purchases</h4>
            <p>10% of every challenge fee paid by your referrals</p>
            <div className="example">Example: ₹1,000 challenge = ₹100 commission</div>
          </div>
          <div className="breakdown-card funded">
            <div className="breakdown-icon">💎</div>
            <h4>Funded Withdrawals</h4>
            <p>10% of every profit withdrawal from funded accounts</p>
            <div className="example">Example: ₹10,000 withdrawal = ₹1,000 commission</div>
          </div>
        </div>
      </div>

      {/* Referred Users Table */}
      <div className="referred-users-section">
        <h3><i className="fas fa-users"></i> Your Referrals ({referredUsers.length})</h3>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Joined</th>
                <th>Challenges</th>
                <th>Challenge Commission</th>
                <th>Funded Withdrawals</th>
                <th>Funded Commission</th>
                <th>Total Commission</th>
                <th>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {referredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">{user.name.charAt(0)}</div>
                      <div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{new Date(user.joinedAt).toLocaleDateString()}</td>
                  <td>{user.challengePurchases}</td>
                  <td className="commission positive">₹{user.challengeCommission.toLocaleString()}</td>
                  <td>{user.fundedWithdrawals}</td>
                  <td className="commission positive">₹{user.fundedCommission.toLocaleString()}</td>
                  <td className="total-commission">₹{user.totalCommission.toLocaleString()}</td>
                  <td>{new Date(user.lastActivity).toLocaleDateString()}</td>
                </tr>
              ))}
              {referredUsers.length === 0 && (
                <tr>
                  <td colSpan="8" className="no-data">
                    No referrals yet. Share your link to start earning!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal History */}
      {commissionWithdrawals.length > 0 && (
        <div className="withdrawal-history">
          <h3><i className="fas fa-history"></i> Withdrawal History</h3>
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {commissionWithdrawals.map(w => (
                  <tr key={w.id}>
                    <td>{new Date(w.requestedAt).toLocaleDateString()}</td>
                    <td className="commission">₹{w.amount.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${w.status}`}>
                        {w.status}
                      </span>
                    </td>
                    <td>
                      {w.transactionId ? (
                        <code>{w.transactionId}</code>
                      ) : w.rejectionReason ? (
                        <span className="rejection" title={w.rejectionReason}>❌ Rejected</span>
                      ) : (
                        'Pending'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Withdraw Commission</h2>
            
            <div className="balance-info">
              <span>Available Balance:</span>
              <strong>₹{stats.availableBalance.toLocaleString()}</strong>
            </div>
            
            <div className="form-group">
              <label>Amount (₹) - Min ₹500</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                max={stats.availableBalance}
              />
            </div>

            <div className="info-box">
              <i className="fas fa-info-circle"></i>
              <span>Withdrawals will be processed within 24-48 hours to your registered bank account</span>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-primary"
                onClick={handleWithdrawRequest}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Request Withdrawal'}
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowWithdrawModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralDashboard;
