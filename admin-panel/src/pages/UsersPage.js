import React, { useState, useEffect } from 'react';
import adminApi from '../services/api';
import UserWalletModal from '../components/UserWalletModal';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    console.log('UsersPage: Component mounted, loading users...');
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('UsersPage: Loading users from API...');
      const response = await adminApi.getAllUsers();
      
      console.log('UsersPage: API response received:', response);
      
      let usersData = [];
      
      // Handle different response formats
      if (Array.isArray(response)) {
        // Direct array response (what our fixed backend returns)
        usersData = response;
        console.log('UsersPage: Got direct array with', usersData.length, 'users');
      } else if (response && response.users && Array.isArray(response.users)) {
        // Nested response format
        usersData = response.users;
        console.log('UsersPage: Got nested users array with', usersData.length, 'users');
      } else if (response && response.data && Array.isArray(response.data)) {
        // Another possible nested format
        usersData = response.data;
        console.log('UsersPage: Got data array with', usersData.length, 'users');
      } else {
        console.log('UsersPage: Unexpected response format:', response);
      }
      
      // Log first few users for debugging
      if (usersData.length > 0) {
        console.log('UsersPage: First user sample:', usersData[0]);
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('UsersPage: Error loading users:', error);
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      // Search filter
      const userSearchable = [
        user.name || '',
        user.email || '',
        user.id ? user.id.toString() : '',
        user.userName || ''
      ].join(' ').toLowerCase();
      
      const searchMatch = 
        !searchTerm ||
        userSearchable.includes(searchTerm.toLowerCase());
      
      // Status filter - handle different field names
      const userStatus = user.accountStatus || user.status || 'inactive';
      const statusMatch = 
        filterStatus === 'all' ||
        (filterStatus === 'active' && userStatus === 'active') ||
        (filterStatus === 'inactive' && userStatus === 'inactive');
      
      return searchMatch && statusMatch;
    });
  };

  const getStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => 
      (u.accountStatus || u.status) === 'active'
    ).length;
    const usersWithPlan = users.filter(u => u.currentPlan).length;
    
    const totalBalance = users.reduce((sum, user) => 
      sum + (user.realBalance || 0) + (user.paperBalance || 0), 0
    );
    
    const totalPaperBalance = users.reduce((sum, user) => sum + (user.paperBalance || 0), 0);
    const totalRealBalance = users.reduce((sum, user) => sum + (user.realBalance || 0), 0);
    
    return {
      totalUsers,
      activeUsers,
      usersWithPlan,
      totalBalance,
      totalPaperBalance,
      totalRealBalance
    };
  };

  const stats = getStats();
  const filteredUsers = getFilteredUsers();

  const updateUserStatus = async (userId, newStatus) => {
    try {
      // In a real app, you would call an API endpoint to update user status
      // For now, update locally
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, accountStatus: newStatus } : user
      );
      setUsers(updatedUsers);
      
      alert(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  // Helper function to safely get user ID string
  const getUserIdString = (userId) => {
    if (!userId) return 'N/A';
    if (typeof userId === 'string') {
      return userId.length > 8 ? `#${userId.substring(0, 8)}...` : `#${userId}`;
    }
    return `#${userId}`;
  };

  if (loading) {
    return (
      <div className="users-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
          <button className="btn btn-primary mt-2" onClick={loadUsers}>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>User Management</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={loadUsers}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-detail">
            {stats.activeUsers} active
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Users with Plan</div>
          <div className="stat-value">{stats.usersWithPlan}</div>
          <div className="stat-detail">
            {stats.totalUsers > 0 ? `${Math.round((stats.usersWithPlan / stats.totalUsers) * 100)}% of total` : '0%'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Paper Balance</div>
          <div className="stat-value">₹{(stats.totalPaperBalance || 0).toLocaleString()}</div>
          <div className="stat-detail">
            Trading balance
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Real Balance</div>
          <div className="stat-value">₹{(stats.totalRealBalance || 0).toLocaleString()}</div>
          <div className="stat-detail">
            Withdrawable balance
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="content-section">
        <div className="section-content">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Paper Balance</th>
                <th>Real Balance</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => {
                  // Debug log for each user
                  console.log('Rendering user:', user);
                  
                  return (
                    <tr key={user.id || user._id}>
                      <td>{getUserIdString(user.id)}</td>
                      <td>
                        <div className="user-info">
                          <div className="user-name">{user.name || user.userName || 'N/A'}</div>
                        </div>
                      </td>
                      <td>{user.email || 'No email'}</td>
                      <td>
                        <span className={`plan-badge ${user.currentPlan ? 'plan-active' : 'plan-none'}`}>
                          {user.currentPlan || 'No Plan'}
                        </span>
                      </td>
                      <td>₹{(user.paperBalance || 0).toLocaleString()}</td>
                      <td>₹{(user.realBalance || 0).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge status-${user.accountStatus || user.status || 'inactive'}`}>
                          {user.accountStatus || user.status || 'inactive'}
                        </span>
                      </td>
                      <td>
                        {user.createdAt || user.joinDate
                          ? new Date(user.createdAt || user.joinDate).toLocaleDateString()
                          : 'N/A'
                        }
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view"
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="action-btn edit"
                            title="Edit User"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-btn wallet"
                            title="Manage Wallet"
                            onClick={() => {
                              console.log('Selected user for wallet:', user);
                              setSelectedUser(user);
                              setShowWalletModal(true);
                            }}
                          >
                            <i className="fas fa-wallet"></i>
                          </button>
                          <button 
                            className="action-btn quick-add"
                            title="Quick Add Funds"
                            onClick={() => {
                              console.log('Selected user for quick add:', user);
                              setSelectedUser(user);
                              setShowWalletModal(true);
                            }}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                          {(user.accountStatus || user.status) === 'active' ? (
                            <button 
                              className="action-btn deactivate"
                              title="Deactivate User"
                              onClick={() => updateUserStatus(user.id, 'inactive')}
                            >
                              <i className="fas fa-user-slash"></i>
                            </button>
                          ) : (
                            <button 
                              className="action-btn activate"
                              title="Activate User"
                              onClick={() => updateUserStatus(user.id, 'active')}
                            >
                              <i className="fas fa-user-check"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    <i className="fas fa-users"></i>
                    <p>No users found {users.length > 0 ? '(filtered out)' : ''}</p>
                    {users.length === 0 && (
                      <button className="btn btn-primary mt-2" onClick={loadUsers}>
                        Try Loading Again
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wallet Management Modal */}
      {showWalletModal && selectedUser && (
        <UserWalletModal
          user={selectedUser}
          onClose={() => {
            setShowWalletModal(false);
            setSelectedUser(null);
          }}
          onUpdate={loadUsers}
        />
      )}
    </div>
  );
};

export default UsersPage;