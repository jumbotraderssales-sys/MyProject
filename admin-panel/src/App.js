import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AdminWithdrawalPanel from './AdminWithdrawalPanel'; // Direct import
import './App.css';

// Lazy load other pages only
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));
const TradesPage = React.lazy(() => import('./pages/TradesPage'));
const PaymentsPage = React.lazy(() => import('./pages/PaymentsPage'));
const UPISettings = React.lazy(() => import('./components/UPISettings'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="content-area">
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/trades" element={<TradesPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/withdrawals" element={<AdminWithdrawalPanel />} />
                <Route path="/upi-settings" element={<UPISettings />} />
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