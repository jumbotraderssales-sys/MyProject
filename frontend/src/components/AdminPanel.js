// components/AdminPanel.js
import React, { useState } from 'react';
import './AdminPanel.css';

function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('databoard');
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Laltu Mandal',
      email: 'slattu@gmail.com',
      mobile: '+91 41414141',
      verified: true,
      kyc: 'Verified',
      totalOrders: 16,
      totalDeposit: '₹5,000',
      balance: '₹10,240',
      status: 'Active'
    },
    // Add more users as needed
  ]);

  const [currentUser, setCurrentUser] = useState(users[0]);

  const databoardItems = [
    'Manage Order',
    'Manage P2P',
    'Manage Currency',
    'Manage Market',
    'Manage Coh Pair',
    'Manage Users',
    'Active Users',
    'Banned Users',
    'Email Unverified',
    'Mobile Unverified',
    'KYC Unverified',
    'KYC Pending',
    'All Users',
    'Send Notification',
    'Manage Referral',
    'Deposits',
    'Withdrawals'
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUserAction = (action, userId) => {
    switch(action) {
      case 'ban':
        // Handle ban user
        alert(`Ban user ${userId}`);
        break;
      case 'notification':
        // Send notification
        alert(`Send notification to user ${userId}`);
        break;
      case 'lights':
        // Toggle lights
        alert(`Toggle lights for user ${userId}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <h2>👑 Admin Dashboard</h2>
        <div className="admin-search">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            className="admin-search-input"
          />
          <button className="admin-search-btn">🔍</button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-sidebar">
          <h3>Databoard</h3>
          <ul className="databoard-list">
            {databoardItems.map((item, index) => (
              <li 
                key={index}
                className={activeTab === item.toLowerCase().replace(/\s+/g, '-') ? 'active' : ''}
                onClick={() => setActiveTab(item.toLowerCase().replace(/\s+/g, '-'))}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-main">
          <div className="user-detail-section">
            <div className="user-detail-header">
              <h3>User Detail - {currentUser.name}</h3>
              <div className="user-actions">
                <button 
                  className="user-action-btn lights-btn"
                  onClick={() => handleUserAction('lights', currentUser.id)}
                >
                  Lights
                </button>
                <button 
                  className="user-action-btn notification-btn"
                  onClick={() => handleUserAction('notification', currentUser.id)}
                >
                  Notifications
                </button>
                <button 
                  className="user-action-btn ban-btn"
                  onClick={() => handleUserAction('ban', currentUser.id)}
                >
                  Ban User
                </button>
              </div>
            </div>

            <div className="user-stats-cards">
              <div className="stat-card">
                <h4>Total Order</h4>
                <div className="stat-value">{currentUser.totalOrders}</div>
              </div>
              <div className="stat-card">
                <h4>Total Trade</h4>
                <div className="stat-value">{currentUser.totalOrders}</div>
              </div>
              <div className="stat-card">
                <h4>Total Deposit</h4>
                <div className="stat-value">{currentUser.totalDeposit}</div>
              </div>
              <div className="stat-card">
                <h4>Transactions</h4>
                <div className="stat-value">{currentUser.totalOrders}</div>
              </div>
            </div>

            <div className="balance-section">
              <h4>Balance</h4>
              <div className="balance-amount">{currentUser.balance}</div>
            </div>

            <div className="user-info-section">
              <h4>Information of {currentUser.name}</h4>
              
              <div className="name-section">
                <div className="form-group">
                  <label>First Name*</label>
                  <input type="text" value={currentUser.name.split(' ')[0]} readOnly className="form-input" />
                </div>
                <div className="form-group">
                  <label>Last Name*</label>
                  <input type="text" value={currentUser.name.split(' ')[1] || ''} readOnly className="form-input" />
                </div>
              </div>

              <div className="contact-section">
                <div className="form-group">
                  <label>Email*</label>
                  <input type="email" value={currentUser.email} readOnly className="form-input" />
                </div>
                <div className="form-group">
                  <label>Mobile Number*</label>
                  <input type="tel" value={currentUser.mobile} readOnly className="form-input" />
                </div>
              </div>

              <div className="address-section">
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" placeholder="Rf" className="form-input" />
                </div>
                
                <div className="address-details">
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" placeholder="City" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input type="text" placeholder="Ff" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Zip/Postal</label>
                    <input type="text" placeholder="444566" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Country*</label>
                    <input type="text" value="India" readOnly className="form-input" />
                  </div>
                </div>
              </div>

              <div className="verification-section">
                <div className="verification-item">
                  <span>Email Verification</span>
                  <span className="verification-status verified">Verified</span>
                </div>
                <div className="verification-item">
                  <span>Mobile Verification</span>
                  <span className="verification-status verified">Verified</span>
                </div>
                <div className="verification-item">
                  <span>2FA Verification</span>
                  <span className="verification-status enabled">Enable</span>
                </div>
                <div className="verification-item">
                  <span>KYC</span>
                  <span className="verification-status verified">Verified</span>
                </div>
              </div>
            </div>
          </div>

          <div className="users-list-section">
            <h3>Recent Users</h3>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>KYC</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="user-row">
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.mobile}</td>
                      <td>
                        <span className={`kyc-badge ${user.kyc.toLowerCase()}`}>
                          {user.kyc}
                        </span>
                      </td>
                      <td>{user.balance}</td>
                      <td>
                        <span className={`status-badge ${user.status.toLowerCase()}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="row-action-btn view-btn">👁️</button>
                          <button className="row-action-btn edit-btn">✏️</button>
                          <button className="row-action-btn ban-btn">🚫</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;