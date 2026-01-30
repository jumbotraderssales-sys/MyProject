import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';

const WalletManager = ({ userId }) => {
  const { updateBalance } = useDatabase();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('deposit');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    updateBalance(userId, parseFloat(amount), type, note);
    setAmount('');
    setNote('');
    alert('Balance updated successfully!');
  };

  return (
    <div className="wallet-manager">
      <h3>Wallet Management</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
        </div>
        <div className="form-group">
          <label>Note (Optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for this adjustment"
            rows="3"
          />
        </div>
        <button type="submit" className="btn btn-primary">Update Balance</button>
      </form>
    </div>
  );
};

export default WalletManager;