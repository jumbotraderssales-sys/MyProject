import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    // User Stats
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    newUsersToday: 0,
    
    // Trading Stats
    totalTrades: 0,
    openPositions: 0,
    closedTrades: 0,
    totalVolume: 0,
    totalPnl: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    avgTradeSize: 0,
    biggestWin: 0,
    biggestLoss: 0,
    
    // Balance Stats
    totalPaperBalance: 0,
    totalRealBalance: 0,
    totalWithdrawn: 0,
    
    // Payment Stats
    pendingPayments: 0,
    approvedPayments: 0,
    rejectedPayments: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
    completedWithdrawals: 0,
    
    // Challenge Stats
    activeChallenges: 0,
    completedChallenges: 0,
    failedChallenges: 0,
    
    // Referral Stats
    totalReferrals: 0,
    referralRewardsGiven: 0
  });

  const [recentTrades, setRecentTrades] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [topTraders, setTopTraders] = useState([]);
  
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    lastUpdated: null,
    responseTime: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h'); // 24h, 7d, 30d, all
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Test connection and measure response time
  const testConnection = useCallback(async () => {
    const startTime = Date.now();
    try {
      await adminApi.testConnection();
      const responseTime = Date.now() - startTime;
      setConnectionStatus({
        connected: true,
        lastUpdated: new Date(),
        responseTime
      });
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus({
        connected: false,
        lastUpdated: new Date(),
        responseTime: 0
      });
      return false;
    }
  }, []);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      console.log('📊 Loading advanced dashboard data...');
      
      // Test connection first
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Backend server is not responding');
      }

      // Fetch all data in parallel with error handling for each
      const [users, trades, payments, withdrawals] = await Promise.all([
        adminApi.getAllUsers().catch(err => {
          console.error('Error loading users:', err);
          return [];
        }),
        adminApi.getAllTrades().catch(err => {
          console.error('Error loading trades:', err);
          return [];
        }),
        adminApi.getAllPayments().catch(err => {
          console.error('Error loading payments:', err);
          return [];
        }),
        adminApi.getAllWithdrawals().catch(err => {
          console.error('Error loading withdrawals:', err);
          return [];
        })
      ]);

      console.log('✅ Data loaded:', {
        users: users?.length || 0,
        trades: trades?.length || 0,
        payments: payments?.length || 0,
        withdrawals: withdrawals?.length || 0
      });

      // ========== PROCESS USER STATS ==========
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      const activeUsers = users?.filter(u => u.accountStatus === 'active').length || 0;
      const newUsersToday = users?.filter(u => {
        const created = new Date(u.createdAt || u.registrationDate || 0);
        return created >= new Date(today);
      }).length || 0;

      // ========== PROCESS TRADING STATS ==========
      const closedTrades = trades?.filter(t => t.status === 'closed') || [];
      const openPositions = trades?.filter(t => t.status === 'open') || [];
      
      const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
      const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);
      
      const totalVolume = trades?.reduce((sum, t) => sum + (t.positionValue || 0), 0) || 0;
      const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      
      const winRate = closedTrades.length > 0 
        ? (winningTrades.length / closedTrades.length) * 100 
        : 0;
      
      const avgTradeSize = trades?.length > 0 
        ? totalVolume / trades.length 
        : 0;
      
      const biggestWin = Math.max(...winningTrades.map(t => t.pnl || 0), 0);
      const biggestLoss = Math.min(...losingTrades.map(t => t.pnl || 0), 0);

      // ========== PROCESS BALANCE STATS ==========
      const totalPaperBalance = users?.reduce((sum, u) => sum + (u.paperBalance || 0), 0) || 0;
      const totalRealBalance = users?.reduce((sum, u) => sum + (u.realBalance || 0), 0) || 0;
      
      const totalWithdrawn = withdrawals
        ?.filter(w => w.status === 'approved')
        .reduce((sum, w) => sum + (w.amount || 0), 0) || 0;

      // ========== PROCESS PAYMENT STATS ==========
      const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0;
      const approvedPayments = payments?.filter(p => p.status === 'approved').length || 0;
      const rejectedPayments = payments?.filter(p => p.status === 'rejected').length || 0;
      
      const totalRevenue = payments
        ?.filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // ========== PROCESS WITHDRAWAL STATS ==========
      const pendingWithdrawals = withdrawals?.filter(w => w.status === 'pending').length || 0;
      const completedWithdrawals = withdrawals?.filter(w => w.status === 'approved').length || 0;

      // ========== PROCESS CHALLENGE STATS ==========
      const activeChallenges = users?.filter(u => u.currentChallenge && u.challengeStats?.status === 'active').length || 0;
      const completedChallenges = users?.filter(u => u.challengeStats?.status === 'passed').length || 0;
      const failedChallenges = users?.filter(u => u.challengeStats?.status === 'failed').length || 0;

      // ========== PROCESS REFERRAL STATS ==========
      const totalReferrals = users?.reduce((sum, u) => sum + (u.referralCount || 0), 0) || 0;
      const referralRewardsGiven = users?.filter(u => u.referralReward?.awarded).length || 0;

      // ========== UPDATE STATS ==========
      setStats({
        // User Stats
        totalUsers: users?.length || 0,
        activeUsers,
        inactiveUsers: (users?.length || 0) - activeUsers,
        newUsersToday,
        
        // Trading Stats
        totalTrades: trades?.length || 0,
        openPositions: openPositions.length,
        closedTrades: closedTrades.length,
        totalVolume,
        totalPnl,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate,
        avgTradeSize,
        biggestWin,
        biggestLoss,
        
        // Balance Stats
        totalPaperBalance,
        totalRealBalance,
        totalWithdrawn,
        
        // Payment Stats
        pendingPayments,
        approvedPayments,
        rejectedPayments,
        totalRevenue,
        pendingWithdrawals,
        completedWithdrawals,
        
        // Challenge Stats
        activeChallenges,
        completedChallenges,
        failedChallenges,
        
        // Referral Stats
        totalReferrals,
        referralRewardsGiven
      });

      // ========== PROCESS RECENT DATA ==========
      
      // Recent Trades (last 10)
      const sortedTrades = [...(trades || [])]
        .filter(t => t.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
        .map(t => ({
          id: t.id || t._id,
          userId: t.userId,
          userName: t.userName || `User #${t.userId}`,
          symbol: t.symbol || 'N/A',
          side: (t.side || 'unknown').toLowerCase(),
          quantity: t.size || t.quantity || 0,
          price: t.entryPrice || t.price || 0,
          pnl: t.pnl || 0,
          status: t.status,
          createdAt: t.createdAt
        }));
      setRecentTrades(sortedTrades);

      // Recent Users (last 10)
      const sortedUsers = [...(users || [])]
        .filter(u => u.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
        .map(u => ({
          id: u.id || u._id,
          name: u.name || u.username || `User #${u.id}`,
          email: u.email || 'No email',
          paperBalance: u.paperBalance || 0,
          realBalance: u.realBalance || 0,
          accountStatus: u.accountStatus || 'inactive',
          currentChallenge: u.currentChallenge || 'No Challenge',
          createdAt: u.createdAt
        }));
      setRecentUsers(sortedUsers);

      // Recent Payments (last 10)
      const sortedPayments = [...(payments || [])]
        .filter(p => p.submittedAt)
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 10)
        .map(p => ({
          id: p.id || p._id,
          userName: p.userName || `User #${p.userId}`,
          challengeName: p.challengeName || p.planName || 'Challenge',
          amount: p.amount || 0,
          status: p.status || 'pending',
          submittedAt: p.submittedAt
        }));
      setRecentPayments(sortedPayments);

      // Recent Withdrawals (last 10)
      const sortedWithdrawals = [...(withdrawals || [])]
        .filter(w => w.requestedAt)
        .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
        .slice(0, 10)
        .map(w => ({
          id: w.id || w._id,
          userName: w.userName || `User #${w.userId}`,
          amount: w.amount || 0,
          status: w.status || 'pending',
          requestedAt: w.requestedAt
        }));
      setRecentWithdrawals(sortedWithdrawals);

      // Top Traders (by PnL)
      const traderStats = {};
      closedTrades.forEach(trade => {
        if (!trade.userId) return;
        if (!traderStats[trade.userId]) {
          const user = users?.find(u => u.id === trade.userId);
          traderStats[trade.userId] = {
            userId: trade.userId,
            userName: user?.name || trade.userName || `User #${trade.userId}`,
            totalTrades: 0,
            totalPnl: 0,
            winningTrades: 0
          };
        }
        traderStats[trade.userId].totalTrades++;
        traderStats[trade.userId].totalPnl += trade.pnl || 0;
        if ((trade.pnl || 0) > 0) traderStats[trade.userId].winningTrades++;
      });

      const topTradersList = Object.values(traderStats)
        .sort((a, b) => b.totalPnl - a.totalPnl)
        .slice(0, 5);
      setTopTraders(topTradersList);

    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [testConnection]);

  // Initial load and auto-refresh
  useEffect(() => {
    loadDashboardData();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    }
    
    return () => clearInterval(interval);
  }, [loadDashboardData, autoRefresh]);

  // Helper functions
  const formatNumber = (num, decimals = 0) => {
    if (num === undefined || num === null) return '0';
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return '0';
    return parsed.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const formatCurrency = (amount, currency = 'INR') => {
    const num = parseFloat(amount) || 0;
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${num.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatPercentage = (value) => {
    const num = parseFloat(value) || 0;
    return `${num.toFixed(1)}%`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      approved: 'badge-success',
      completed: 'badge-success',
      passed: 'badge-success',
      pending: 'badge-warning',
      rejected: 'badge-danger',
      failed: 'badge-danger',
      inactive: 'badge-secondary',
      open: 'badge-info',
      closed: 'badge-secondary'
    };
    return badges[status] || 'badge-secondary';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Advanced Dashboard...</p>
          <p className="loading-sub">Fetching real-time data from server</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header with Controls */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Advanced Dashboard</h1>
          <p className="dashboard-subtitle">Real-time platform analytics and monitoring</p>
        </div>
        <div className="header-controls">
          <select 
            className="time-selector" 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          
          <label className="auto-refresh">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
            /> Auto Refresh
          </label>
          
          <button 
            className="refresh-btn" 
            onClick={loadDashboardData}
            disabled={refreshing}
          >
            <i className={`fas fa-sync-alt ${refreshing ? 'fa-spin' : ''}`}></i>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`connection-banner ${connectionStatus.connected ? 'connected' : 'disconnected'}`}>
        <div className="banner-content">
          <div className="banner-icon">{connectionStatus.connected ? '✅' : '⚠️'}</div>
          <div className="banner-text">
            <strong>
              {connectionStatus.connected ? 'Connected to Backend' : 'Disconnected from Backend'}
            </strong>
            <span>
              {connectionStatus.connected 
                ? `Response time: ${connectionStatus.responseTime}ms • Last updated: ${connectionStatus.lastUpdated?.toLocaleTimeString()}`
                : 'Cannot connect to server'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="quick-stats">
        <div className="stat-badge">
          <i className="fas fa-users"></i>
          <span>{formatNumber(stats.totalUsers)} Users</span>
        </div>
        <div className="stat-badge">
          <i className="fas fa-chart-line"></i>
          <span>{formatNumber(stats.openPositions)} Open Positions</span>
        </div>
        <div className="stat-badge">
          <i className="fas fa-clock"></i>
          <span>{formatNumber(stats.pendingPayments)} Pending Payments</span>
        </div>
        <div className="stat-badge">
          <i className="fas fa-hourglass-half"></i>
          <span>{formatNumber(stats.pendingWithdrawals)} Pending Withdrawals</span>
        </div>
        <div className="stat-badge">
          <i className="fas fa-trophy"></i>
          <span>{formatPercentage(stats.winRate)} Win Rate</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        {/* User Stats Card */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon users">
              <i className="fas fa-users"></i>
            </div>
            <h3>User Statistics</h3>
          </div>
          <div className="stat-content">
            <div className="stat-row">
              <span>Total Users:</span>
              <strong>{formatNumber(stats.totalUsers)}</strong>
            </div>
            <div className="stat-row">
              <span>Active Users:</span>
              <strong className="text-success">{formatNumber(stats.activeUsers)}</strong>
            </div>
            <div className="stat-row">
              <span>Inactive Users:</span>
              <strong className="text-danger">{formatNumber(stats.inactiveUsers)}</strong>
            </div>
            <div className="stat-row">
              <span>New Today:</span>
              <strong className="text-primary">{formatNumber(stats.newUsersToday)}</strong>
            </div>
            <div className="stat-progress">
              <div 
                className="progress-fill" 
                style={{ width: `${(stats.activeUsers / stats.totalUsers) * 100 || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Trading Stats Card */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon trades">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Trading Statistics</h3>
          </div>
          <div className="stat-content">
            <div className="stat-row">
              <span>Total Trades:</span>
              <strong>{formatNumber(stats.totalTrades)}</strong>
            </div>
            <div className="stat-row">
              <span>Open Positions:</span>
              <strong className="text-primary">{formatNumber(stats.openPositions)}</strong>
            </div>
            <div className="stat-row">
              <span>Winning Trades:</span>
              <strong className="text-success">{formatNumber(stats.winningTrades)}</strong>
            </div>
            <div className="stat-row">
              <span>Losing Trades:</span>
              <strong className="text-danger">{formatNumber(stats.losingTrades)}</strong>
            </div>
            <div className="stat-row highlight">
              <span>Win Rate:</span>
              <strong className={stats.winRate >= 50 ? 'text-success' : 'text-danger'}>
                {formatPercentage(stats.winRate)}
              </strong>
            </div>
          </div>
        </div>

        {/* Financial Stats Card */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon balance">
              <i className="fas fa-wallet"></i>
            </div>
            <h3>Financial Statistics</h3>
          </div>
          <div className="stat-content">
            <div className="stat-row">
              <span>Paper Balance:</span>
              <strong>{formatCurrency(stats.totalPaperBalance)}</strong>
            </div>
            <div className="stat-row">
              <span>Real Balance:</span>
              <strong className="text-success">{formatCurrency(stats.totalRealBalance)}</strong>
            </div>
            <div className="stat-row">
              <span>Total Withdrawn:</span>
              <strong className="text-primary">{formatCurrency(stats.totalWithdrawn)}</strong>
            </div>
            <div className="stat-row highlight">
              <span>Total P&L:</span>
              <strong className={stats.totalPnl >= 0 ? 'text-success' : 'text-danger'}>
                {formatCurrency(stats.totalPnl)}
              </strong>
            </div>
          </div>
        </div>

        {/* Payment Stats Card */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon payments">
              <i className="fas fa-credit-card"></i>
            </div>
            <h3>Payment Statistics</h3>
          </div>
          <div className="stat-content">
            <div className="stat-row">
              <span>Total Revenue:</span>
              <strong className="text-success">{formatCurrency(stats.totalRevenue)}</strong>
            </div>
            <div className="stat-row">
              <span>Pending Payments:</span>
              <strong className="text-warning">{formatNumber(stats.pendingPayments)}</strong>
            </div>
            <div className="stat-row">
              <span>Approved:</span>
              <strong className="text-success">{formatNumber(stats.approvedPayments)}</strong>
            </div>
            <div className="stat-row">
              <span>Rejected:</span>
              <strong className="text-danger">{formatNumber(stats.rejectedPayments)}</strong>
            </div>
          </div>
        </div>

        {/* Withdrawal Stats Card */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon withdrawals">
              <i className="fas fa-hand-holding-usd"></i>
            </div>
            <h3>Withdrawal Statistics</h3>
          </div>
          <div className="stat-content">
            <div className="stat-row">
              <span>Pending:</span>
              <strong className="text-warning">{formatNumber(stats.pendingWithdrawals)}</strong>
            </div>
            <div className="stat-row">
              <span>Completed:</span>
              <strong className="text-success">{formatNumber(stats.completedWithdrawals)}</strong>
            </div>
            <div className="stat-row">
              <span>Total Amount:</span>
              <strong>{formatCurrency(stats.totalWithdrawn)}</strong>
            </div>
          </div>
        </div>

        {/* Challenge Stats Card */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon challenges">
              <i className="fas fa-trophy"></i>
            </div>
            <h3>Challenge Statistics</h3>
          </div>
          <div className="stat-content">
            <div className="stat-row">
              <span>Active Challenges:</span>
              <strong className="text-primary">{formatNumber(stats.activeChallenges)}</strong>
            </div>
            <div className="stat-row">
              <span>Completed:</span>
              <strong className="text-success">{formatNumber(stats.completedChallenges)}</strong>
            </div>
            <div className="stat-row">
              <span>Failed:</span>
              <strong className="text-danger">{formatNumber(stats.failedChallenges)}</strong>
            </div>
          </div>
        </div>

        {/* Referral Stats Card */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon referrals">
              <i className="fas fa-share-alt"></i>
            </div>
            <h3>Referral Statistics</h3>
          </div>
          <div className="stat-content">
            <div className="stat-row">
              <span>Total Referrals:</span>
              <strong>{formatNumber(stats.totalReferrals)}</strong>
            </div>
            <div className="stat-row">
              <span>Rewards Given:</span>
              <strong className="text-success">{formatNumber(stats.referralRewardsGiven)}</strong>
            </div>
          </div>
        </div>

        {/* Performance Stats Card */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon performance">
              <i className="fas fa-chart-bar"></i>
            </div>
            <h3>Performance Metrics</h3>
          </div>
          <div className="stat-content">
            <div className="stat-row">
              <span>Avg Trade Size:</span>
              <strong>{formatCurrency(stats.avgTradeSize)}</strong>
            </div>
            <div className="stat-row">
              <span>Biggest Win:</span>
              <strong className="text-success">{formatCurrency(stats.biggestWin)}</strong>
            </div>
            <div className="stat-row">
              <span>Biggest Loss:</span>
              <strong className="text-danger">{formatCurrency(Math.abs(stats.biggestLoss))}</strong>
            </div>
            <div className="stat-row">
              <span>Total Volume:</span>
              <strong>{formatCurrency(stats.totalVolume)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Top Traders Section */}
      {topTraders.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2><i className="fas fa-crown"></i> Top Traders (By P&L)</h2>
            <span className="section-badge">Live</span>
          </div>
          <div className="top-traders-grid">
            {topTraders.map((trader, index) => (
              <div key={trader.userId} className="trader-card">
                <div className="trader-rank">#{index + 1}</div>
                <div className="trader-info">
                  <div className="trader-name">{trader.userName}</div>
                  <div className="trader-stats">
                    <span>Trades: {trader.totalTrades}</span>
                    <span>Win Rate: {((trader.winningTrades / trader.totalTrades) * 100).toFixed(1)}%</span>
                  </div>
                  <div className={`trader-pnl ${trader.totalPnl >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(trader.totalPnl)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Grid */}
      <div className="dashboard-grid">
        {/* Recent Trades */}
        <div className="content-section">
          <div className="section-header">
            <h2><i className="fas fa-exchange-alt"></i> Recent Trades</h2>
            <span className="section-count">{recentTrades.length}</span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>P&L</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map(trade => (
                  <tr key={trade.id}>
                    <td>{trade.userName}</td>
                    <td><strong>{trade.symbol}</strong></td>
                    <td>
                      <span className={`badge ${trade.side === 'buy' || trade.side === 'long' ? 'badge-success' : 'badge-danger'}`}>
                        {trade.side.toUpperCase()}
                      </span>
                    </td>
                    <td>{trade.quantity}</td>
                    <td>{formatCurrency(trade.price, 'USD')}</td>
                    <td>
                      <span className={trade.pnl >= 0 ? 'text-success' : 'text-danger'}>
                        {formatCurrency(trade.pnl, 'USD')}
                      </span>
                    </td>
                    <td>{new Date(trade.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
                {recentTrades.length === 0 && (
                  <tr><td colSpan="7" className="no-data">No recent trades</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="content-section">
          <div className="section-header">
            <h2><i className="fas fa-user-plus"></i> Recent Users</h2>
            <span className="section-count">{recentUsers.length}</span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Challenge</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div>
                        <div>{user.name}</div>
                        <small>{user.email}</small>
                      </div>
                    </td>
                    <td>
                      <span className="challenge-badge">{user.currentChallenge}</span>
                    </td>
                    <td>{formatCurrency(user.paperBalance + user.realBalance)}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(user.accountStatus)}`}>
                        {user.accountStatus}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr><td colSpan="5" className="no-data">No recent users</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payments & Withdrawals Grid */}
      <div className="dashboard-grid">
        {/* Recent Payments */}
        <div className="content-section">
          <div className="section-header">
            <h2><i className="fas fa-credit-card"></i> Recent Payments</h2>
            <span className="section-count">{recentPayments.length}</span>
          </div>
          <div className="payments-list">
            {recentPayments.map(payment => (
              <div key={payment.id} className={`payment-item ${payment.status}`}>
                <div className="payment-info">
                  <div className="payment-user">{payment.userName}</div>
                  <div className="payment-plan">{payment.challengeName}</div>
                </div>
                <div className="payment-amount">{formatCurrency(payment.amount)}</div>
                <span className={`badge ${getStatusBadge(payment.status)}`}>
                  {payment.status}
                </span>
              </div>
            ))}
            {recentPayments.length === 0 && (
              <div className="no-data">No recent payments</div>
            )}
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="content-section">
          <div className="section-header">
            <h2><i className="fas fa-hand-holding-usd"></i> Recent Withdrawals</h2>
            <span className="section-count">{recentWithdrawals.length}</span>
          </div>
          <div className="withdrawals-list">
            {recentWithdrawals.map(withdrawal => (
              <div key={withdrawal.id} className={`withdrawal-item ${withdrawal.status}`}>
                <div className="withdrawal-info">
                  <div className="withdrawal-user">{withdrawal.userName}</div>
                </div>
                <div className="withdrawal-amount">{formatCurrency(withdrawal.amount)}</div>
                <span className={`badge ${getStatusBadge(withdrawal.status)}`}>
                  {withdrawal.status}
                </span>
              </div>
            ))}
            {recentWithdrawals.length === 0 && (
              <div className="no-data">No recent withdrawals</div>
            )}
          </div>
        </div>
      </div>

      {/* System Info Footer */}
      <div className="system-info">
        <div className="info-item">
          <label>Server Status</label>
          <div className="value">
            <span className={`status-indicator ${connectionStatus.connected ? 'online' : 'offline'}`}>
              {connectionStatus.connected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
        <div className="info-item">
          <label>Response Time</label>
          <div className="value">{connectionStatus.responseTime}ms</div>
        </div>
        <div className="info-item">
          <label>Last Updated</label>
          <div className="value">{connectionStatus.lastUpdated?.toLocaleTimeString()}</div>
        </div>
        <div className="info-item">
          <label>Data Age</label>
          <div className="value">
            {connectionStatus.lastUpdated 
              ? Math.round((Date.now() - connectionStatus.lastUpdated) / 1000) + 's ago'
              : 'N/A'}
          </div>
        </div>
        <div className="info-item">
          <label>Auto Refresh</label>
          <div className="value">{autoRefresh ? 'ON' : 'OFF'}</div>
        </div>
        <div className="info-item">
          <label>Time Range</label>
          <div className="value">{timeRange}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
