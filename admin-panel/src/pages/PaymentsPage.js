import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../services/api';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, totalRevenue: 0 });

  const getPaymentId = (p) => p.id || p._id || p.transactionId;

  const calculateStats = useCallback((paymentsData) => {
    const total = paymentsData.length;
    const pending = paymentsData.filter(p => p.status === 'pending').length;
    const approved = paymentsData.filter(p => p.status === 'approved').length;
    const rejected = paymentsData.filter(p => p.status === 'rejected').length;
    const totalRevenue = paymentsData.filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    setStats({ total, pending, approved, rejected, totalRevenue });
  }, []);

  const filterPayments = useCallback(() => {
    if (filterStatus === 'all') setFilteredPayments(payments);
    else setFilteredPayments(payments.filter(p => p.status === filterStatus));
  }, [payments, filterStatus]);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllPayments();

      let paymentsData = [];
      if (Array.isArray(response)) paymentsData = response;
      else if (response?.payments) paymentsData = response.payments;
      else if (response?.data) paymentsData = response.data;

      paymentsData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setPayments(paymentsData);
      calculateStats(paymentsData);
    } catch (error) {
      console.error('PaymentsPage error:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    filterPayments();
  }, [filterPayments]);

  const updatePaymentStatus = async (paymentId, status) => {
    await adminApi.updatePaymentStatus(paymentId, status, '', 'admin');
    loadPayments();
  };

  if (loading) return <p>Loading payments...</p>;

  return (
    <div className="payments-page">
      <h1>Payment Management</h1>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Plan</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map(payment => {
            const pid = getPaymentId(payment);

            return (
              <tr key={pid}>
                <td>#{String(pid).substring(0, 8)}</td>
                <td>{payment.userName || payment.user || 'Unknown'}</td>
                <td>{payment.planName || payment.plan || 'N/A'}</td>
                <td>₹{payment.amount || 0}</td>
                <td>{payment.paymentMethod || 'N/A'}</td>
                <td>{payment.status}</td>
                <td>{payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'}</td>
                <td>
                  {payment.status === 'pending' && (
                    <>
                      <button onClick={() => updatePaymentStatus(pid, 'approved')}>Approve</button>
                      <button onClick={() => updatePaymentStatus(pid, 'rejected')}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsPage;
