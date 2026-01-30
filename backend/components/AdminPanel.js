// components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboardStats, setDashboardStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [plans, setPlans] = useState([]);
    const [tradingStats, setTradingStats] = useState(null);
    const [systemHealth, setSystemHealth] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showAddFundsModal, setShowAddFundsModal] = useState(false);
    const [showDeductFundsModal, setShowDeductFundsModal] = useState(false);
    const [addFundsData, setAddFundsData] = useState({ amount: '', description: '' });
    const [deductFundsData, setDeductFundsData] = useState({ amount: '', reason: '' });
    const [transactionFilters, setTransactionFilters] = useState({ type: '', status: '' });

    const API_BASE = 'http://localhost:3001/api';
    const token = localStorage.getItem('token');

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/admin/dashboard/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setDashboardStats(data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
        setLoading(false);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/admin/users?limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
        setLoading(false);
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            let url = `${API_BASE}/admin/transactions?limit=50`;
            if (transactionFilters.type) url += `&type=${transactionFilters.type}`;
            if (transactionFilters.status) url += `&status=${transactionFilters.status}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setTransactions(data.transactions);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
        setLoading(false);
    };

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/admin/plans`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setPlans(data.plans);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
        setLoading(false);
    };

    const fetchTradingStats = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/admin/trading-stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setTradingStats(data);
            }
        } catch (error) {
            console.error('Error fetching trading stats:', error);
        }
        setLoading(false);
    };

    const fetchSystemHealth = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/admin/system-health`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSystemHealth(data.health);
            }
        } catch (error) {
            console.error('Error fetching system health:', error);
        }
        setLoading(false);
    };

    const fetchUserDetails = async (userId) => {
        try {
            const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSelectedUser(data);
                setShowUserModal(true);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const updateUserStatus = async (userId, status) => {
        const reason = prompt(`Enter reason for ${status === 'suspended' ? 'suspending' : 'activating'} account:`);
        if (reason === null) return;

        try {
            const response = await fetch(`${API_BASE}/admin/users/${userId}/update-status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, reason })
            });
            const data = await response.json();
            if (data.success) {
                alert('User status updated successfully');
                fetchUsers();
                if (selectedUser) {
                    fetchUserDetails(userId);
                }
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            alert('Error updating user status');
        }
    };

    const handleAddFunds = async () => {
        if (!addFundsData.amount || parseFloat(addFundsData.amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/admin/users/${selectedUser.user._id}/add-funds`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(addFundsData)
            });
            const data = await response.json();
            if (data.success) {
                alert('Funds added successfully');
                setShowAddFundsModal(false);
                setAddFundsData({ amount: '', description: '' });
                fetchUserDetails(selectedUser.user._id);
                fetchUsers();
            }
        } catch (error) {
            console.error('Error adding funds:', error);
            alert('Error adding funds');
        }
    };

    const handleDeductFunds = async () => {
        if (!deductFundsData.amount || parseFloat(deductFundsData.amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/admin/users/${selectedUser.user._id}/deduct-funds`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deductFundsData)
            });
            const data = await response.json();
            if (data.success) {
                alert('Funds deducted successfully');
                setShowDeductFundsModal(false);
                setDeductFundsData({ amount: '', reason: '' });
                fetchUserDetails(selectedUser.user._id);
                fetchUsers();
            }
        } catch (error) {
            console.error('Error deducting funds:', error);
            alert('Error deducting funds');
        }
    };

    const handleApproveTransaction = async (transactionId) => {
        const notes = prompt('Enter approval notes (optional):');
        if (notes === null) return;

        try {
            const response = await fetch(`${API_BASE}/admin/transactions/${transactionId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ notes })
            });
            const data = await response.json();
            if (data.success) {
                alert('Transaction approved successfully');
                fetchTransactions();
                if (dashboardStats) {
                    fetchDashboardStats();
                }
            }
        } catch (error) {
            console.error('Error approving transaction:', error);
            alert('Error approving transaction');
        }
    };

    const handleRejectTransaction = async (transactionId) => {
        const reason = prompt('Enter rejection reason:');
        if (reason === null) return;

        try {
            const response = await fetch(`${API_BASE}/admin/transactions/${transactionId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });
            const data = await response.json();
            if (data.success) {
                alert('Transaction rejected successfully');
                fetchTransactions();
            }
        } catch (error) {
            console.error('Error rejecting transaction:', error);
            alert('Error rejecting transaction');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    useEffect(() => {
        switch (activeTab) {
            case 'dashboard':
                fetchDashboardStats();
                break;
            case 'users':
                fetchUsers();
                break;
            case 'transactions':
                fetchTransactions();
                break;
            case 'plans':
                fetchPlans();
                break;
            case 'trading':
                fetchTradingStats();
                break;
            case 'system':
                fetchSystemHealth();
                break;
        }
    }, [activeTab, transactionFilters]);

    if (loading && !dashboardStats && activeTab === 'dashboard') {
        return <div className="admin-loading">Loading Admin Panel...</div>;
    }

    return (
        <div className="admin-panel">
            {/* Sidebar */}
            <div className="admin-sidebar">
                <h2 className="admin-logo">👑 Admin Panel</h2>
                <div className="admin-nav">
                    <button 
                        className={`admin-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        📊 Dashboard
                    </button>
                    <button 
                        className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 Users
                    </button>
                    <button 
                        className={`admin-nav-btn ${activeTab === 'transactions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('transactions')}
                    >
                        💰 Transactions
                    </button>
                    <button 
                        className={`admin-nav-btn ${activeTab === 'plans' ? 'active' : ''}`}
                        onClick={() => setActiveTab('plans')}
                    >
                        📋 Plans
                    </button>
                    <button 
                        className={`admin-nav-btn ${activeTab === 'trading' ? 'active' : ''}`}
                        onClick={() => setActiveTab('trading')}
                    >
                        📈 Trading Stats
                    </button>
                    <button 
                        className={`admin-nav-btn ${activeTab === 'system' ? 'active' : ''}`}
                        onClick={() => setActiveTab('system')}
                    >
                               ⚙️ System Health
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="admin-content">
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && dashboardStats && (
                    <div className="dashboard-content">
                        <div className="dashboard-header">
                            <h1>Admin Dashboard</h1>
                            <button className="refresh-btn" onClick={fetchDashboardStats}>
                                🔄 Refresh
                            </button>
                        </div>

                        {/* Stats Grid */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <div className="stat-info">
                                    <h3>Total Users</h3>
                                    <div className="stat-value">{dashboardStats.stats.totalUsers}</div>
                                    <div className="stat-detail">
                                        <span className="positive">Active: {dashboardStats.stats.activeUsers}</span>
                                        <span className="negative">Suspended: {dashboardStats.stats.suspendedUsers}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <h3>Total Deposits</h3>
                                    <div className="stat-value">
                                        {formatCurrency(dashboardStats.stats.totalDeposits)}
                                    </div>
                                    <div className="stat-detail">
                                        Pending: {dashboardStats.stats.pendingDeposits}
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">💸</div>
                                <div className="stat-info">
                                    <h3>Total Withdrawals</h3>
                                    <div className="stat-value">
                                        {formatCurrency(dashboardStats.stats.totalWithdrawals)}
                                    </div>
                                    <div className="stat-detail">
                                        Pending: {dashboardStats.stats.pendingWithdrawals}
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">📈</div>
                                <div className="stat-info">
                                    <h3>Plan Revenue</h3>
                                    <div className="stat-value">
                                        {formatCurrency(dashboardStats.stats.totalPlanPurchases)}
                                    </div>
                                    <div className="stat-detail">
                                        Today's Users: {dashboardStats.stats.newUsersToday}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="recent-transactions">
                            <h2>Recent Transactions</h2>
                            <div className="transactions-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>User</th>
                                            <th>Type</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardStats.recentTransactions.map(tx => (
                                            <tr key={tx._id}>
                                                <td>{tx._id.slice(-6)}</td>
                                                <td>{tx.userId?.name || 'N/A'}</td>
                                                <td>
                                                    <span className={`tx-type ${tx.type}`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td>{formatCurrency(tx.amount)}</td>
                                                <td>
                                                    <span className={`status-badge status-${tx.status}`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td>{formatDate(tx.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="users-content">
                        <div className="content-header">
                            <h1>Manage Users</h1>
                            <div className="header-actions">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                <button className="refresh-btn" onClick={fetchUsers}>
                                    🔄 Refresh
                                </button>
                            </div>
                        </div>

                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Real Balance</th>
                                        <th>Paper Balance</th>
                                        <th>Plan</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users
                                        .filter(user => 
                                            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            user.email.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map(user => (
                                            <tr key={user._id}>
                                                <td>{user._id.slice(-6)}</td>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>{formatCurrency(user.realBalance)}</td>
                                                <td>{formatCurrency(user.paperBalance)}</td>
                                                <td>
                                                    {user.currentPlan ? (
                                                        <span className="plan-badge">
                                                            {user.currentPlan.name}
                                                        </span>
                                                    ) : (
                                                        <span className="no-plan">No Plan</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${user.accountStatus}`}>
                                                        {user.accountStatus}
                                                    </span>
                                                </td>
                                                <td>{formatDate(user.createdAt)}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="view-btn"
                                                            onClick={() => fetchUserDetails(user._id)}
                                                        >
                                                            👁️ View
                                                        </button>
                                                        {user.accountStatus === 'active' ? (
                                                            <button 
                                                                className="suspend-btn"
                                                                onClick={() => updateUserStatus(user._id, 'suspended')}
                                                            >
                                                                ⏸️ Suspend
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                className="activate-btn"
                                                                onClick={() => updateUserStatus(user._id, 'active')}
                                                            >
                                                                ▶️ Activate
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div className="transactions-content">
                        <div className="content-header">
                            <h1>Manage Transactions</h1>
                            <div className="header-actions">
                                <select 
                                    value={transactionFilters.type}
                                    onChange={(e) => setTransactionFilters(prev => ({...prev, type: e.target.value}))}
                                    className="filter-select"
                                >
                                    <option value="">All Types</option>
                                    <option value="deposit">Deposit</option>
                                    <option value="withdrawal">Withdrawal</option>
                                    <option value="plan_purchase">Plan Purchase</option>
                                </select>
                                <select 
                                    value={transactionFilters.status}
                                    onChange={(e) => setTransactionFilters(prev => ({...prev, status: e.target.value}))}
                                    className="filter-select"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <button className="refresh-btn" onClick={fetchTransactions}>
                                    🔄 Refresh
                                </button>
                            </div>
                        </div>

                        <div className="transactions-table-container">
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>User</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(tx => (
                                        <tr key={tx._id}>
                                            <td>{tx._id.slice(-6)}</td>
                                            <td>{tx.userId?.name || 'N/A'}</td>
                                            <td>
                                                <span className={`tx-type ${tx.type}`}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td>{formatCurrency(tx.amount)}</td>
                                            <td>
                                                <span className={`status-badge status-${tx.status}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td>{formatDate(tx.createdAt)}</td>
                                            <td className="tx-description">{tx.description || '-'}</td>
                                            <td>
                                                {tx.status === 'pending' && (
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="approve-btn"
                                                            onClick={() => handleApproveTransaction(tx._id)}
                                                        >
                                                            ✅ Approve
                                                        </button>
                                                        <button 
                                                            className="reject-btn"
                                                            onClick={() => handleRejectTransaction(tx._id)}
                                                        >
                                                            ❌ Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {tx.status !== 'pending' && (
                                                    <span className="no-action">Completed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Plans Tab */}
                {activeTab === 'plans' && (
                    <div className="plans-content">
                        <div className="content-header">
                            <h1>Manage Plans</h1>
                            <button className="add-plan-btn" onClick={() => {/* Add plan functionality */}}>
                                ➕ Add New Plan
                            </button>
                        </div>

                        <div className="plans-grid">
                            {plans.map(plan => (
                                <div key={plan._id} className="plan-card">
                                    <div className="plan-header">
                                        <h3>{plan.name}</h3>
                                        <span className="plan-price">{formatCurrency(plan.price)}</span>
                                    </div>
                                    <div className="plan-details">
                                        <div className="plan-detail">
                                            <span>Paper Money:</span>
                                            <span>{formatCurrency(plan.paperMoney)}</span>
                                        </div>
                                        <div className="plan-detail">
                                            <span>Daily Loss Limit:</span>
                                            <span>{plan.dailyLossLimit}%</span>
                                        </div>
                                        <div className="plan-detail">
                                            <span>Max Loss Limit:</span>
                                            <span>{plan.maxLossLimit}%</span>
                                        </div>
                                        <div className="plan-detail">
                                            <span>Max Withdrawal:</span>
                                            <span>{formatCurrency(plan.maxWithdrawal)}</span>
                                        </div>
                                        <div className="plan-detail">
                                            <span>Status:</span>
                                            <span className={`status-badge ${plan.isActive ? 'status-active' : 'status-inactive'}`}>
                                                {plan.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="plan-actions">
                                        <button className="edit-btn">✏️ Edit</button>
                                        <button className="delete-btn">🗑️ Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trading Stats Tab */}
                {activeTab === 'trading' && tradingStats && (
                    <div className="trading-content">
                        <div className="content-header">
                            <h1>Trading Statistics</h1>
                            <div className="date-filters">
                                <input type="date" className="date-input" />
                                <span>to</span>
                                <input type="date" className="date-input" />
                                <button className="apply-btn">Apply</button>
                            </div>
                        </div>

                        <div className="trading-stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">📊</div>
                                <div className="stat-info">
                                    <h3>Total Trades</h3>
                                    <div className="stat-value">{tradingStats.stats.totalTrades}</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">📈</div>
                                <div className="stat-info">
                                    <h3>Win Rate</h3>
                                    <div className="stat-value">{tradingStats.stats.winRate.toFixed(2)}%</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <h3>Total P&L</h3>
                                    <div className={`stat-value ${tradingStats.stats.totalPnL >= 0 ? 'positive' : 'negative'}`}>
                                        {formatCurrency(tradingStats.stats.totalPnL)}
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">⚖️</div>
                                <div className="stat-info">
                                    <h3>Win/Loss Ratio</h3>
                                    <div className="stat-value">
                                        {tradingStats.stats.winningTrades}:{tradingStats.stats.losingTrades}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Symbols */}
                        <div className="top-symbols">
                            <h3>Most Traded Symbols</h3>
                            <div className="symbols-list">
                                {tradingStats.topSymbols.map(symbol => (
                                    <div key={symbol._id} className="symbol-item">
                                        <span className="symbol-name">{symbol._id}</span>
                                        <span className="symbol-count">{symbol.count} trades</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* System Health Tab */}
                {activeTab === 'system' && systemHealth && (
                    <div className="system-content">
                        <div className="content-header">
                            <h1>System Health</h1>
                            <button className="refresh-btn" onClick={fetchSystemHealth}>
                                🔄 Refresh
                            </button>
                        </div>

                        <div className="system-stats">
                            <div className="system-stat">
                                <div className="system-icon">🗄️</div>
                                <div className="system-info">
                                    <h3>Database</h3>
                                    <div className={`system-value ${systemHealth.database === 'connected' ? 'positive' : 'negative'}`}>
                                        {systemHealth.database}
                                    </div>
                                </div>
                            </div>

                            <div className="system-stat">
                                <div className="system-icon">⏱️</div>
                                <div className="system-info">
                                    <h3>Uptime</h3>
                                    <div className="system-value">{systemHealth.uptime}</div>
                                </div>
                            </div>

                            <div className="system-stat">
                                <div className="system-icon">💾</div>
                                <div className="system-info">
                                    <h3>Memory Usage</h3>
                                    <div className="system-value">{systemHealth.memory.used}</div>
                                </div>
                            </div>

                            <div className="system-stat">
                                <div className="system-icon">📁</div>
                                <div className="system-info">
                                    <h3>Collections</h3>
                                    <div className="system-value">{systemHealth.collections}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Loading...</p>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content user-modal">
                        <div className="modal-header">
                            <h2>User Details</h2>
                            <button className="close-modal" onClick={() => setShowUserModal(false)}>
                                ×
                            </button>
                        </div>
                        
                        <div className="user-details">
                            <div className="user-info-section">
                                <h3>Basic Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Name:</span>
                                        <span className="info-value">{selectedUser.user.name}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Email:</span>
                                        <span className="info-value">{selectedUser.user.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Joined:</span>
                                        <span className="info-value">{formatDate(selectedUser.user.createdAt)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Account Status:</span>
                                        <span className={`status-badge status-${selectedUser.user.accountStatus}`}>
                                            {selectedUser.user.accountStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="user-info-section">
                                <h3>Balance Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Real Balance:</span>
                                        <span className="info-value">{formatCurrency(selectedUser.user.realBalance)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Paper Balance:</span>
                                        <span className="info-value">{formatCurrency(selectedUser.user.paperBalance)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Total Deposits:</span>
                                        <span className="info-value">{formatCurrency(selectedUser.user.totalDeposits)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Total Withdrawals:</span>
                                        <span className="info-value">{formatCurrency(selectedUser.user.totalWithdrawals)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="user-info-section">
                                <h3>Trading Statistics</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Total Trades:</span>
                                        <span className="info-value">{selectedUser.stats.totalTrades}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Winning Trades:</span>
                                        <span className="info-value positive">{selectedUser.stats.winningTrades}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Losing Trades:</span>
                                        <span className="info-value negative">{selectedUser.stats.losingTrades}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedUser.user.currentPlan && (
                                <div className="user-info-section">
                                    <h3>Current Plan</h3>
                                    <div className="plan-info">
                                        <div className="plan-name">{selectedUser.user.currentPlan.name}</div>
                                        <div className="plan-details">
                                            <span>Paper Money: {formatCurrency(selectedUser.user.currentPlan.paperMoney)}</span>
                                            <span>Loss Limits: {selectedUser.user.dailyLossLimit}% daily, {selectedUser.user.maxLossLimit}% max</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button 
                                    className="add-funds-btn"
                                    onClick={() => setShowAddFundsModal(true)}
                                >
                                    💰 Add Funds
                                </button>
                                <button 
                                    className="deduct-funds-btn"
                                    onClick={() => setShowDeductFundsModal(true)}
                                >
                                    💸 Deduct Funds
                                </button>
                                {selectedUser.user.accountStatus === 'active' ? (
                                    <button 
                                        className="suspend-btn"
                                        onClick={() => updateUserStatus(selectedUser.user._id, 'suspended')}
                                    >
                                        ⏸️ Suspend Account
                                    </button>
                                ) : (
                                    <button 
                                        className="activate-btn"
                                        onClick={() => updateUserStatus(selectedUser.user._id, 'active')}
                                    >
                                        ▶️ Activate Account
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Funds Modal */}
            {showAddFundsModal && (
                <div className="modal-overlay">
                    <div className="modal-content small-modal">
                        <div className="modal-header">
                            <h2>Add Funds</h2>
                            <button className="close-modal" onClick={() => setShowAddFundsModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input 
                                    type="number"
                                    value={addFundsData.amount}
                                    onChange={(e) => setAddFundsData({...addFundsData, amount: e.target.value})}
                                    placeholder="Enter amount"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <input 
                                    type="text"
                                    value={addFundsData.description}
                                    onChange={(e) => setAddFundsData({...addFundsData, description: e.target.value})}
                                    placeholder="Enter description"
                                    className="form-input"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowAddFundsModal(false)}>
                                Cancel
                            </button>
                            <button className="confirm-btn" onClick={handleAddFunds}>
                                Add Funds
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deduct Funds Modal */}
            {showDeductFundsModal && (
                <div className="modal-overlay">
                    <div className="modal-content small-modal">
                        <div className="modal-header">
                            <h2>Deduct Funds</h2>
                            <button className="close-modal" onClick={() => setShowDeductFundsModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input 
                                    type="number"
                                    value={deductFundsData.amount}
                                    onChange={(e) => setDeductFundsData({...deductFundsData, amount: e.target.value})}
                                    placeholder="Enter amount"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Reason</label>
                                <input 
                                    type="text"
                                    value={deductFundsData.reason}
                                    onChange={(e) => setDeductFundsData({...deductFundsData, reason: e.target.value})}
                                    placeholder="Enter reason"
                                    className="form-input"
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowDeductFundsModal(false)}>
                                Cancel
                            </button>
                            <button className="confirm-btn" onClick={handleDeductFunds}>
                                Deduct Funds
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;