import React, { useState, useEffect } from 'react';
import adminApi from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBalance: 0,
    activeTrades: 0,
    openPositions: 0,
    dailyVolume: 0,
    totalPnl: 0,
    totalTrades: 0,
    winningTrades: 0
  });
  const [recentTrades, setRecentTrades] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    pendingPayments: 0,
    totalRevenue: 0,
    approvedPayments: 0,
    rejectedPayments: 0,
    totalPayments: 0
  });
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const testConnection = async () => {
    try {
      await adminApi.testConnection();
      setConnectionStatus({
        connected: true,
        lastUpdated: new Date()
      });
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus({
        connected: false,
        lastUpdated: new Date()
      });
      return false;
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading dashboard data...');
      
      // Test connection first
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Backend server is not responding. Please check if the server is running on port 3001.');
      }

      // Load all data in parallel
      const [dashboardStats, tradesData, usersData, paymentStatsData] = await Promise.all([
        adminApi.getPlatformStats().catch(err => {
          console.error('Error loading platform stats:', err);
          // Return empty stats object to prevent app crash
          return {
            totalUsers: 0,
            activeUsers: 0,
            totalBalance: 0,
            activeTrades: 0,
            openPositions: 0,
            dailyVolume: 0,
            totalPnl: 0,
            totalTrades: 0,
            winningTrades: 0
          };
        }),
        adminApi.getAllTrades().catch(err => {
          console.error('Error loading trades:', err);
          return [];
        }),
        adminApi.getAllUsers().catch(err => {
          console.error('Error loading users:', err);
          return [];
        }),
        // Use getPlatformStats as fallback if getPaymentStats doesn't exist
        adminApi.getPaymentStats ? adminApi.getPaymentStats().catch(err => {
          console.warn('Payment stats endpoint not available:', err);
          return { 
            pendingPayments: 0, 
            totalRevenue: 0,
            approvedPayments: 0,
            rejectedPayments: 0,
            totalPayments: 0
          };
        }) : Promise.resolve({ 
          pendingPayments: 0, 
          totalRevenue: 0,
          approvedPayments: 0,
          rejectedPayments: 0,
          totalPayments: 0
        })
      ]);

      console.log('Dashboard data loaded successfully:', {
        stats: dashboardStats,
        tradesCount: tradesData?.length || 0,
        usersCount: usersData?.length || 0,
        paymentStats: paymentStatsData
      });

      // Set trading statistics - with fallback values
      setStats({
        totalUsers: dashboardStats?.totalUsers || usersData?.length || 0,
        activeUsers: dashboardStats?.activeUsers || usersData?.filter(u => u.accountStatus === 'active')?.length || 0,
        totalBalance: dashboardStats?.totalBalance || 0,
        activeTrades: dashboardStats?.activeTrades || dashboardStats?.openPositions || 0,
        openPositions: dashboardStats?.openPositions || dashboardStats?.activeTrades || 0,
        dailyVolume: dashboardStats?.dailyVolume || 0,
        totalPnl: dashboardStats?.totalPnl || 0,
        totalTrades: dashboardStats?.totalTrades || tradesData?.length || 0,
        winningTrades: dashboardStats?.winningTrades || 0
      });

      // Handle recent trades - with data validation
      if (tradesData && Array.isArray(tradesData)) {
        const sortedTrades = [...tradesData]
          .filter(trade => trade && typeof trade === 'object')
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || a.openedAt || a.timestamp || 0);
            const dateB = new Date(b.createdAt || b.openedAt || b.timestamp || 0);
            return dateB - dateA;
          })
          .slice(0, 5)
          .map(trade => ({
            id: trade.id || trade._id || `trade_${Date.now()}_${Math.random()}`,
            userId: trade.userId || 'N/A',
            symbol: trade.symbol || 'N/A',
            side: (trade.side || 'N/A').toLowerCase(),
            quantity: trade.quantity || trade.size || 0,
            price: trade.price || trade.entryPrice || 0,
            pnl: trade.pnl || 0,
            createdAt: trade.createdAt || trade.openedAt || trade.timestamp || new Date().toISOString()
          }));
        setRecentTrades(sortedTrades);
      } else {
        setRecentTrades([]);
      }

      // Handle recent users - with data validation
      if (usersData && Array.isArray(usersData)) {
        const sortedUsers = [...usersData]
          .filter(user => user && typeof user === 'object')
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || a.registrationDate || 0);
            const dateB = new Date(b.createdAt || b.registrationDate || 0);
            return dateB - dateA;
          })
          .slice(0, 5)
          .map(user => ({
            id: user.id || user._id || `user_${Date.now()}_${Math.random()}`,
            name: user.name || user.username || `User #${user.id}`,
            email: user.email || 'No email',
            realBalance: user.realBalance || 0,
            paperBalance: user.paperBalance || 0,
            accountStatus: user.accountStatus || 'active',
            createdAt: user.createdAt || new Date().toISOString()
          }));
        setRecentUsers(sortedUsers);
      } else {
        setRecentUsers([]);
      }

      // Handle payment stats - with data validation
      if (paymentStatsData) {
        setPaymentStats({
          pendingPayments: paymentStatsData.pendingPayments || 0,
          totalRevenue: paymentStatsData.totalRevenue || 0,
          approvedPayments: paymentStatsData.approvedPayments || 0,
          rejectedPayments: paymentStatsData.rejectedPayments || 0,
          totalPayments: paymentStatsData.totalPayments || 0
        });
      }

      // Update connection status
      setConnectionStatus({
        connected: true,
        lastUpdated: new Date()
      });
      
    } catch (error) {
      console.error('Critical error loading dashboard:', error);
      setError(error.message || 'Failed to load dashboard data. Please check if the backend server is running on http://localhost:3001.');
      setConnectionStatus({
        connected: false,
        lastUpdated: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely format numbers
  const formatNumber = (num, defaultValue = 0) => {
    if (num === undefined || num === null) return defaultValue;
    const parsed = parseFloat(num);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  const formatCurrency = (amount) => {
    const num = formatNumber(amount);
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatINR = (amount) => {
    const num = formatNumber(amount);
    return `₹${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const calculateTotalBalance = (user) => {
    const real = formatNumber(user.realBalance);
    const paper = formatNumber(user.paperBalance);
    return real + paper;
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
          <p className="loading-sub">Please wait while we fetch the latest data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <div className="connection-banner disconnected">
          <div className="banner-content">
            <div className="banner-icon">⚠️</div>
            <div className="banner-text">
              <strong>Connection Error</strong>
              <span>{error}</span>
            </div>
            <div className="connection-actions">
              <button className="test-btn" onClick={testConnection}>
                <i className="fas fa-plug"></i> Test Connection
              </button>
              <button className="refresh-btn" onClick={loadDashboardData}>
                <i className="fas fa-sync-alt"></i> Retry
              </button>
            </div>
          </div>
        </div>
        
        <div className="info-card">
          <h4>Troubleshooting Steps:</h4>
          <div className="info-grid">
            <div>1. Check if backend server is running</div>
            <div>2. Verify server URL: http://localhost:3001</div>
            <div>3. Check server console for errors</div>
            <div>4. Restart the backend server</div>
          </div>
          <button className="test-connection-btn" onClick={testConnection}>
            <i className="fas fa-plug"></i> Test Backend Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* Connection Status Banner */}
      <div className={`connection-banner ${connectionStatus.connected ? 'connected' : 'disconnected'}`}>
        <div className="banner-content">
          <div className="banner-icon">{connectionStatus.connected ? '✅' : '⚠️'}</div>
          <div className="banner-text">
            <strong>
              {connectionStatus.connected ? 'Backend Connected' : 'Backend Disconnected'}
            </strong>
            <span>
              {connectionStatus.connected 
                ? 'All systems operational' 
                : 'Cannot connect to server'}
            </span>
          </div>
          <button 
            className="refresh-btn" 
            onClick={loadDashboardData}
            disabled={loading}
          >
            <i className="fas fa-sync-alt"></i> {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {connectionStatus.lastUpdated && (
          <div className="last-updated">
            Last updated: {connectionStatus.lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="welcome-banner">
        <h2>Admin Dashboard - Live Trading Monitor</h2>
        <p>Real-time monitoring of trading activity across all users</p>
      </div>
      
      {/* Trading Stats Grid */}
      <div className="dashboard-stats trading-stats">
        <div className="stat-card total-users">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-detail">
              <span className="trend-up">
                <i className="fas fa-arrow-up"></i>
                {stats.activeUsers} active
              </span>
            </div>
          </div>
        </div>
        
        <div className="stat-card active-trades">
          <div className="stat-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-info">
            <h3>Open Positions</h3>
            <div className="stat-value">{stats.openPositions}</div>
            <div className="stat-detail">
              <span className="trend-up">
                <i className="fas fa-arrow-up"></i>
                Active Trades
              </span>
            </div>
          </div>
        </div>
        
        <div className="stat-card total-balance">
          <div className="stat-icon">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="stat-info">
            <h3>Total Balance</h3>
            <div className="stat-value">{formatCurrency(stats.totalBalance)}</div>
            <div className="stat-detail">
              <span>Across all users</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card daily-volume">
          <div className="stat-icon">
            <i className="fas fa-exchange-alt"></i>
          </div>
          <div className="stat-info">
            <h3>Daily Volume</h3>
            <div className="stat-value">{formatCurrency(stats.dailyVolume)}</div>
            <div className="stat-detail">
              <span>24h trading volume</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Statistics Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2><i className="fas fa-credit-card"></i> Payment Statistics</h2>
          <span className="section-badge">Live</span>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon pending">
                <i className="fas fa-clock"></i>
              </div>
              <h3>Pending Payments</h3>
            </div>
            <div className="stat-value">{paymentStats.pendingPayments}</div>
            <div className="stat-footer">
              <div className="stat-detail">
                Awaiting admin approval
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon revenue">
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <h3>Total Revenue</h3>
            </div>
            <div className="stat-value">{formatINR(paymentStats.totalRevenue)}</div>
            <div className="stat-footer">
              <div className="stat-detail">
                From approved payments
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon approved">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3>Approved Payments</h3>
            </div>
            <div className="stat-value">{paymentStats.approvedPayments}</div>
            <div className="stat-footer">
              <div className="stat-detail">
                Successfully processed
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon rejected">
                <i className="fas fa-times-circle"></i>
              </div>
              <h3>Rejected Payments</h3>
            </div>
            <div className="stat-value">{paymentStats.rejectedPayments}</div>
            <div className="stat-footer">
              <div className="stat-detail">
                Failed or declined
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="dashboard-grid">
        {/* Recent Trades */}
        <div className="content-section">
          <div className="section-header">
            <h2><i className="fas fa-exchange-alt"></i> Recent Trades</h2>
            <button className="btn btn-sm" onClick={loadDashboardData}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
          <div className="section-content">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>P&L</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.length > 0 ? (
                  recentTrades.map(trade => (
                    <tr key={trade.id}>
                      <td>User #{trade.userId || 'N/A'}</td>
                      <td><strong>{trade.symbol}</strong></td>
                      <td>
                        <span className={`badge ${trade.side === 'buy' || trade.side === 'long' ? 'badge-success' : 'badge-danger'}`}>
                          {trade.side.toUpperCase()}
                        </span>
                      </td>
                      <td>{trade.quantity}</td>
                      <td>${formatNumber(trade.price).toFixed(2)}</td>
                      <td>
                        <span className={trade.pnl >= 0 ? 'text-success' : 'text-danger'}>
                          ${formatNumber(trade.pnl).toFixed(2)}
                        </span>
                      </td>
                      <td>
                        {trade.createdAt 
                          ? new Date(trade.createdAt).toLocaleTimeString()
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No recent trades found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="content-section">
          <div className="section-header">
            <h2><i className="fas fa-user-plus"></i> Recent Users</h2>
          </div>
          <div className="section-content">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length > 0 ? (
                  recentUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        ${calculateTotalBalance(user).toLocaleString()}
                      </td>
                      <td>
                        <span className={`status-badge status-${user.accountStatus}`}>
                          {user.accountStatus}
                        </span>
                      </td>
                      <td>
                        {user.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No recent users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="content-section">
        <div className="section-header">
          <h2><i className="fas fa-chart-bar"></i> Trading Overview</h2>
        </div>
        <div className="section-content">
          <div className="market-overview">
            <div className="overview-item">
              <h4>Total Trades Today</h4>
              <div className="overview-value">{stats.activeTrades}</div>
            </div>
            <div className="overview-item">
              <h4>Total P&L</h4>
              <div className={`overview-value ${stats.totalPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(stats.totalPnl)}
              </div>
            </div>
            <div className="overview-item">
              <h4>Avg Trade Size</h4>
              <div className="overview-value">
                {stats.dailyVolume > 0 && stats.activeTrades > 0 
                  ? formatCurrency(stats.dailyVolume / stats.activeTrades)
                  : formatCurrency(0)}
              </div>
            </div>
            <div className="overview-item">
              <h4>Win Rate</h4>
              <div className="overview-value">
                {stats.totalTrades > 0 && stats.winningTrades > 0
                  ? `${Math.round((stats.winningTrades / stats.totalTrades) * 100)}%` 
                  : '0%'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="system-info">
        <div className="info-item">
          <label>Backend Status</label>
          <div className="value">
            <span className={`status-indicator ${connectionStatus.connected ? 'online' : 'offline'}`}>
              {connectionStatus.connected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
        <div className="info-item">
          <label>Last Updated</label>
          <div className="value">
            {connectionStatus.lastUpdated ? connectionStatus.lastUpdated.toLocaleTimeString() : 'N/A'}
          </div>
        </div>
        <div className="info-item">
          <label>Total Trades Processed</label>
          <div className="value">{stats.totalTrades}</div>
        </div>
        <div className="info-item">
          <label>Total Payments</label>
          <div className="value">{paymentStats.totalPayments}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;