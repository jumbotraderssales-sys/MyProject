import React, { useState, useEffect } from 'react';
import adminApi from '../services/api';

const UserWalletModal = ({ user, onClose, onUpdate }) => {
  const [action, setAction] = useState('add'); // 'add', 'deduct', or 'reset'
  const [type, setType] = useState('paper'); // 'paper' or 'real'
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Reset form when modal opens
    setAmount('');
    setNotes('');
    setMessage({ type: '', text: '' });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let response;
      
      if (action === 'add') {
        response = await adminApi.addFundsToWallet(user.id, amount, type, notes);
      } else if (action === 'deduct') {
        response = await adminApi.deductFundsFromWallet(user.id, amount, type, notes);
      } else if (action === 'reset') {
        // For reset, we deduct all balance
        const resetAmount = type === 'paper' ? user.paperBalance : user.realBalance;
        response = await adminApi.deductFundsFromWallet(user.id, resetAmount, type, 'Balance reset by admin');
      }

      setMessage({ 
        type: 'success', 
        text: response?.message || `${action === 'add' ? 'Added' : action === 'deduct' ? 'Deducted' : 'Reset'} successfully!` 
      });
      
      // Clear form
      setAmount('');
      setNotes('');
      
      // Notify parent to refresh user data
      if (onUpdate) {
        setTimeout(() => {
          onUpdate();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error updating wallet:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || error.message || 'Failed to update wallet' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate current balance for display
  const getCurrentBalance = () => {
    return type === 'paper' ? (user.paperBalance || 0) : (user.realBalance || 0);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Manage Wallet - {user.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Balance Display */}
          <div className="balance-display">
            <div className="balance-item">
              <span className="balance-label">Paper Balance:</span>
              <span className="balance-value">₹{(user.paperBalance || 0).toLocaleString()}</span>
            </div>
            <div className="balance-item">
              <span className="balance-label">Real Balance:</span>
              <span className="balance-value">₹{(user.realBalance || 0).toLocaleString()}</span>
            </div>
            <div className="balance-item">
              <span className="balance-label">Total Balance:</span>
              <span className="balance-value">₹{((user.paperBalance || 0) + (user.realBalance || 0)).toLocaleString()}</span>
            </div>
          </div>

          {/* Action Selector */}
          <div className="action-selector">
            <div className="action-buttons">
              <button 
                className={`action-btn add ${action === 'add' ? 'active' : ''}`}
                onClick={() => setAction('add')}
              >
                Add Funds
              </button>
              <button 
                className={`action-btn deduct ${action === 'deduct' ? 'active' : ''}`}
                onClick={() => setAction('deduct')}
              >
                Deduct Funds
              </button>
              <button 
                className={`action-btn reset ${action === 'reset' ? 'active' : ''}`}
                onClick={() => setAction('reset')}
              >
                Reset Balance
              </button>
            </div>
          </div>

          {/* Type Selector */}
          <div className="type-selector">
            <div className="type-buttons">
              <button 
                className={`type-btn ${type === 'paper' ? 'active' : ''}`}
                onClick={() => setType('paper')}
              >
                Paper Balance
              </button>
              <button 
                className={`type-btn ${type === 'real' ? 'active' : ''}`}
                onClick={() => setType('real')}
              >
                Real Balance
              </button>
            </div>
          </div>

          {/* Current Selection Info */}
          <div className="selection-info">
            <p>
              <strong>Current Selection:</strong> {action === 'add' ? 'Add to' : action === 'deduct' ? 'Deduct from' : 'Reset'} {type === 'paper' ? 'Paper Balance' : 'Real Balance'}
              {action === 'reset' && ` (Current: ₹${getCurrentBalance().toLocaleString()})`}
            </p>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.type === 'success' ? '✅' : '❌'} {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {action !== 'reset' && (
              <div className="form-group">
                <label htmlFor="amount">Amount (₹)</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  required={action !== 'reset'}
                />
                <span className="hint">Enter the amount to {action === 'add' ? 'add' : 'deduct'}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note for this transaction..."
                rows="3"
              />
            </div>

            {/* Action Buttons */}
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`btn ${action === 'add' ? 'btn-success' : action === 'deduct' ? 'btn-danger' : 'btn-warning'}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  <>
                    {action === 'add' && <i className="fas fa-plus"></i>}
                    {action === 'deduct' && <i className="fas fa-minus"></i>}
                    {action === 'reset' && <i className="fas fa-redo"></i>}
                    {' '}
                    {action === 'add' ? 'Add Funds' : action === 'deduct' ? 'Deduct Funds' : 'Reset Balance'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserWalletModal;