// App.js - Admin Panel Main Component (Updated with Challenge System)
import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AdminWithdrawalPanel from './components/AdminWithdrawalPanel';
import UPIQRManagement from './components/UPIQRManagement';
import './App.css';

// Lazy load pages for better performance
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));
const TradesPage = React.lazy(() => import('./pages/TradesPage'));
const PaymentsPage = React.lazy(() => import('./pages/PaymentsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const ChallengeManagement = React.lazy(() => import('./pages/ChallengeManagement'));

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

  useEffect(() => {
    // Fetch initial system stats
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const [usersRes, tradesRes, paymentsRes, withdrawalsRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/users'),
        fetch('http://localhost:3001/api/admin/trades'),
        fetch('http://localhost:3001/api/admin/payments'),
        fetch('http://localhost:3001/api/admin/withdrawals?status=pending')
      ]);

      const users = await usersRes.json();
      const trades = await tradesRes.json();
      const payments = await paymentsRes.json();
      const withdrawals = await withdrawalsRes.json();

      // Calculate active challenges
      const activeChallenges = users.filter(user => 
        user.currentChallenge && user.currentChallenge !== 'No Challenge'
      ).length;

      // Calculate revenue from payments
      const approvedPayments = payments.filter(p => p.status === 'approved');
      const totalRevenue = approvedPayments.reduce((sum, payment) => sum + payment.amount, 0);

      setSystemStats({
        totalUsers: users.length,
        activeTrades: trades.filter(t => t.status === 'open').length,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        pendingWithdrawals: withdrawals.length,
        totalRevenue,
        activeChallenges
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="content-area">
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route 
                  path="/" 
                  element={<DashboardPage systemStats={systemStats} />} 
                />
                <Route 
                  path="/dashboard" 
                  element={<DashboardPage systemStats={systemStats} />} 
                />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/trades" element={<TradesPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/withdrawals" element={<AdminWithdrawalPanel />} />
                <Route path="/upi-settings" element={<UPIQRManagement />} />
                <Route path="/challenges" element={<ChallengeManagement />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
