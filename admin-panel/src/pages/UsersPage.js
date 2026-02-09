import React, { useState, useEffect } from 'react';
import adminApi from '../services/api';
import UserWalletModal from '../components/UserWalletModal';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers();

      let usersData = [];
      if (Array.isArray(response)) usersData = response;
      else if (response?.users) usersData = response.users;
      else if (response?.data) usersData = response.data;

      setUsers(usersData);
    } catch (error) {
      console.error('UsersPage error:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserId = (user) => user.id || user._id;

  const getFilteredUsers = () => {
    return users.filter(user => {
      const userSearchable = [
        user.name || '',
        user.email || '',
        getUserId(user) || '',
        user.userName || ''
      ].join(' ').toLowerCase();

      const searchMatch =
        !searchTerm || userSearchable.includes(searchTerm.toLowerCase());

      const userStatus = user.accountStatus || user.status || 'inactive';
      const statusMatch =
        filterStatus === 'all' ||
        (filterStatus === 'active' && userStatus === 'active') ||
        (filterStatus === 'inactive' && userStatus === 'inactive');

      return searchMatch && statusMatch;
    });
  };

  const getStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => (u.accountStatus || u.status) === 'active').length;
    const usersWithPlan = users.filter(u => u.currentPlan).length;

    const totalPaperBalance = users.reduce((s, u) => s + (u.paperBalance || 0), 0);
    const totalRealBalance = users.reduce((s, u) => s + (u.realBalance || 0), 0);

    return {
      totalUsers,
      activeUsers,
      usersWithPlan,
      totalPaperBalance,
      totalRealBalance
    };
  };

  const stats = getStats();
  const filteredUsers = getFilteredUsers();

  const updateUserStatus = async (userId, newStatus) => {
    const updatedUsers = users.map(user =>
      getUserId(user) === userId ? { ...user, accountStatus: newStatus } : user
    );
    setUsers(updatedUsers);
  };

  const getUserIdString = (id) => {
    if (!id) return 'N/A';
    const str = String(id);
    return `#${str.substring(0, 8)}`;
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div className="users-page">
      <h1>User Management</h1>

      <table className="data-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Plan</th>
            <th>Paper Balance</th>
            <th>Real Balance</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => {
            const uid = getUserId(user);

            return (
              <tr key={uid}>
                <td>{getUserIdString(uid)}</td>
                <td>{user.name || user.userName || 'N/A'}</td>
                <td>{user.email || 'N/A'}</td>
                <td>{user.currentPlan || 'No Plan'}</td>
                <td>₹{(user.paperBalance || 0).toLocaleString()}</td>
                <td>₹{(user.realBalance || 0).toLocaleString()}</td>
                <td>{user.accountStatus || user.status || 'inactive'}</td>
                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                  {(user.accountStatus || user.status) === 'active' ? (
                    <button onClick={() => updateUserStatus(uid, 'inactive')}>Deactivate</button>
                  ) : (
                    <button onClick={() => updateUserStatus(uid, 'active')}>Activate</button>
                  )}
                  <button onClick={() => { setSelectedUser(user); setShowWalletModal(true); }}>
                    Wallet
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showWalletModal && selectedUser && (
        <UserWalletModal
          user={selectedUser}
          onClose={() => {
            setShowWalletModal(false);
            setSelectedUser(null);
          }}
          onUpdate={loadUsers}
        />
      )}
    </div>
  );
};

export default UsersPage;
