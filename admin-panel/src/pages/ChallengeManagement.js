// pages/ChallengeManagement.js - Dynamic Challenge Management with CRUD
import React, { useState, useEffect } from 'react';

const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null); // null for new, otherwise challenge object
  const [formData, setFormData] = useState({
    name: '',
    fee: '',
    paperBalance: '',
    profitTarget: '',
    dailyLossLimit: '',
    maxLossLimit: '',
    maxOrderSize: '',
    maxLeverage: '',
    autoStopLossTarget: '',
    oneTradeAtTime: true,
    reward: '',
    color: '#22c55e',
    icon: '🟢',
    description: '',
    order: 0
  });

  const baseURL = process.env.REACT_APP_API_URL || 'https://myproject1-d097.onrender.com';

  // Fetch challenges and users on mount
  useEffect(() => {
    fetchChallenges();
    fetchUsers();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/admin/challenges`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setChallenges(data.challenges);
      } else {
        console.error('Failed to fetch challenges:', data.error);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      // Assuming the endpoint returns an array directly (as in your server.js)
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Helper to get participant stats per challenge
  const getChallengeStats = (challengeName) => {
    const challengeUsers = users.filter(user => user.currentChallenge === challengeName);
    const active = challengeUsers.filter(u => u.challengeStats?.status === 'active').length;
    const passed = challengeUsers.filter(u => u.challengeStats?.status === 'passed').length;
    const failed = challengeUsers.filter(u => u.challengeStats?.status === 'failed').length;
    const totalRevenue = challengeUsers.reduce((sum, u) => {
      // fee extraction might need to be based on the challenge's current fee, but for stats we use the stored challenge's fee
      const challenge = challenges.find(c => c.name === challengeName);
      const fee = challenge ? parseInt(challenge.fee.replace(/[^0-9]/g, '')) : 0;
      return sum + fee;
    }, 0);
    return { totalUsers: challengeUsers.length, active, passed, failed, totalRevenue };
  };

  // Open modal for editing
  const handleEdit = (challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      name: challenge.name || '',
      fee: challenge.fee || '',
      paperBalance: challenge.paperBalance || '',
      profitTarget: challenge.profitTarget || '',
      dailyLossLimit: challenge.dailyLossLimit || '',
      maxLossLimit: challenge.maxLossLimit || '',
      maxOrderSize: challenge.maxOrderSize || '',
      maxLeverage: challenge.maxLeverage || '',
      autoStopLossTarget: challenge.autoStopLossTarget || '',
      oneTradeAtTime: challenge.oneTradeAtTime !== undefined ? challenge.oneTradeAtTime : true,
      reward: challenge.reward || '',
      color: challenge.color || '#22c55e',
      icon: challenge.icon || '🟢',
      description: challenge.description || '',
      order: challenge.order || 0
    });
    setShowModal(true);
  };

  // Open modal for new challenge
  const handleNew = () => {
    setEditingChallenge(null);
    setFormData({
      name: '',
      fee: '',
      paperBalance: '',
      profitTarget: '',
      dailyLossLimit: '',
      maxLossLimit: '',
      maxOrderSize: '',
      maxLeverage: '',
      autoStopLossTarget: '',
      oneTradeAtTime: true,
      reward: '',
      color: '#22c55e',
      icon: '🟢',
      description: '',
      order: 0
    });
    setShowModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Save challenge (create or update)
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = editingChallenge ? 'PUT' : 'POST';
      const url = editingChallenge
        ? `${baseURL}/api/admin/challenges/${editingChallenge._id || editingChallenge.id}`
        : `${baseURL}/api/admin/challenges`;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        // Refresh list
        await fetchChallenges();
        setShowModal(false);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save challenge');
    }
  };

  // Delete challenge
  const handleDelete = async (challenge) => {
    if (!window.confirm(`Are you sure you want to delete "${challenge.name}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/admin/challenges/${challenge._id || challenge.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        await fetchChallenges();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete challenge');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading challenge data...</p>
      </div>
    );
  }

  return (
    <div className="challenge-management">
      <div className="settings-header">
        <h1><i className="fas fa-trophy"></i> Challenge Management</h1>
        <p className="section-description">
          Create, edit, and manage trading challenges. Changes affect new purchases only; existing challenges use snapshotted rules.
        </p>
      </div>

      {/* Action buttons */}
      <div className="table-actions" style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={handleNew}>
          <i className="fas fa-plus"></i> Add New Challenge
        </button>
        <button className="btn btn-secondary" onClick={() => { fetchChallenges(); fetchUsers(); }}>
          <i className="fas fa-sync-alt"></i> Refresh Data
        </button>
      </div>

      {/* Challenge Stats Overview */}
      <div className="dashboard-stats">
        {challenges.map(challenge => {
          const stats = getChallengeStats(challenge.name);
          return (
            <div key={challenge._id || challenge.id} className="stat-card" style={{ borderLeft: `4px solid ${challenge.color}` }}>
              <div className="stat-icon" style={{ background: challenge.color }}>
                <i className="fas fa-trophy"></i>
              </div>
              <div className="stat-info">
                <h3>{challenge.name}</h3>
                <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
                <div className="stat-detail">
                  {stats.totalUsers} Participants • {stats.active} Active • {stats.passed} Passed
                </div>
              </div>
            </div>
          );
        })}
        {challenges.length === 0 && (
          <div className="no-data">No challenges configured yet.</div>
        )}
      </div>

      {/* Challenge Details List */}
      <div className="dashboard-grid">
        <div className="content-section" style={{ gridColumn: '1 / -1' }}>
          <div className="section-header">
            <h2><i className="fas fa-list-check"></i> Challenge Rules & Configuration</h2>
          </div>
          <div className="section-content">
            <div className="challenge-rules-container">
              {challenges.map(challenge => {
                const stats = getChallengeStats(challenge.name);
                return (
                  <div key={challenge._id || challenge.id} className="challenge-card" style={{ borderLeft: `4px solid ${challenge.color}` }}>
                    <div className="challenge-header">
                      <div className="challenge-title">
                        <span style={{ color: challenge.color }}>{challenge.name}</span>
                      </div>
                      <span className="challenge-badge" style={{ 
                        background: `${challenge.color}20`,
                        color: challenge.color,
                        borderColor: `${challenge.color}40`
                      }}>
                        {challenge.fee}
                      </span>
                    </div>
                    
                    <div className="challenge-stats">
                      <div className="challenge-stat-item">
                        <span className="challenge-stat-label">Paper Balance</span>
                        <span className="challenge-stat-value">₹{challenge.paperBalance?.toLocaleString()}</span>
                      </div>
                      <div className="challenge-stat-item">
                        <span className="challenge-stat-label">Profit Target</span>
                        <span className="challenge-stat-value">{challenge.profitTarget}%</span>
                      </div>
                      <div className="challenge-stat-item">
                        <span className="challenge-stat-label">Max Loss</span>
                        <span className="challenge-stat-value">{challenge.maxLossLimit}%</span>
                      </div>
                      <div className="challenge-stat-item">
                        <span className="challenge-stat-label">Daily Loss Limit</span>
                        <span className="challenge-stat-value">{challenge.dailyLossLimit}%</span>
                      </div>
                    </div>

                    <div className="challenge-rules">
                      <div className="challenge-rule">
                        <i className="fas fa-check-circle"></i>
                        <span>Max order size: {challenge.maxOrderSize}% of capital</span>
                      </div>
                      <div className="challenge-rule">
                        <i className="fas fa-check-circle"></i>
                        <span>Leverage up to {challenge.maxLeverage}x</span>
                      </div>
                      <div className="challenge-rule">
                        <i className="fas fa-check-circle"></i>
                        <span>Auto stop-loss & target: {challenge.autoStopLossTarget}%</span>
                      </div>
                      <div className="challenge-rule">
                        <i className="fas fa-check-circle"></i>
                        <span>One trade at a time: {challenge.oneTradeAtTime ? 'Yes' : 'No'}</span>
                      </div>
                    </div>

                    <div className="challenge-reward">
                      <h4><i className="fas fa-gift"></i> Reward</h4>
                      <p>{challenge.reward}</p>
                    </div>

                    {/* Edit/Delete buttons */}
                    <div className="challenge-actions" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                      <button className="btn btn-small btn-primary" onClick={() => handleEdit(challenge)}>
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(challenge)}>
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>

                    {/* Participant count */}
                    <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#94a3b8' }}>
                      <i className="fas fa-users"></i> {stats.totalUsers} participants ({stats.active} active, {stats.passed} passed, {stats.failed} failed)
                    </div>
                  </div>
                );
              })}
              {challenges.length === 0 && (
                <div className="no-data">No challenges found. Click "Add New Challenge" to create one.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2>{editingChallenge ? 'Edit Challenge' : 'Add New Challenge'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Challenge Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Fee (e.g., ₹1,000)</label>
                  <input type="text" name="fee" value={formData.fee} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Paper Balance (INR)</label>
                  <input type="number" name="paperBalance" value={formData.paperBalance} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Profit Target (%)</label>
                  <input type="number" step="0.1" name="profitTarget" value={formData.profitTarget} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Daily Loss Limit (%)</label>
                  <input type="number" step="0.1" name="dailyLossLimit" value={formData.dailyLossLimit} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Max Loss Limit (%)</label>
                  <input type="number" step="0.1" name="maxLossLimit" value={formData.maxLossLimit} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Max Order Size (% of capital)</label>
                  <input type="number" step="1" name="maxOrderSize" value={formData.maxOrderSize} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Max Leverage (x)</label>
                  <input type="number" step="1" name="maxLeverage" value={formData.maxLeverage} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Auto Stop‑Loss Target (%)</label>
                  <input type="number" step="0.1" name="autoStopLossTarget" value={formData.autoStopLossTarget} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Reward Description</label>
                  <input type="text" name="reward" value={formData.reward} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Color (hex)</label>
                  <input type="color" name="color" value={formData.color} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Icon (emoji)</label>
                  <input type="text" name="icon" value={formData.icon} onChange={handleInputChange} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2"></textarea>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>
                    <input type="checkbox" name="oneTradeAtTime" checked={formData.oneTradeAtTime} onChange={handleInputChange} />
                    One trade at a time
                  </label>
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input type="number" name="order" value={formData.order} onChange={handleInputChange} />
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .challenge-card {
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .challenge-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .challenge-title {
          font-size: 1.3rem;
          font-weight: bold;
        }
        .challenge-badge {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          border: 1px solid;
        }
        .challenge-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }
        .challenge-stat-item {
          background: rgba(0,0,0,0.2);
          padding: 8px;
          border-radius: 6px;
        }
        .challenge-stat-label {
          display: block;
          font-size: 0.8rem;
          color: #94a3b8;
        }
        .challenge-stat-value {
          font-size: 1.1rem;
          font-weight: bold;
          color: white;
        }
        .challenge-rules {
          margin-bottom: 15px;
        }
        .challenge-rule {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 0;
          color: #cbd5e1;
        }
        .challenge-reward {
          background: rgba(255,255,255,0.03);
          padding: 10px;
          border-radius: 6px;
        }
        .challenge-reward h4 {
          margin: 0 0 5px 0;
          color: #94a3b8;
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: #1e293b;
          padding: 30px;
          border-radius: 10px;
          width: 90%;
          max-width: 700px;
          max-height: 80vh;
          overflow-y: auto;
        }
        .form-grid input, .form-grid textarea, .form-grid select {
          width: 100%;
          padding: 8px;
          background: #2d3748;
          border: 1px solid #4a5568;
          border-radius: 4px;
          color: white;
        }
        .form-grid label {
          display: block;
          margin-bottom: 5px;
          color: #a0aec0;
        }
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        .btn-primary {
          background: #4f46e5;
          color: white;
        }
        .btn-secondary {
          background: #475569;
          color: white;
        }
        .btn-danger {
          background: #dc2626;
          color: white;
        }
        .btn-small {
          padding: 5px 10px;
          font-size: 0.9rem;
        }
        .loading-container {
          text-align: center;
          padding: 50px;
        }
        .loading-spinner {
          border: 4px solid rgba(255,255,255,0.1);
          border-left-color: #4f46e5;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .stat-info h3 {
          margin: 0 0 5px 0;
          font-size: 1rem;
          color: #94a3b8;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
        }
        .stat-detail {
          font-size: 0.8rem;
          color: #94a3b8;
        }
        .no-data {
          padding: 40px;
          text-align: center;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default ChallengeManagement;
