import React, { useState } from 'react';

const AdminPanel = ({ users = [], onUpdateUser, onProcessWithdrawal }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Mock users data (replace with actual API)
  const mockUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      realBalance: 5000,
      paperBalance: 100000,
      plan: "Plan A",
      accountStatus: "active",
      totalPnL: 2500,
      totalTrades: 45,
      joinDate: "2024-01-01",
      lastLogin: "2024-01-10"
    },
    // Add more users...
  ];
  
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(u => u.accountStatus === "active").length;
  const breachedUsers = mockUsers.filter(u => u.accountStatus === "breached").length;
  const totalRevenue = mockUsers.reduce((sum, user) => sum + (user.plan ? 1000 : 0), 0);
  
  return (
    <div className="admin-panel">
      {/* Admin Header */}
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-value">{totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{activeUsers}</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{breachedUsers}</div>
            <div className="stat-label">Breached</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">₹{totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>
      
      {/* Admin Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'withdrawals' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdrawals')}
        >
          💰 Withdrawals
        </button>
        <button 
          className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          📋 Plans
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          💳 Transactions
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            {/* Dashboard charts and metrics */}
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Recent Breaches</h3>
                <div className="breaches-list">
                  {mockUsers.filter(u => u.accountStatus === "breached").map(user => (
                    <div key={user.id} className="breach-item">
                      <div className="breach-user">{user.name}</div>
                      <div className="breach-plan">{user.plan}</div>
                      <button className="action-btn">View Details</button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="dashboard-card">
                <h3>Pending Withdrawals</h3>
                <div className="withdrawals-list">
                  {/* Withdrawal requests */}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="users-content">
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>P&L</th>
                    <th>Balance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.plan || '-'}</td>
                      <td>
                        <span className={`status-badge ${user.accountStatus}`}>
                          {user.accountStatus}
                        </span>
                      </td>
                      <td className={user.totalPnL >= 0 ? 'positive' : 'negative'}>
                        ${user.totalPnL.toLocaleString()}
                      </td>
                      <td>₹{user.realBalance.toLocaleString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn small">Edit</button>
                          <button className="action-btn small">Suspend</button>
                          <button className="action-btn small">Reset</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'withdrawals' && (
          <div className="withdrawals-content">
            <h3>Withdrawal Requests</h3>
            {/* Withdrawal approval interface */}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;