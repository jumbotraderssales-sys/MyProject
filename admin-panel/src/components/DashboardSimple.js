// src/components/DashboardSimple.js
import React, { useState, useEffect } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';

const DashboardSimple = () => {
  const { users, trades, stats, loading, connected, loadAllData } = useDatabase();
  const [apiStatus, setApiStatus] = useState('checking...');

  // Test API directly
  const testAPI = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      setApiStatus(`✅ Connected: ${data.message}`);
    } catch (error) {
      setApiStatus(`❌ Error: ${error.message}`);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading Admin Dashboard...</h2>
        <p>Checking connection to backend...</p>
        <div style={{ margin: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
        <p>API Status: {apiStatus}</p>
        <button 
          onClick={testAPI}
          style={{
            padding: '10px 20px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Connection
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      
      <div style={{
        padding: '15px',
        background: connected ? '#d4edda' : '#f8d7da',
        border: `1px solid ${connected ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '5px',
        marginBottom: '20px',
        color: connected ? '#155724' : '#721c24'
      }}>
        <strong>Status:</strong> {connected ? '✅ Connected to backend' : '❌ Not connected'}
        <br />
        <strong>API Test:</strong> {apiStatus}
        <br />
        <button 
          onClick={loadAllData}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Data
        </button>
        <button 
          onClick={testAPI}
          style={{
            marginTop: '10px',
            marginLeft: '10px',
            padding: '8px 16px',
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test API
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #3498db'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Total Users</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
            {stats.totalUsers}
          </div>
        </div>
        
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #2ecc71'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Active Trades</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
            {stats.activeTrades}
          </div>
        </div>
        
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #9b59b6'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Total Balance</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
            ${stats.totalBalance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '15px 20px',
          background: '#f8f9fa',
          borderBottom: '1px solid #dee2e6'
        }}>
          <h2 style={{ margin: 0 }}>Users ({users.length})</h2>
        </div>
        <div style={{ padding: '20px' }}>
          {users.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>ID</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Name</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Email</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '10px' }}>#{user.id}</td>
                    <td style={{ padding: '10px' }}>{user.name}</td>
                    <td style={{ padding: '10px' }}>{user.email}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>${user.balance?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              No users found
            </p>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div style={{
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '5px',
        marginTop: '30px',
        fontSize: '14px',
        color: '#666'
      }}>
        <h4>Debug Information:</h4>
        <p><strong>Backend URL:</strong> http://localhost:5000</p>
        <p><strong>Users loaded:</strong> {users.length}</p>
        <p><strong>Trades loaded:</strong> {trades.length}</p>
        <p><strong>Connection status:</strong> {connected ? 'Connected' : 'Disconnected'}</p>
        <p>
          <strong>Test endpoints:</strong>
          <br />
          <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer">
            http://localhost:5000/api/health
          </a>
          <br />
          <a href="http://localhost:5000/api/admin/dashboard" target="_blank" rel="noopener noreferrer">
            http://localhost:5000/api/admin/dashboard
          </a>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DashboardSimple;