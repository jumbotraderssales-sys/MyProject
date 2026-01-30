import React, { useState, useEffect } from 'react';
import adminApi from './services/api';
import './AdminWithdrawalPanel.css';

const AdminWithdrawalPanel = ({ userAccount }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [transactionId, setTransactionId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    
    fetchWithdrawalRequests();
  }, [filter]);

  const fetchWithdrawalRequests = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('🔍 Fetching withdrawals with filter:', filter);
    
    // Use adminApi service instead of axios directly
    const withdrawals = await adminApi.getAllWithdrawals(filter === 'all' ? '' : filter);
    
    console.log('📊 Raw API response:', withdrawals);
    console.log('🔍 First withdrawal:', withdrawals[0]);
    
    // Ensure withdrawals is an array
    if (!Array.isArray(withdrawals)) {
      console.error('❌ Invalid response format, not an array:', withdrawals);
      throw new Error('Invalid response format: Expected array of withdrawals');
    }
    
    // Map the API response to the expected format
    const requests = withdrawals.map(req => {
      console.log('📝 Processing withdrawal ID:', req.id, 'Type:', req.currency ? 'crypto' : 'bank');
      
      // Check if it's crypto format or bank format
      if (req.currency) {
        // Crypto format (from your test data)
        return {
          id: req.id?.toString() || `WD${Date.now()}`,
          userId: req.userId?.toString() || 'UNKNOWN',
          userName: req.userName || 'Unknown User',
          userEmail: req.userEmail || `user${req.userId}@example.com`,
          amount: req.amount || 0,
          status: req.status || 'pending',
          // Map crypto fields to bank fields for display
          accountNumber: req.address || 'Crypto Address',
          bankName: req.method || 'Crypto Transfer',
          accountHolderName: req.userName || 'Not provided',
          ifscCode: req.currency || 'N/A',
          requestedAt: req.requestedAt || req.date || req.approvedAt || new Date().toISOString(),
          transactionId: req.transactionId,
          processedAt: req.processedAt || req.approvedAt,
          rejectionReason: req.rejectionReason,
          // Keep original for reference
          originalData: req,
          type: 'crypto'
        };
      } else {
        // Bank format (from real user requests)
        return {
          id: req.id?.toString() || `WD${Date.now()}`,
          userId: req.userId?.toString() || 'UNKNOWN',
          userName: req.userName || 'Unknown User',
          userEmail: req.userEmail || `user${req.userId}@example.com`,
          amount: req.amount || 0,
          status: req.status || 'pending',
          accountNumber: req.accountNumber || 'Not provided',
          bankName: req.bankName || 'Not provided',
          accountHolderName: req.accountHolderName || req.userName || 'Not provided',
          ifscCode: req.ifscCode || 'Not provided',
          requestedAt: req.requestedAt || new Date().toISOString(),
          transactionId: req.transactionId,
          processedAt: req.processedAt,
          rejectionReason: req.rejectionReason,
          originalData: req,
          type: 'bank'
        };
      }
    });
    
    console.log(`✅ Processed ${requests.length} withdrawal requests`);
    setRequests(requests);
  } catch (error) {
    console.error('❌ Error fetching withdrawal requests:', error);
    setError(error.message || 'Failed to load withdrawal requests');
    setRequests([]); // Set empty array on error
  } finally {
    setLoading(false);
  }
};
  const handleApprove = async (requestId) => {
    if (!transactionId.trim()) {
      alert('Please enter transaction ID');
      return;
    }

    try {
      // Use adminApi service
      await adminApi.approveWithdrawal(requestId, transactionId);
      
      alert('Withdrawal approved successfully!');
      setTransactionId('');
      setSelectedRequest(null);
      fetchWithdrawalRequests();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      alert(error?.response?.data?.error || error?.message || 'Failed to approve withdrawal');
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      alert('Please enter rejection reason');
      return;
    }

    try {
      // Use adminApi service
      await adminApi.rejectWithdrawal(requestId, rejectionReason);
      
      alert('Withdrawal rejected successfully!');
      setRejectionReason('');
      setSelectedRequest(null);
      fetchWithdrawalRequests();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      alert(error?.response?.data?.error || error?.message || 'Failed to reject withdrawal');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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
          <button onClick={fetchWithdrawalRequests}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel-container">
      <div className="panel-header">
        <h2><i className="fas fa-user-shield"></i> Admin Withdrawal Panel</h2>
        <p>Manage user withdrawal requests</p>
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
          All
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
                    </div>
                  </td>
                  <td>₹{request.amount?.toLocaleString()}</td>
                  <td>
  <div className="account-info">
    <div><strong>{request.accountHolderName}</strong></div>
    
    {request.type === 'crypto' ? (
      <>
        <div><strong>Method:</strong> {request.bankName}</div>
        <div><strong>Address:</strong> {request.accountNumber}</div>
        <div><strong>Currency:</strong> {request.ifscCode}</div>
        {request.originalData?.date && (
          <div><small>Date: {request.originalData.date}</small></div>
        )}
      </>
    ) : (
      <>
        <div><strong>Bank:</strong> {request.bankName}</div>
        <div><strong>A/C:</strong> {request.accountNumber}</div>
        <div><strong>IFSC:</strong> {request.ifscCode}</div>
      </>
    )}
  </div>
</td>
                  <td>{formatDate(request.requestedAt)}</td>
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
  <span>Bank/Method:</span>
  <span>{selectedRequest.bankName}</span>
</div>

{selectedRequest.type === 'crypto' ? (
  <>
    <div className="detail-row">
      <span>Address:</span>
      <span>{selectedRequest.accountNumber}</span>
    </div>
    <div className="detail-row">
      <span>Currency:</span>
      <span>{selectedRequest.ifscCode}</span>
    </div>
  </>
) : (
  <>
    <div className="detail-row">
      <span>Account:</span>
      <span>{selectedRequest.accountHolderName} - {selectedRequest.accountNumber}</span>
    </div>
    <div className="detail-row">
      <span>IFSC:</span>
      <span>{selectedRequest.ifscCode}</span>
    </div>
  </>
)}
              
              {/* Show different details based on withdrawal type */}
              {selectedRequest.originalData?.address && (
                <div className="detail-row">
                  <span>Address:</span>
                  <span>{selectedRequest.originalData.address}</span>
                </div>
              )}
              
              {selectedRequest.originalData?.currency && (
                <div className="detail-row">
                  <span>Currency:</span>
                  <span>{selectedRequest.originalData.currency}</span>
                </div>
              )}
              
              {selectedRequest.originalData?.accountNumber && selectedRequest.originalData.accountNumber !== selectedRequest.originalData.address && (
                <div className="detail-row">
                  <span>Account Number:</span>
                  <span>{selectedRequest.originalData.accountNumber}</span>
                </div>
              )}
              
              {selectedRequest.originalData?.ifscCode && selectedRequest.originalData.ifscCode !== 'Not provided' && (
                <div className="detail-row">
                  <span>IFSC Code:</span>
                  <span>{selectedRequest.originalData.ifscCode}</span>
                </div>
              )}
              
              <div className="detail-row">
                <span>Requested:</span>
                <span>{formatDate(selectedRequest.requestedAt)}</span>
              </div>
              
              {selectedRequest.originalData?.date && (
                <div className="detail-row">
                  <span>Original Date:</span>
                  <span>{selectedRequest.originalData.date}</span>
                </div>
              )}
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
                      placeholder="Enter transaction ID/hash"
                    />
                  </div>
                  <button 
                    className="action-btn approve-btn"
                    onClick={() => handleApprove(selectedRequest.id)}
                  >
                    <i className="fas fa-check"></i> Approve & Mark Complete
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
                    <i className="fas fa-times"></i> Reject Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="status-info">
                <h4>Request Status: <span className={`status-${selectedRequest.status}`}>{selectedRequest.status}</span></h4>
                {selectedRequest.transactionId && (
                  <p>Transaction ID: {selectedRequest.transactionId}</p>
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