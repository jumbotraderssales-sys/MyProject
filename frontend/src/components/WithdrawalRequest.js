import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WithdrawalHistory.css';

const WithdrawalHistory = ({ userAccount }) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchWithdrawalHistory();
  }, []);

  const fetchWithdrawalHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/withdrawal/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWithdrawals(response.data);
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      // For demo, use mock data
      setWithdrawals([
        {
          id: 'WD001',
          amount: 5000,
          status: 'completed',
          createdAt: '2024-01-15T10:30:00',
          completedAt: '2024-01-16T14:20:00',
          transactionId: 'TXN123456'
        },
        {
          id: 'WD002',
          amount: 3000,
          status: 'pending',
          createdAt: '2024-01-20T09:15:00'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="withdrawal-history-container">
      <div className="history-header">
        <h2><i className="fas fa-history"></i> Withdrawal History</h2>
        <p>Track your withdrawal requests and status</p>
      </div>

      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
        <button 
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="withdrawals-table">
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Requested Date</th>
                <th>Completed Date</th>
                <th>Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.id}>
                  <td>{withdrawal.id}</td>
                  <td>₹{withdrawal.amount?.toLocaleString()}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(withdrawal.status) }}
                    >
                      {withdrawal.status}
                    </span>
                  </td>
                  <td>{formatDate(withdrawal.createdAt)}</td>
                  <td>{withdrawal.completedAt ? formatDate(withdrawal.completedAt) : '-'}</td>
                  <td>{withdrawal.transactionId || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredWithdrawals.length === 0 && (
            <div className="no-data">
              <i className="fas fa-inbox"></i>
              <p>No withdrawal history found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistory;