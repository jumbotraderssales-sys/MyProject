// pages/ChallengeManagement.js - Challenge Management Page
import React, { useState, useEffect } from 'react';

const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [error, setError] = useState('');

  // Challenge configurations from backend
  const challengeConfigs = {
    "🚀 Beginner Challenge": {
      id: 1,
      fee: "₹1,000",
      paperBalance: 20000,
      profitTarget: 10,
      dailyLossLimit: 4,
      maxLossLimit: 10,
      maxOrderSize: 20,
      maxLeverage: 10,
      autoStopLossTarget: 10,
      oneTradeAtTime: true,
      reward: "Fee Refund + Skill Reward (20% of paper profit)",
      color: "#22c55e"
    },
    "🟡 Intermediate Challenge": {
      id: 2,
      fee: "₹2,500",
      paperBalance: 50000,
      profitTarget: 10,
      dailyLossLimit: 4,
      maxLossLimit: 10,
      maxOrderSize: 20,
      maxLeverage: 10,
      autoStopLossTarget: 10,
      oneTradeAtTime: true,
      reward: "Fee Refund + Skill Reward (20% of paper profit)",
      color: "#eab308"
    },
    "🔴 PRO Challenge": {
      id: 3,
      fee: "₹5,000",
      paperBalance: 100000,
      profitTarget: 10,
      dailyLossLimit: 4,
      maxLossLimit: 10,
      maxOrderSize: 20,
      maxLeverage: 10,
      autoStopLossTarget: 10,
      oneTradeAtTime: true,
      reward: "Fee Refund + Skill Reward (20% of paper profit)",
      color: "#ef4444"
    }
  };

  const baseURL = process.env.REACT_APP_API_URL || 'https://myproject1-d097.onrender.com';

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${baseURL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized. Please login again.');
        }
        throw new Error('Failed to fetch users');
      }

      const users = await response.json();
      
      // Extract challenge data from users
      const challengeUsers = users.filter(user => user.currentChallenge && user.currentChallenge !== 'No Challenge');
      
      // Group by challenge type
      const challengeStats = {};
      Object.keys(challengeConfigs).forEach(challengeName => {
        const usersInChallenge = challengeUsers.filter(user => user.currentChallenge === challengeName);
        
        const active = usersInChallenge.filter(user => user.challengeStats?.status === 'active').length;
        const passed = usersInChallenge.filter(user => user.challengeStats?.status === 'passed').length;
        const failed = usersInChallenge.filter(user => user.challengeStats?.status === 'failed').length;
        
        challengeStats[challengeName] = {
          totalUsers: usersInChallenge.length,
          active,
          passed,
          failed,
          totalRevenue: usersInChallenge.length * parseInt(challengeConfigs[challengeName].fee.replace(/[^0-9]/g, '')),
          config: challengeConfigs[challengeName]
        };
      });
      
      setChallenges(challengeStats);
      setError('');
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setError(error.message);
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div className="error-container">
        <p><i className="fas fa-exclamation-triangle"></i> {error}</p>
        <button className="btn btn-primary" onClick={fetchChallenges}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="challenge-management">
      <div className="settings-header">
        <h1><i className="fas fa-trophy"></i> Challenge Management</h1>
        <p className="section-description">
          Manage trading challenges and monitor participant performance
        </p>
      </div>

      {/* Challenge Stats Overview */}
      <div className="dashboard-stats">
        {Object.entries(challenges).map(([name, stats]) => (
          <div key={name} className="stat-card" style={{ borderLeft: `4px solid ${stats.config.color}` }}>
            <div className="stat-icon" style={{ background: stats.config.color }}>
              <i className="fas fa-trophy"></i>
            </div>
            <div className="stat-info">
              <h3>{name}</h3>
              <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
              <div className="stat-detail">
                {stats.totalUsers} Participants • {stats.active} Active • {stats.passed} Passed
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Challenge Details */}
      <div className="dashboard-grid">
        <div className="content-section">
          <div className="section-header">
            <h2><i className="fas fa-list-check"></i> Challenge Rules & Configuration</h2>
          </div>
          <div className="section-content">
            <div className="challenge-rules-container">
              {Object.entries(challengeConfigs).map(([name, config]) => (
                <div key={name} className="challenge-card" style={{ borderLeft: `4px solid ${config.color}` }}>
                  <div className="challenge-header">
                    <div className="challenge-title">
                      <span style={{ color: config.color }}>{name}</span>
                    </div>
                    <span className="challenge-badge" style={{ 
                      background: `${config.color}20`,
                      color: config.color,
                      borderColor: `${config.color}40`
                    }}>
                      {config.fee}
                    </span>
                  </div>
                  
                  <div className="challenge-stats">
                    <div className="challenge-stat-item">
                      <span className="challenge-stat-label">Paper Balance</span>
                      <span className="challenge-stat-value">₹{config.paperBalance.toLocaleString()}</span>
                    </div>
                    <div className="challenge-stat-item">
                      <span className="challenge-stat-label">Profit Target</span>
                      <span className="challenge-stat-value">{config.profitTarget}%</span>
                    </div>
                    <div className="challenge-stat-item">
                      <span className="challenge-stat-label">Max Loss</span>
                      <span className="challenge-stat-value">{config.maxLossLimit}%</span>
                    </div>
                    <div className="challenge-stat-item">
                      <span className="challenge-stat-label">Daily Loss Limit</span>
                      <span className="challenge-stat-value">{config.dailyLossLimit}%</span>
                    </div>
                  </div>

                  <div className="challenge-rules">
                    <div className="challenge-rule">
                      <i className="fas fa-check-circle"></i>
                      <span>Max order size: {config.maxOrderSize}% of capital</span>
                    </div>
                    <div className="challenge-rule">
                      <i className="fas fa-check-circle"></i>
                      <span>Leverage up to {config.maxLeverage}x</span>
                    </div>
                    <div className="challenge-rule">
                      <i className="fas fa-check-circle"></i>
                      <span>Auto stop-loss & target: {config.autoStopLossTarget}%</span>
                    </div>
                    <div className="challenge-rule">
                      <i className="fas fa-check-circle"></i>
                      <span>One trade at a time</span>
                    </div>
                  </div>

                  <div className="challenge-reward">
                    <h4><i className="fas fa-gift"></i> Reward</h4>
                    <p>{config.reward}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Challenge Participants */}
        <div className="content-section">
          <div className="section-header">
            <h2><i className="fas fa-users"></i> Active Challenge Participants</h2>
          </div>
          <div className="section-content">
            <div className="info-box">
              <h3><i className="fas fa-info-circle"></i> How Challenges Work</h3>
              <ol className="info-list">
                <li>Users purchase a challenge to get paper trading balance</li>
                <li>They must achieve profit target without exceeding loss limits</li>
                <li>Success leads to fee refund + skill reward (20% of paper profit)</li>
                <li>All trades follow challenge rules (leverage limits, position sizing)</li>
                <li>Real money withdrawals only available after challenge completion</li>
              </ol>
            </div>
            
            <div className="table-actions">
              <button className="btn btn-primary" onClick={fetchChallenges}>
                <i className="fas fa-sync-alt"></i> Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeManagement;
