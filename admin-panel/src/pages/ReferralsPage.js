import React, { useState, useEffect } from 'react';

const ReferralsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const baseURL = process.env.REACT_APP_API_URL || 'https://myproject1-d097.onrender.com';

      const res = await fetch(`${baseURL}/api/admin/referrals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch referral data');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const handleApprove = async (userId) => {
    if (!window.confirm('Approve referral reward for this user?')) return;
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const baseURL = process.env.REACT_APP_API_URL || 'https://myproject1-d097.onrender.com';

      const res = await fetch(`${baseURL}/api/admin/referrals/approve/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Reward approved successfully');
        fetchReferralData(); // refresh list
      } else {
        alert(data.error || 'Approval failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="loading-container">Loading referrals...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;

  return (
    <div className="referrals-page">
      <div className="page-header">
        <h1>Referral Management</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={fetchReferralData} disabled={loading}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      <div className="referrals-stats">
        <div className="stat-card">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {users.filter(u => u.rewardAwarded).length}
          </div>
          <div className="stat-label">Rewards Given</div>
        </div>
      </div>

      <div className="referrals-table-container">
        <table className="referrals-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Referral Code</th>
              <th>Referral Count</th>
              <th>Reward Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><code>{user.referralCode}</code></td>
                <td>{user.referralCount}</td>
                <td>
                  {user.rewardAwarded ? (
                    <span className="badge success">Awarded</span>
                  ) : user.referralCount >= 20 ? ( // using default target 20; we could fetch settings
                    <span className="badge warning">Pending</span>
                  ) : (
                    <span className="badge">Not reached</span>
                  )}
                </td>
                <td>
                  {!user.rewardAwarded && user.referralCount >= 20 && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleApprove(user.id)}
                      disabled={processing}
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReferralsPage;
