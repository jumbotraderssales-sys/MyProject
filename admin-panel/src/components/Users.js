// src/components/Users.js (UserDetail component)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDatabase } from '../contexts/DatabaseContext'; // Fixed: contexts with 's'

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, updateUserBalance } = useDatabase();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  // ===== REFERRAL DATA =====
  const [referredUsers, setReferredUsers] = useState([]);

  useEffect(() => {
    const foundUser = users.find(u => u.id === parseInt(id));
    if (foundUser) {
      setUser(foundUser);
      setFormData(foundUser);
      // Fetch referred users if available (you may need to extend your data)
      // For now, if the user object has a referredUsers array, use it
      if (foundUser.referredUsers) {
        const referred = users.filter(u => foundUser.referredUsers.includes(u.id));
        setReferredUsers(referred);
      } else {
        setReferredUsers([]);
      }
    } else {
      navigate('/users');
    }
  }, [id, users, navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleSave = () => {
    // In real app, update user via API
    alert('User updated successfully!');
    setEditing(false);
  };

  const handleBalanceUpdate = (amount, type) => {
    if (amount <= 0) {
      alert('Please enter valid amount');
      return;
    }

    if (type === 'withdrawal' && amount > user.balance) {
      alert('Insufficient balance');
      return;
    }

    updateUserBalance(user.id, amount, type, 'Admin adjustment');
    alert('Balance updated successfully!');
  };

  return (
    <div className="user-detail">
      <div className="user-header">
        <h1>{user.firstName} {user.lastName} <small>(ID: #{user.id})</small></h1>
        <div className="user-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/users')}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
          <button 
            className="btn btn-warning"
            onClick={() => setEditing(!editing)}
          >
            <i className="fas fa-edit"></i> {editing ? 'Cancel Edit' : 'Edit User'}
          </button>
          <button className="btn btn-primary">
            <i className="fas fa-download"></i> Export Data
          </button>
        </div>
      </div>

      <div className="user-content">
        {/* Personal Information */}
        <div className="content-section">
          <div className="section-header">
            <h2>Personal Information</h2>
          </div>
          <div className="section-content">
            <div className="info-grid">
              <div className="info-group">
                <label>First Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                ) : (
                  <div className="info-value">{user.firstName}</div>
                )}
              </div>
              
              <div className="info-group">
                <label>Last Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                ) : (
                  <div className="info-value">{user.lastName}</div>
                )}
              </div>
              
              <div className="info-group">
                <label>Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                ) : (
                  <div className="info-value">{user.email}</div>
                )}
              </div>
              
              <div className="info-group">
                <label>Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                ) : (
                  <div className="info-value">{user.phone}</div>
                )}
              </div>
              
              {editing && (
                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleSave}>
                    Save Changes
                  </button>
                </div>
              )}
            </div>
            
            {/* Verification Status */}
            <div className="verification-section">
              <h3>Verification Status</h3>
              <div className="verification-grid">
                <div className="verification-item">
                  <span>Email</span>
                  <span className={`badge ${user.verification?.email ? 'badge-success' : 'badge-warning'}`}>
                    {user.verification?.email ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="verification-item">
                  <span>Mobile</span>
                  <span className={`badge ${user.verification?.mobile ? 'badge-success' : 'badge-warning'}`}>
                    {user.verification?.mobile ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="verification-item">
                  <span>2FA</span>
                  <span className={`badge ${user.verification?.twoFA ? 'badge-success' : 'badge-warning'}`}>
                    {user.verification?.twoFA ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="verification-item">
                  <span>KYC</span>
                  <span className={`badge ${user.verification?.kyc ? 'badge-success' : 'badge-warning'}`}>
                    {user.verification?.kyc ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== NEW REFERRAL INFORMATION SECTION ===== */}
        <div className="content-section">
          <div className="section-header">
            <h2>Referral Information</h2>
          </div>
          <div className="section-content">
            <div className="referral-summary">
              <div className="info-row">
                <label>Referral Code:</label>
                <span><code>{user.referralCode || 'Not generated'}</code></span>
              </div>
              <div className="info-row">
                <label>Referred By:</label>
                <span>
                  {user.referredBy ? (
                    <a href={`/user/${user.referredBy}`}>User #{user.referredBy}</a>
                  ) : 'Direct signup'}
                </span>
              </div>
              <div className="info-row">
                <label>Total Referrals:</label>
                <span>{user.referralCount || 0}</span>
              </div>
              <div className="info-row">
                <label>Reward Status:</label>
                <span>
                  {user.referralReward?.awarded ? (
                    <span className="badge badge-success">Awarded on {new Date(user.referralReward.awardedAt).toLocaleDateString()}</span>
                  ) : user.referralCount >= 20 ? (
                    <span className="badge badge-warning">Pending approval</span>
                  ) : (
                    <span className="badge">Not reached</span>
                  )}
                </span>
              </div>
            </div>

            {referredUsers.length > 0 && (
              <div className="referred-users">
                <h3>Referred Users ({referredUsers.length})</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referredUsers.map(ref => (
                      <tr key={ref.id}>
                        <td>#{ref.id}</td>
                        <td>{ref.firstName} {ref.lastName}</td>
                        <td>{ref.email}</td>
                        <td>{ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Management */}
        <div className="content-section">
          <div className="section-header">
            <h2>Wallet Management</h2>
          </div>
          <div className="section-content">
            <div className="wallet-stats">
              <div className="stat-card">
                <h3>Current Balance</h3>
                <div className="stat-value">${(user.balance || 0).toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <h3>Total Deposits</h3>
                <div className="stat-value">$2,540</div>
              </div>
              <div className="stat-card">
                <h3>Total Withdrawals</h3>
                <div className="stat-value">$1,290</div>
              </div>
            </div>
            
            <div className="balance-controls">
              <h3>Quick Adjustments</h3>
              <div className="adjustment-buttons">
                <button 
                  className="btn btn-success"
                  onClick={() => handleBalanceUpdate(100, 'deposit')}
                >
                  + $100
                </button>
                <button 
                  className="btn btn-success"
                  onClick={() => handleBalanceUpdate(500, 'deposit')}
                >
                  + $500
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleBalanceUpdate(100, 'withdrawal')}
                >
                  - $100
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleBalanceUpdate(500, 'withdrawal')}
                >
                  - $500
                </button>
              </div>
              
              <div className="custom-adjustment">
                <h4>Custom Amount</h4>
                <div className="input-group">
                  <input type="number" placeholder="Enter amount" id="customAmount" />
                  <select id="customType">
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                  </select>
                  <button className="btn btn-primary">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="content-section">
          <div className="section-header">
            <h2>Transaction History</h2>
          </div>
          <div className="section-content">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{new Date().toLocaleDateString()}</td>
                  <td><span className="badge badge-success">Deposit</span></td>
                  <td>+ $500</td>
                  <td>Manual deposit by admin</td>
                  <td><span className="status-completed">Completed</span></td>
                </tr>
                <tr>
                  <td>{new Date(Date.now() - 86400000).toLocaleDateString()}</td>
                  <td><span className="badge badge-danger">Withdrawal</span></td>
                  <td>- $250</td>
                  <td>User withdrawal</td>
                  <td><span className="status-completed">Completed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
