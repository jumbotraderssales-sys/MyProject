import React, { useState, useEffect } from 'react';
import './ReferralsPage.css';

const ReferralsPage = () => {
  const [users, setUsers] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    usersWithReferrals: 0,
    totalEarnedAll: 0,
    totalPaidAll: 0,
    totalPendingAll: 0
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'commissions'

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const baseURL = process.env.REACT_APP_API_URL || 'https://myproject1-d097.onrender.com';

      // Fetch both user referrals and commission data
      const [usersRes, commissionsRes] = await Promise.all([
        fetch(`${baseURL}/api/admin/referrals`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseURL}/api/admin/referral-commissions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!usersRes.ok || !commissionsRes.ok) {
        throw new Error('Failed to fetch referral data');
      }

      const usersData = await usersRes.json();
      const commissionsData = await commissionsRes.json();

      if (usersData.success) {
        setUsers(usersData.users);
      }
      
      if (commissionsData.success) {
        setCommissions(commissionsData.commissions);
        setSummary(commissionsData.summary);
      }

    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const handleApproveReward = async (userId) => {
    if (!window.confirm('Approve referral reward for this user?')) return;
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const baseURL = process.env.REACT_APP_API_URL || 'https://myproject1-d097.onrender.com';

      const res = await fetch(`${baseURL}/api/admin/referrals/approve/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Reward approved successfully');
        fetchReferralData();
      } else {
        alert(data.error || 'Approval failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveCommission = async (userId, amount) => {
    // This would be implemented for commission withdrawal approval
    console.log('Approve commission:', userId, amount);
  };

  if (loading) return <div className="loading-container">Loading referral data...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;

  return (
    <div className="referrals-page">
      <div className="page-header">
        <h1>Referral Management</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={fetchReferralData} disabled={loading}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <div className="stat-value">{summary.totalUsers}</div>
            <div className="stat-detail">{summary.usersWithReferrals} with referrals</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Earned</h3>
            <div className="stat-value">₹{summary.totalEarnedAll.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <h3>Total Paid</h3>
            <div className="stat-value">₹{summary.totalPaidAll.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending</h3>
            <div className="stat-value">₹{summary.totalPendingAll.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="fas fa-users"></i> Users & Rewards
        </button>
        <button 
          className={`tab ${activeTab === 'commissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('commissions')}
        >
          <i className="fas fa-chart-line"></i> Commission Tracking
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="referrals-table-container">
          <table className="referrals-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Referral Code</th>
                <th>Referral Count</th>
                <th>Active Referrals</th>
                <th>Reward Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td><code>{user.referralCode}</code></td>
                  <td>{user.referralCount}</td>
                  <td>{user.referredUsers?.length || 0}</td>
                  <td>
                    {user.rewardAwarded ? (
                      <span className="badge success">Awarded</span>
                    ) : user.referralCount >= 20 ? (
                      <span className="badge warning">Pending</span>
                    ) : (
                      <span className="badge">Not reached</span>
                    )}
                  </td>
                  <td>
                    {!user.rewardAwarded && user.referralCount >= 20 && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleApproveReward(user.id)}
                        disabled={processing}
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'commissions' && (
        <div className="commissions-table-container">
          <table className="commissions-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Referrals</th>
                <th>Active</th>
                <th>Total Earned</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Available</th>
                <th>Last Withdrawal</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map(comm => (
                <tr key={comm.userId}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">{comm.userName?.charAt(0)}</div>
                      <span>{comm.userName}</span>
                    </div>
                  </td>
                  <td>{comm.userEmail}</td>
                  <td>{comm.referralCount}</td>
                  <td>{comm.activeReferrals}</td>
                  <td className="amount positive">₹{comm.totalEarned.toLocaleString()}</td>
                  <td className="amount">₹{comm.paidCommission.toLocaleString()}</td>
                  <td className="amount warning">₹{comm.pendingCommission.toLocaleString()}</td>
                  <td className="amount success">₹{comm.availableBalance.toLocaleString()}</td>
                  <td>
                    {comm.lastWithdrawal 
                      ? new Date(comm.lastWithdrawal).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReferralsPage;
