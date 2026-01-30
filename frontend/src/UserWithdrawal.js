import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserWithdrawal.css';

const UserWithdrawal = () => {
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);

  useEffect(() => {
    fetchUserBalance();
    fetchWithdrawalHistory();
  }, []);

  const fetchUserBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(response.data.user.realBalance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/withdrawals/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWithdrawalHistory(response.data.withdrawals || []);
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > balance) {
      alert('Insufficient balance');
      return;
    }

    if (!bankDetails.bankName || !bankDetails.accountNumber || 
        !bankDetails.accountHolderName || !bankDetails.ifscCode) {
      alert('Please fill all bank details');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/withdrawals/request', {
        amount: parseFloat(amount),
        ...bankDetails
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Withdrawal request submitted successfully!');
      setAmount('');
      setBankDetails({
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        ifscCode: ''
      });
      fetchUserBalance();
      fetchWithdrawalHistory();
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      alert(error.response?.data?.error || 'Failed to submit withdrawal request');
    } finally {
      setLoading(false);
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
    <div className="user-withdrawal-container">
      <div className="withdrawal-header">
        <h2><i className="fas fa-money-bill-wave"></i> Withdraw Funds</h2>
        <p>Request withdrawal to your bank account</p>
      </div>

      <div className="withdrawal-content">
        <div className="balance-info">
          <div className="balance-card">
            <h3>Available Balance</h3>
            <div className="balance-amount">₹{balance.toLocaleString()}</div>
            <p className="balance-note">Minimum withdrawal: ₹500</p>
          </div>
        </div>

        <div className="withdrawal-form-section">
          <div className="form-card">
            <h3><i className="fas fa-bank"></i> Withdrawal Request</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="500"
                  step="100"
                  required
                />
                <small>Min: ₹500, Max: ₹{balance.toLocaleString()}</small>
              </div>

              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                  placeholder="e.g., HDFC Bank, SBI"
                  required
                />
              </div>

              <div className="form-group">
                <label>Account Holder Name</label>
                <input
                  type="text"
                  value={bankDetails.accountHolderName}
                  onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                  placeholder="As per bank records"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Account Number</label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                    placeholder="Bank account number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    value={bankDetails.ifscCode}
                    onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})}
                    placeholder="e.g., HDFC0001234"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading || !amount || parseFloat(amount) > balance}
              >
                {loading ? 'Processing...' : 'Submit Withdrawal Request'}
              </button>
            </form>
          </div>
        </div>

        {withdrawalHistory.length > 0 && (
          <div className="history-section">
            <h3><i className="fas fa-history"></i> Withdrawal History</h3>
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Amount</th>
                    <th>Bank</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawalHistory.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>₹{item.amount?.toLocaleString()}</td>
                      <td>{item.bankName}</td>
                      <td>{formatDate(item.requestedAt)}</td>
                      <td>
                        <span className={`status-badge status-${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserWithdrawal;