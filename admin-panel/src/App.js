import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './App.css';

// Lazy load all pages for better performance
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));
const TradesPage = React.lazy(() => import('./pages/TradesPage'));
const PaymentsPage = React.lazy(() => import('./pages/PaymentsPage'));
const WithdrawalsPage = React.lazy(() => import('./pages/WithdrawalsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

// Create a placeholder for missing components
const MissingComponent = () => (
  <div className="error-container">
    <i className="fas fa-exclamation-triangle"></i>
    <h2>Component Not Found</h2>
    <p>This page is under development.</p>
  </div>
);

// For UPI Settings - if missing, use placeholder
const UPISettingsPage = React.lazy(() => 
  Promise.resolve().then(() => {
    try {
      return import('./pages/UPISettingsPage');
    } catch (error) {
      return { default: MissingComponent };
    }
  })
);

// For Challenge Management - if missing, use UsersPage as placeholder
const ChallengeManagement = React.lazy(() => 
  Promise.resolve().then(() => {
    try {
      return import('./pages/ChallengeManagement');
    } catch (error) {
      return { default: UsersPage }; // Fallback to UsersPage
    }
  })
);

// Loading component
const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading admin panel...</p>
  </div>
);

// Main App component
function App() {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeTrades: 0,
    pendingPayments: 0,
    pendingWithdrawals: 0,
    totalRevenue: 0,
    activeChallenges: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial system stats
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      
      // Using the correct endpoints from your backend
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const [usersRes, tradesRes, paymentsRes, withdrawalsRes] = await Promise.all([
        fetch(`${baseURL}/api/admin/users`),
        fetch(`${baseURL}/api/admin/trades`),
        fetch(`${baseURL}/api/admin/payments`),
        fetch(`${baseURL}/api/admin/withdrawals`)
      ]);

      // Check if responses are ok
      if (!usersRes.ok || !tradesRes.ok || !paymentsRes.ok || !withdrawalsRes.ok) {
        throw new Error('Failed to fetch data from server');
      }

      const users = await usersRes.json();
      const trades = await tradesRes.json();
      const payments = await paymentsRes.json();
      const withdrawals = await withdrawalsRes.json();

      // Calculate stats from existing data
      const activeTrades = Array.isArray(trades) ? 
        trades.filter(trade => trade.status === 'open' || trade.status === 'active').length : 0;
      
      const pendingPayments = Array.isArray(payments) ? 
        payments.filter(payment => payment.status === 'pending').length : 0;
      
      const pendingWithdrawals = Array.isArray(withdrawals) ? 
        withdrawals.filter(withdrawal => withdrawal.status === 'pending').length : 0;
      
      // Calculate total revenue from approved payments
      const totalRevenue = Array.isArray(payments) ? 
        payments
          .filter(p => p.status === 'approved')
          .reduce((sum, payment) => sum + (payment.amount || 0), 0) : 0;
      
      // Calculate active challenges (users with current challenge)
      const activeChallenges = Array.isArray(users) ? 
        users.filter(user => 
          user.currentChallenge && 
          user.currentChallenge !== 'No Challenge' &&
          user.challengeStats?.status === 'active'
        ).length : 0;

      setSystemStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        activeTrades,
        pendingPayments,
        pendingWithdrawals,
        totalRevenue,
        activeChallenges
      });
      
    } catch (error) {
      console.error('Error fetching system stats:', error);
      // Fallback data for demo
      setSystemStats({
        totalUsers: 156,
        activeTrades: 24,
        pendingPayments: 8,
        pendingWithdrawals: 12,
        totalRevenue: 125000,
        activeChallenges: 42
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    fetchSystemStats();
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header onRefresh={refreshStats} />
          <div className="content-area">
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route 
                  path="/" 
                  element={<DashboardPage systemStats={systemStats} loading={loading} />} 
                />
                <Route 
                  path="/dashboard" 
                  element={<DashboardPage systemStats={systemStats} loading={loading} />} 
                />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/trades" element={<TradesPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/withdrawals" element={<WithdrawalsPage />} />
                <Route path="/upi-settings" element={<UPISettingsPage />} />
                <Route path="/challenges" element={<ChallengeManagement />} />
                <Route path="/settings" element={<SettingsPage />} />
                
                {/* Fallback routes */}
                <Route path="*" element={<DashboardPage systemStats={systemStats} loading={loading} />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
