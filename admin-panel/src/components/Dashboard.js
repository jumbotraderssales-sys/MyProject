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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading dashboard data...');

      const [
        dashboardStats,
        tradesData,
        usersData,
        paymentStatsData
      ] = await Promise.all([
        adminApi.getPlatformStats(),
        adminApi.getAllTrades(),
        adminApi.getAllUsers(),
        adminApi.getPaymentStats()
      ]);

      setStats({
        totalUsers: dashboardStats.totalUsers || usersData.length || 0,
        activeUsers: dashboardStats.activeUsers || 0,
        totalBalance: dashboardStats.totalBalance || 0,
        activeTrades: dashboardStats.activeTrades || 0,
        openPositions: dashboardStats.openPositions || 0,
        dailyVolume: dashboardStats.dailyVolume || 0,
        totalPnl: dashboardStats.totalPnl || 0,
        totalTrades: tradesData.length || 0,
        winningTrades: dashboardStats.winningTrades || 0
      });

      setRecentTrades(tradesData.slice(0, 5));
      setRecentUsers(usersData.slice(0, 5));
      setPaymentStats(paymentStatsData);

      setConnectionStatus({
        connected: true,
        lastUpdated: new Date()
      });

      console.log('Dashboard data loaded successfully');

    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data');
      setConnectionStatus({
        connected: false,
        lastUpdated: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (num) => {
    const n = Number(num) || 0;
    return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const formatINR = (num) => {
    const n = Number(num) || 0;
    return `₹${n.toLocaleString()}`;
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="dashboard-content">

      <h2>Admin Dashboard</h2>

      <div>
        Backend Status: {connectionStatus.connected ? 'ONLINE' : 'OFFLINE'}
      </div>

      <hr />

      <h3>Stats</h3>
      <p>Total Users: {stats.totalUsers}</p>
      <p>Open Positions: {stats.openPositions}</p>
      <p>Total Balance: {formatCurrency(stats.totalBalance)}</p>
      <p>Daily Volume: {formatCurrency(stats.dailyVolume)}</p>

      <hr />

      <h3>Payments</h3>
      <p>Pending: {paymentStats.pendingPayments}</p>
      <p>Total Revenue: {formatINR(paymentStats.totalRevenue)}</p>

      <hr />

      <h3>Recent Trades</h3>
      <ul>
        {recentTrades.map(t => (
          <li key={t._id || t.id}>
            {t.symbol} - {t.side}
          </li>
        ))}
      </ul>

      <h3>Recent Users</h3>
      <ul>
        {recentUsers.map(u => (
          <li key={u._id || u.id}>
            {u.email}
          </li>
        ))}
      </ul>

    </div>
  );
};

export default Dashboard;
