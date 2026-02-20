import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AdminWithdrawalPanel from './AdminWithdrawalPanel'; // This is in the root
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import './App.css';

// Lazy load pages from the pages folder
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));
const TradesPage = React.lazy(() => import('./pages/TradesPage'));
const PaymentsPage = React.lazy(() => import('./pages/PaymentsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const OrdersPage = React.lazy(() => import('./pages/OrdersPage'));
const P2PPage = React.lazy(() => import('./pages/P2PPage'));
const UserDetailPage = React.lazy(() => import('./pages/UserDetailPage'));
const ChallengeManagement = React.lazy(() => import('./pages/ChallengeManagement'));
const ChallengeHistory = React.lazy(() => import('./pages/ChallengeHistory'));
const ReferralsPage = React.lazy(() => import('./pages/ReferralsPage'));

// Lazy load components from the components folder
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const UPISettings = React.lazy(() => import('./components/UPISettings'));

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
    activeChallenges: 0,
    challengeStats: {
      beginner: { total: 0, active: 0, passed: 0, failed: 0 },
      intermediate: { total: 0, active: 0, passed: 0, failed: 0 },
      pro: { total: 0, active: 0, passed: 0, failed: 0 }
    }
  });

  const [loading, setLoading] = useState(true);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const baseURL = process.env.REACT_APP_API_URL || 'https://myproject1-d097.onrender.com';
      
      const headers = { 'Authorization': `Bearer ${token}` };

      const [usersRes, tradesRes, paymentsRes, withdrawalsRes] = await Promise.all([
        fetch(`${baseURL}/api/admin/users`, { headers }),
        fetch(`${baseURL}/api/admin/trades`, { headers }),
        fetch(`${baseURL}/api/admin/payments`, { headers }),
        fetch(`${baseURL}/api/admin/withdrawals`, { headers })
      ]);

      if (!usersRes.ok || !tradesRes.ok || !paymentsRes.ok || !withdrawalsRes.ok) {
        throw new Error('Failed to fetch data from server');
      }

      const users = await usersRes.json();
      const trades = await tradesRes.json();
      const payments = await paymentsRes.json();
      const withdrawals = await withdrawalsRes.json();

      const activeTrades = Array.isArray(trades) ? 
        trades.filter(trade => trade.status === 'open' || trade.status === 'active').length : 0;
      
      const pendingPayments = Array.isArray(payments) ? 
        payments.filter(payment => payment.status === 'pending').length : 0;
      
      const pendingWithdrawals = Array.isArray(withdrawals) ? 
        withdrawals.filter(withdrawal => withdrawal.status === 'pending').length : 0;
      
      const totalRevenue = Array.isArray(payments) ? 
        payments
          .filter(p => p.status === 'approved')
          .reduce((sum, payment) => sum + (payment.amount || 0), 0) : 0;
      
      const challengeStats = {
        beginner: { total: 0, active: 0, passed: 0, failed: 0 },
        intermediate: { total: 0, active: 0, passed: 0, failed: 0 },
        pro: { total: 0, active: 0, passed: 0, failed: 0 }
      };
      
      let activeChallenges = 0;
      
      if (Array.isArray(users)) {
        users.forEach(user => {
          if (user.currentChallenge && user.currentChallenge !== 'No Challenge') {
            const challengeName = user.currentChallenge.toLowerCase();
            const status = user.challengeStats?.status || 'not_started';
            
            if (challengeName.includes('beginner')) {
              challengeStats.beginner.total++;
              if (status === 'active') {
                challengeStats.beginner.active++;
                activeChallenges++;
              } else if (status === 'passed') challengeStats.beginner.passed++;
              else if (status === 'failed') challengeStats.beginner.failed++;
            } else if (challengeName.includes('intermediate')) {
              challengeStats.intermediate.total++;
              if (status === 'active') {
                challengeStats.intermediate.active++;
                activeChallenges++;
              } else if (status === 'passed') challengeStats.intermediate.passed++;
              else if (status === 'failed') challengeStats.intermediate.failed++;
            } else if (challengeName.includes('pro')) {
              challengeStats.pro.total++;
              if (status === 'active') {
                challengeStats.pro.active++;
                activeChallenges++;
              } else if (status === 'passed') challengeStats.pro.passed++;
              else if (status === 'failed') challengeStats.pro.failed++;
            }
          }
        });
      }

      setSystemStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        activeTrades,
        pendingPayments,
        pendingWithdrawals,
        totalRevenue,
        activeChallenges,
        challengeStats
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
        activeChallenges: 42,
        challengeStats: {
          beginner: { total: 65, active: 25, passed: 20, failed: 20 },
          intermediate: { total: 45, active: 12, passed: 18, failed: 15 },
          pro: { total: 46, active: 5, passed: 25, failed: 16 }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const refreshStats = () => {
    fetchSystemStats();
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="app-container">
                <Sidebar />
                <div className="main-content">
                  <Header onRefresh={refreshStats} />
                  <div className="content-area">
                    <Suspense fallback={<Loading />}>
                      <Routes>
                        <Route path="/" element={<DashboardPage systemStats={systemStats} loading={loading} />} />
                        <Route path="/dashboard" element={<DashboardPage systemStats={systemStats} loading={loading} />} />
                        <Route path="/dashboard-alt" element={<Dashboard systemStats={systemStats} loading={loading} />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/user/:id" element={<UserDetailPage />} />
                        <Route path="/trades" element={<TradesPage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/p2p" element={<P2PPage />} />
                        <Route path="/payments" element={<PaymentsPage />} />
                        <Route path="/withdrawals" element={<AdminWithdrawalPanel />} />
                        <Route path="/upi-settings" element={<UPISettings />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/challenges" element={<ChallengeManagement />} />
                        <Route path="/challenge-history" element={<ChallengeHistory />} />
                        <Route path="/referrals" element={<ReferralsPage />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                      </Routes>
                    </Suspense>
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
