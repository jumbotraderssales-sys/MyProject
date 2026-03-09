import React, { useState, useEffect, useCallback } from 'react';
import './AdminWithdrawalPanel.css';

const AdminWithdrawalPanel = ({ userAccount }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [transactionId, setTransactionId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Load withdrawal requests from localStorage
  const loadWithdrawalRequests = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading withdrawals from localStorage with filter:', filter);
      
      // Get withdrawal requests from localStorage
      const savedRequests = localStorage.getItem('withdrawalRequests');
      let withdrawalRequests = [];
      
      if (savedRequests) {
        withdrawalRequests = JSON.parse(savedRequests);
        console.log(`✅ Found ${withdrawalRequests.length} withdrawal requests in localStorage`);
      } else {
        console.log('ℹ️ No withdrawal requests found in localStorage');
      }
      
      // Format the requests for display
      const formattedRequests = withdrawalRequests.map(req => {
        return {
          id: req.id,
          userId: req.userId || 'UNKNOWN',
          userName: req.userName || 'Unknown User',
          userEmail: req.userEmail || 'No email',
          amount: req.amount || 0,
          status: req.status || 'pending',
          accountHolderName: req.bankDetails?.accountHolderName || req.userName || 'Not provided',
          bankName: req.bankDetails?.bankName || 'Not provided',
          accountNumber: req.bankDetails?.accountNumber || 'Not provided',
          ifscCode: req.bankDetails?.ifscCode || 'Not provided',
          upiId: req.bankDetails?.upiId || '',
          isReward: req.isReward || false,
          requestedAt: req.date || new Date().toLocaleString(),
          transactionId: req.transactionId,
          processedAt: req.processedAt,
          rejectionReason: req.rejectionReason,
          type: 'bank'
        };
      });
      
      // Filter based on selected filter
      let filteredRequests = formattedRequests;
      if (filter !== 'all') {
        filteredRequests = formattedRequests.filter(req => req.status === filter);
      }
      
      // Sort by date (newest first)
      filteredRequests.sort((a, b) => {
        const dateA = new Date(a.requestedAt);
        const dateB = new Date(b.requestedAt);
        return dateB - dateA;
      });
      
      console.log(`📊 Displaying ${filteredRequests.length} ${filter} requests`);
      setRequests(filteredRequests);
    } catch (error) {
      console.error('❌ Error loading withdrawal requests:', error);
      setError(error.message || 'Failed to load withdrawal requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Load requests on mount and when filter changes
  useEffect(() => {
    loadWithdrawalRequests();
    
    // Listen for storage events (in case another tab updates withdrawals)
    const handleStorageChange = (e) => {
      if (e.key === 'withdrawalRequests') {
        loadWithdrawalRequests();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadWithdrawalRequests]);

  const handleApprove = async (requestId) => {
    if (!transactionId.trim()) {
      alert('Please enter transaction ID');
      return;
    }

    try {
      // Get current requests from localStorage
      const savedRequests = localStorage.getItem('withdrawalRequests');
      let withdrawalRequests = savedRequests ? JSON.parse(savedRequests) : [];
      
      // Find and update the request
      const updatedRequests = withdrawalRequests.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'approved',
            transactionId: transactionId,
            processedAt: new Date().toLocaleString(),
            approvedBy: 'Admin'
          };
        }
        return req;
      });
      
      // Save back to localStorage
      localStorage.setItem('withdrawalRequests', JSON.stringify(updatedRequests));
      
      // Update user data if this was a reward withdrawal
      const approvedRequest = updatedRequests.find(req => req.id === requestId);
      if (approvedRequest && approvedRequest.isReward) {
        const userDataStr = localStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          if (userData.id === approvedRequest.userId) {
            const updatedUserData = {
              ...userData,
              realBalance: (userData.realBalance || 0) - approvedRequest.amount,
              challengeStats: {
                ...userData.challengeStats,
                withdrawalCompleted: true,
                withdrawalDate: new Date().toISOString(),
                withdrawalPending: false,
                withdrawalRequestId: null
              }
            };
            localStorage.setItem('userData', JSON.stringify(updatedUserData));
          }
        }
      }
      
      alert('✅ Withdrawal approved successfully!');
      setTransactionId('');
      setSelectedRequest(null);
      loadWithdrawalRequests(); // Refresh the list
      
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      alert('Failed to approve withdrawal');
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      alert('Please enter rejection reason');
      return;
    }

    try {
      // Get current requests from localStorage
      const savedRequests = localStorage.getItem('withdrawalRequests');
      let withdrawalRequests = savedRequests ? JSON.parse(savedRequests) : [];
      
      // Find and update the request
      const updatedRequests = withdrawalRequests.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'rejected',
            rejectionReason: rejectionReason,
            processedAt: new Date().toLocaleString(),
            rejectedBy: 'Admin'
          };
        }
        return req;
      });
      
      // Save back to localStorage
      localStorage.setItem('withdrawalRequests', JSON.stringify(updatedRequests));
      
      // Update user data if this was a reward withdrawal (clear pending flag)
      const rejectedRequest = updatedRequests.find(req => req.id === requestId);
      if (rejectedRequest && rejectedRequest.isReward) {
        const userDataStr = localStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          if (userData.id === rejectedRequest.userId) {
            const updatedUserData = {
              ...userData,
              challengeStats: {
                ...userData.challengeStats,
                withdrawalPending: false,
                withdrawalRequestId: null
              }
            };
            localStorage.setItem('userData', JSON.stringify(updatedUserData));
          }
        }
      }
      
      alert('❌ Withdrawal rejected successfully!');
      setRejectionReason('');
      setSelectedRequest(null);
      loadWithdrawalRequests(); // Refresh the list
      
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      alert('Failed to reject withdrawal');
    }
  };

  const formatDate = (dateString) => {
    try {
      return dateString || 'N/A';
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="admin-panel-container">
        <div className="loading">Loading withdrawal requests...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="admin-panel-container">
        <div className="error-container">
          <h3>Error Loading Withdrawals</h3>
          <p>{error}</p>
          <button onClick={loadWithdrawalRequests}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel-container">
      <div className="panel-header">
        <h2><i className="fas fa-user-shield"></i> Admin Withdrawal Panel</h2>
        <p>Manage user withdrawal requests</p>
        <button 
          onClick={loadWithdrawalRequests}
          style={{
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            marginTop: '10px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({requests.filter(r => r.status === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button 
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({requests.length})
        </button>
      </div>

      <div className="requests-table">
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Payment Details</th>
              <th>Requested On</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  No withdrawal requests found
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id}>
                  <td>#{request.id}</td>
                  <td>
                    <div className="user-info">
                      <strong>{request.userName}</strong>
                      <small>{request.userEmail}</small>
                      {request.isReward && (
                        <span style={{color: '#10b981', fontSize: '11px'}}>🏆 Reward</span>
                      )}
                    </div>
                  </td>
                  <td>₹{request.amount?.toLocaleString()}</td>
                  <td>
                    <div className="account-info">
                      <div><strong>{request.accountHolderName}</strong></div>
                      <div><strong>Bank:</strong> {request.bankName}</div>
                      <div><strong>A/C:</strong> {request.accountNumber}</div>
                      <div><strong>IFSC:</strong> {request.ifscCode}</div>
                      {request.upiId && <div><strong>UPI:</strong> {request.upiId}</div>}
                    </div>
                  </td>
                  <td>{request.requestedAt}</td>
                  <td>
                    <span className={`status-badge status-${request.status}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    {request.status === 'pending' && (
                      <button 
                        className="action-btn view-btn"
                        onClick={() => setSelectedRequest(request)}
                      >
                        Process
                      </button>
                    )}
                    {request.status !== 'pending' && (
                      <button 
                        className="action-btn view-btn"
                        onClick={() => setSelectedRequest(request)}
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Process Modal */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Process Withdrawal Request #{selectedRequest.id}</h3>
            
            <div className="request-details">
              <div className="detail-row">
                <span>User:</span>
                <span>{selectedRequest.userName} ({selectedRequest.userEmail})</span>
              </div>
              <div className="detail-row">
                <span>Amount:</span>
                <span style={{fontWeight: 'bold', color: '#f59e0b'}}>₹{selectedRequest.amount?.toLocaleString()}</span>
              </div>
              {selectedRequest.isReward && (
                <div className="detail-row">
                  <span>Type:</span>
                  <span style={{color: '#10b981'}}>🏆 Challenge Reward</span>
                </div>
              )}
              <div className="detail-row">
                <span>Bank:</span>
                <span>{selectedRequest.bankName}</span>
              </div>
              <div className="detail-row">
                <span>Account Holder:</span>
                <span>{selectedRequest.accountHolderName}</span>
              </div>
              <div className="detail-row">
                <span>Account Number:</span>
                <span>{selectedRequest.accountNumber}</span>
              </div>
              <div className="detail-row">
                <span>IFSC Code:</span>
                <span>{selectedRequest.ifscCode}</span>
              </div>
              {selectedRequest.upiId && (
                <div className="detail-row">
                  <span>UPI ID:</span>
                  <span>{selectedRequest.upiId}</span>
                </div>
              )}
              <div className="detail-row">
                <span>Requested:</span>
                <span>{selectedRequest.requestedAt}</span>
              </div>
            </div>

            {selectedRequest.status === 'pending' ? (
              <div className="action-section">
                <div className="approve-section">
                  <h4>Approve & Release Funds</h4>
                  <div className="form-group">
                    <label>Transaction ID (after manual transfer):</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction ID"
                    />
                  </div>
                  <button 
                    className="action-btn approve-btn"
                    onClick={() => handleApprove(selectedRequest.id)}
                  >
                    ✅ Approve & Mark Complete
                  </button>
                </div>

                <div className="reject-section">
                  <h4>Reject Request</h4>
                  <div className="form-group">
                    <label>Rejection Reason:</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection"
                      rows="3"
                    />
                  </div>
                  <button 
                    className="action-btn reject-btn"
                    onClick={() => handleReject(selectedRequest.id)}
                  >
                    ❌ Reject Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="status-info">
                <h4>Request Status: <span className={`status-${selectedRequest.status}`}>{selectedRequest.status}</span></h4>
                {selectedRequest.transactionId && (
                  <p>Transaction ID: {selectedRequest.transactionId}</p>
                )}
                {selectedRequest.rejectionReason && (
                  <p>Reason: {selectedRequest.rejectionReason}</p>
                )}
                {selectedRequest.processedAt && (
                  <p>Processed: {selectedRequest.processedAt}</p>
                )}
              </div>
            )}

            <button 
              className="close-modal-btn"
              onClick={() => {
                setSelectedRequest(null);
                setTransactionId('');
                setRejectionReason('');
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawalPanel;
