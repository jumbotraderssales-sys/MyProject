import React, { useState, useEffect } from 'react';
import './WithdrawalHistory.css';

function WithdrawalHistory({ userAccount }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load withdrawal history from localStorage or API
  useEffect(() => {
    loadWithdrawalHistory();
  }, [userAccount]);

  const loadWithdrawalHistory = () => {
    setLoading(true);
    
    try {
      // Try to load from localStorage first
      const savedWithdrawals = localStorage.getItem(`withdrawals_${userAccount.id}`);
      if (savedWithdrawals) {
        setWithdrawals(JSON.parse(savedWithdrawals));
      }
      
      // Try to load from backend API
      const token = localStorage.getItem('token');
      if (token) {
        fetch('http://localhost:3001/api/withdrawals', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.withdrawals) {
              setWithdrawals(data.withdrawals);
              localStorage.setItem(`withdrawals_${userAccount.id}`, JSON.stringify(data.withdrawals));
            }
          })
          .catch(() => {
            // Use local storage if API fails
          });
      }
    } catch (error) {
      console.error('Error loading withdrawal history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
      case 'completed':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-unknown';
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['ID', 'Amount (₹)', 'Status', 'Payment Method', 'Date', 'Notes'],
      ...withdrawals.map(w => [
        w.id,
        w.amount,
        w.status,
        w.paymentMethod || 'Bank Transfer',
        formatDate(w.createdAt || w.date),
        w.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `withdrawal_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="withdrawal-history-container">
      <div className="withdrawal-history-header">
        <h2>Withdrawal History</h2>
        <div className="history-actions">
          <button 
            className="refresh-btn"
            onClick={loadWithdrawalHistory}
            disabled={loading}
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
          <button 
            className="export-btn"
            onClick={exportToCSV}
            disabled={withdrawals.length === 0}
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      <div className="summary-stats">
        <div className="summary-stat">
          <span className="stat-label">Total Withdrawals</span>
          <span className="stat-value">{withdrawals.length}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Total Amount</span>
          <span className="stat-value">
            ₹{withdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0).toLocaleString()}
          </span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Pending</span>
          <span className="stat-value status-pending">
            {withdrawals.filter(w => w.status === 'pending').length}
          </span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Approved</span>
          <span className="stat-value status-approved">
            {withdrawals.filter(w => w.status === 'approved' || w.status === 'completed').length}
          </span>
        </div>
      </div>

      {withdrawals.length > 0 ? (
        <div className="withdrawal-table-container">
          <table className="withdrawal-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Date</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(withdrawal => (
                <tr key={withdrawal.id}>
                  <td>
                    <span className="withdrawal-id">{withdrawal.id}</span>
                  </td>
                  <td>
                    <span className="withdrawal-amount">
                      ₹{typeof withdrawal.amount === 'string' ? withdrawal.amount : withdrawal.amount?.toLocaleString() || '0'}
                    </span>
                  </td>
                  <td>
                    <span className="payment-method">
                      {withdrawal.paymentMethod || 'Bank Transfer'}
                    </span>
                  </td>
                  <td>
                    <span className="withdrawal-date">
                      {formatDate(withdrawal.createdAt || withdrawal.date)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(withdrawal.status)}`}>
                      {withdrawal.status}
                    </span>
                  </td>
                  <td>
                    <span className="withdrawal-notes">
                      {withdrawal.notes || 'No notes'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <h3>No Withdrawal History</h3>
          <p>You haven't made any withdrawal requests yet.</p>
        </div>
      )}

      <div className="withdrawal-history-footer">
        <p className="disclaimer">
          <strong>Note:</strong> Withdrawal requests are processed manually by admin within 24-48 hours.
          You'll receive an email notification once your withdrawal is processed.
        </p>
      </div>
    </div>
  );
}

export default WithdrawalHistory;