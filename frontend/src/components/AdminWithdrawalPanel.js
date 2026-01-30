import React, { useState, useEffect } from 'react';
import './AdminWithdrawalPanel.css';

function AdminWithdrawalPanel({ userAccount }) {
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (userAccount.role === 'admin') {
      loadWithdrawalRequests();
    }
  }, [userAccount]);

  const loadWithdrawalRequests = () => {
    setLoading(true);
    
    try {
      // Try to load from backend API
      const token = localStorage.getItem('token');
      if (token) {
        fetch('http://localhost:3001/api/withdrawals/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.withdrawals) {
              setWithdrawalRequests(data.withdrawals);
            }
          })
          .catch(() => {
            // Fallback: Load from localStorage
            const savedRequests = localStorage.getItem('admin_withdrawals');
            if (savedRequests) {
              setWithdrawalRequests(JSON.parse(savedRequests));
            }
          });
      } else {
        // Load from localStorage
        const savedRequests = localStorage.getItem('admin_withdrawals');
        if (savedRequests) {
          setWithdrawalRequests(JSON.parse(savedRequests));
        }
      }
    } catch (error) {
      console.error('Error loading withdrawal requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (requestId) => {
    const request = withdrawalRequests.find(r => r.id === requestId);
    if (!request) return;

    const confirmApprove = window.confirm(
      `Approve withdrawal of ₹${request.amount} to ${request.userName} (${request.userEmail})?`
    );

    if (confirmApprove) {
      const updatedRequests = withdrawalRequests.map(req => 
        req.id === requestId ? { ...req, status: 'approved', adminNotes } : req
      );
      
      setWithdrawalRequests(updatedRequests);
      localStorage.setItem('admin_withdrawals', JSON.stringify(updatedRequests));
      
      // Update user's real balance (in a real app, this would be a backend call)
      alert(`Withdrawal #${requestId} approved! Funds released to user.`);
      
      // Clear selection
      setSelectedRequest(null);
      setAdminNotes('');
    }
  };

  const handleReject = (requestId) => {
    const request = withdrawalRequests.find(r => r.id === requestId);
    if (!request) return;

    const reason = prompt('Enter rejection reason:');
    if (reason) {
      const updatedRequests = withdrawalRequests.map(req => 
        req.id === requestId ? { ...req, status: 'rejected', adminNotes: reason } : req
      );
      
      setWithdrawalRequests(updatedRequests);
      localStorage.setItem('admin_withdrawals', JSON.stringify(updatedRequests));
      
      alert(`Withdrawal #${requestId} rejected. Reason: ${reason}`);
      
      // Clear selection
      setSelectedRequest(null);
      setAdminNotes('');
    }
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

  const pendingCount = withdrawalRequests.filter(r => r.status === 'pending').length;
  const totalAmount = withdrawalRequests.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  return (
    <div className="admin-withdrawal-panel">
      <div className="admin-panel-header">
        <h2>👑 Admin Withdrawal Panel</h2>
        <div className="admin-stats">
          <div className="admin-stat">
            <span className="stat-label">Total Requests</span>
            <span className="stat-value">{withdrawalRequests.length}</span>
          </div>
          <div className="admin-stat">
            <span className="stat-label">Pending</span>
            <span className="stat-value status-pending">{pendingCount}</span>
          </div>
          <div className="admin-stat">
            <span className="stat-label">Total Amount</span>
            <span className="stat-value">₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="admin-controls">
        <button 
          className="refresh-btn"
          onClick={loadWithdrawalRequests}
          disabled={loading}
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh'}
        </button>
      </div>

      <div className="admin-content">
        {/* Pending Requests Section */}
        <div className="pending-requests-section">
          <h3>Pending Withdrawal Requests ({pendingCount})</h3>
          
          {pendingCount > 0 ? (
            <div className="requests-grid">
              {withdrawalRequests
                .filter(r => r.status === 'pending')
                .map(request => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <span className="request-id">#{request.id}</span>
                      <span className="request-amount">₹{request.amount}</span>
                    </div>
                    
                    <div className="request-user">
                      <div className="user-info">
                        <span className="user-name">{request.userName}</span>
                        <span className="user-email">{request.userEmail}</span>
                      </div>
                    </div>
                    
                    <div className="request-details">
                      <div className="detail-row">
                        <span className="detail-label">Payment Method:</span>
                        <span className="detail-value">{request.paymentMethod || 'Bank Transfer'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Bank Account:</span>
                        <span className="detail-value">
                          {request.bankDetails?.accountNumber ? 
                            `XXXX${request.bankDetails.accountNumber.slice(-4)}` : 
                            'N/A'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Bank Name:</span>
                        <span className="detail-value">{request.bankDetails?.bankName || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Submitted:</span>
                        <span className="detail-value">{formatDate(request.createdAt || request.date)}</span>
                      </div>
                    </div>
                    
                    <div className="request-actions">
                      <textarea
                        className="admin-notes-input"
                        placeholder="Add admin notes (optional)"
                        value={selectedRequest?.id === request.id ? adminNotes : ''}
                        onChange={(e) => {
                          setSelectedRequest(request);
                          setAdminNotes(e.target.value);
                        }}
                        rows="2"
                      />
                      
                      <div className="action-buttons">
                        <button
                          className="approve-btn"
                          onClick={() => handleApprove(request.id)}
                        >
                          ✅ Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleReject(request.id)}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="no-pending">
              <p>No pending withdrawal requests</p>
            </div>
          )}
        </div>

        {/* All Requests Table */}
        <div className="all-requests-section">
          <h3>All Withdrawal Requests</h3>
          
          <div className="requests-table-container">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawalRequests.map(request => (
                  <tr key={request.id}>
                    <td>
                      <span className="request-id-cell">#{request.id}</span>
                    </td>
                    <td>
                      <div className="user-cell">
                        <span className="user-name-cell">{request.userName}</span>
                        <span className="user-email-cell">{request.userEmail}</span>
                      </div>
                    </td>
                    <td>
                      <span className="amount-cell">₹{request.amount}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      <span className="date-cell">{formatDate(request.createdAt || request.date)}</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {request.status === 'pending' && (
                          <>
                            <button
                              className="table-approve-btn"
                              onClick={() => handleApprove(request.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="table-reject-btn"
                              onClick={() => handleReject(request.id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="admin-footer">
        <p className="admin-disclaimer">
          <strong>Admin Note:</strong> Approving a withdrawal will release funds to the user's bank account.
          Rejecting will return the amount to the user's real balance.
        </p>
      </div>
    </div>
  );
}

export default AdminWithdrawalPanel;