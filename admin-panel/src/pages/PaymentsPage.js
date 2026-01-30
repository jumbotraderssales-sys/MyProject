import React, { useState, useEffect } from 'react';
import adminApi from '../services/api';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    console.log('PaymentsPage: Component mounted, loading payments...');
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, filterStatus]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      console.log('🔄 PaymentsPage: Loading payments from API...');
      const response = await adminApi.getAllPayments();
      
      console.log('💰 PaymentsPage: API response received:', response);
      console.log('💰 Response type:', typeof response);
      console.log('💰 Is array?', Array.isArray(response));
      console.log('💰 Response length:', response?.length);
      
      let paymentsData = [];
      
      // Handle different response formats
      if (response && Array.isArray(response)) {
        // Direct array response
        paymentsData = response;
        console.log('✅ PaymentsPage: Got direct array with', paymentsData.length, 'payments');
      } else if (response && response.payments && Array.isArray(response.payments)) {
        // Nested response format
        paymentsData = response.payments;
        console.log('✅ PaymentsPage: Got nested payments array with', paymentsData.length, 'payments');
      } else if (response && response.data && Array.isArray(response.data)) {
        // Another possible nested format
        paymentsData = response.data;
        console.log('✅ PaymentsPage: Got data array with', paymentsData.length, 'payments');
      } else {
        console.log('❌ PaymentsPage: Unexpected response format:', response);
      }
      
      // Log first few payments for debugging
      if (paymentsData.length > 0) {
        console.log('📄 PaymentsPage: First payment sample:', paymentsData[0]);
      } else {
        console.log('ℹ️ PaymentsPage: No payments data received');
      }
      
      // Sort by latest first
      paymentsData.sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.createdAt || a.date || 0);
        const dateB = new Date(b.submittedAt || b.createdAt || b.date || 0);
        return dateB - dateA;
      });
      
      setPayments(paymentsData);
      
      // Calculate stats
      calculateStats(paymentsData);
      
    } catch (error) {
      console.error('❌ PaymentsPage: Error loading payments:', error);
      setPayments([]);
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData) => {
    const total = paymentsData.length;
    const pending = paymentsData.filter(p => p.status === 'pending').length;
    const approved = paymentsData.filter(p => p.status === 'approved').length;
    const rejected = paymentsData.filter(p => p.status === 'rejected').length;
    
    const totalRevenue = paymentsData
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    console.log('📊 Payment Stats:', {
      total,
      pending,
      approved,
      rejected,
      totalRevenue
    });
    
    setStats({
      total,
      pending,
      approved,
      rejected,
      totalRevenue
    });
  };

  const filterPayments = () => {
    if (filterStatus === 'all') {
      setFilteredPayments(payments);
    } else {
      setFilteredPayments(payments.filter(p => p.status === filterStatus));
    }
  };

  const updatePaymentStatus = async (paymentId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this payment?`)) {
      return;
    }

    try {
      const notes = prompt(`Enter notes for ${status}:`, '');
      
      console.log(`Updating payment ${paymentId} to ${status}...`);
      const response = await adminApi.updatePaymentStatus(
        paymentId, 
        status, 
        notes || '',
        'admin'
      );
      
      console.log('✅ Payment update response:', response);
      alert(`Payment ${status} successfully!`);
      loadPayments(); // Refresh the list
      
    } catch (error) {
      console.error('❌ Error updating payment status:', error);
      alert(`Failed to update payment: ${error.response?.data?.error || error.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${parseFloat(amount).toLocaleString()}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-inactive';
    }
  };

  const getPaymentMethodIcon = (method) => {
    const methodLower = (method || '').toLowerCase();
    
    if (methodLower.includes('phone') || methodLower.includes('upi')) {
      return 'fas fa-mobile-alt';
    } else if (methodLower.includes('google')) {
      return 'fab fa-google-pay';
    } else if (methodLower.includes('paytm')) {
      return 'fab fa-paytm';
    } else if (methodLower.includes('bank')) {
      return 'fas fa-university';
    } else if (methodLower.includes('card')) {
      return 'far fa-credit-card';
    } else if (methodLower.includes('crypto')) {
      return 'fab fa-bitcoin';
    } else {
      return 'fas fa-money-bill-wave';
    }
  };

  const getPlanPaperMoney = (planName) => {
    const plans = {
      'plan a': '₹100,000',
      'plan b': '₹250,000', 
      'plan c': '₹500,000'
    };
    return plans[(planName || '').toLowerCase()] || 'N/A';
  };

  if (loading) {
    return (
      <div className="payments-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading payments...</p>
          <button className="btn btn-primary mt-2" onClick={loadPayments}>
            <i className="fas fa-sync-alt"></i> Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payments-page">
      <div className="page-header">
        <h1>Payment Management</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={loadPayments}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Payments</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-detail">
            All time payments
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Pending Review</div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-detail">
            Awaiting approval
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Approved</div>
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-detail">
            Successful payments
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
          <div className="stat-detail">
            From approved payments
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setFilterStatus('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="content-section">
        <div className="section-content">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>User</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Paper Money</th>
                <th>Method</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map(payment => (
                  <tr key={payment.id || payment._id || Math.random()}>
                    <td>#{payment.id ? payment.id.substring(0, 8) : payment.transactionId || 'N/A'}</td>
                    <td>
                      <div className="user-info">
                        <div className="user-name">{payment.userName || payment.user || 'Unknown'}</div>
                        <div className="user-email">{payment.userEmail || payment.email || ''}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{payment.planName || payment.plan || 'N/A'}</strong>
                      </div>
                    </td>
                    <td>
                      <strong>{formatCurrency(payment.amount)}</strong>
                    </td>
                    <td>
                      <span className="text-success">
                        <strong>{getPlanPaperMoney(payment.planName)}</strong>
                      </span>
                    </td>
                    <td>
                      <div className="payment-method">
                        <i className={getPaymentMethodIcon(payment.paymentMethod)}></i>
                        <span>{payment.paymentMethod || payment.method || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(payment.status)}`}>
                        {(payment.status || 'pending').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {formatDate(payment.submittedAt || payment.createdAt || payment.date)}
                      {payment.processedAt && (
                        <div className="processed-date">
                          <small>Processed: {formatDate(payment.processedAt)}</small>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {payment.status === 'pending' && (
                          <>
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => updatePaymentStatus(payment.id, 'approved')}
                              title="Approve Payment"
                            >
                              <i className="fas fa-check"></i> Approve
                            </button>
                            <button 
                              className="btn btn-sm btn-danger ml-1"
                              onClick={() => updatePaymentStatus(payment.id, 'rejected')}
                              title="Reject Payment"
                            >
                              <i className="fas fa-times"></i> Reject
                            </button>
                          </>
                        )}
                        <button 
                          className="btn btn-sm btn-secondary ml-1"
                          title="View Details"
                          onClick={() => {
                            const details = `
Payment Details:
----------------
ID: ${payment.id || 'N/A'}
Transaction ID: ${payment.transactionId || 'N/A'}
User: ${payment.userName} (${payment.userEmail})
Plan: ${payment.planName}
Amount: ${formatCurrency(payment.amount)}
Paper Money: ${getPlanPaperMoney(payment.planName)}
Payment Method: ${payment.paymentMethod}
Status: ${payment.status}
Submitted: ${formatDate(payment.submittedAt)}
Processed: ${payment.processedAt ? formatDate(payment.processedAt) : 'Not processed'}
Processed By: ${payment.processedBy || 'N/A'}
Notes: ${payment.notes || 'None'}
Screenshot: ${payment.screenshotUrl || 'None'}
                            `;
                            alert(details);
                          }}
                        >
                          <i className="fas fa-eye"></i> Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    <i className="fas fa-credit-card"></i>
                    <p>No payments found {payments.length > 0 ? '(filtered out)' : ''}</p>
                    {payments.length === 0 && (
                      <div className="no-data-actions">
                        <button className="btn btn-primary mt-2" onClick={loadPayments}>
                          <i className="fas fa-sync-alt"></i> Try Loading Again
                        </button>
                        <button className="btn btn-secondary mt-2 ml-2" onClick={() => {
                          console.log('Current payments state:', payments);
                          console.log('Filtered payments:', filteredPayments);
                          console.log('Filter status:', filterStatus);
                          // Test API directly
                          fetch('http://localhost:3001/api/admin/payments')
                            .then(res => res.json())
                            .then(data => console.log('Direct API response:', data))
                            .catch(err => console.error('Direct API error:', err));
                        }}>
                          Debug Info
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;