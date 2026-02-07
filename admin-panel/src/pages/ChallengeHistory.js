import React, { useState, useEffect } from 'react';
import './ChallengeHistory.css';

const ChallengeHistory = () => {
  const [challengeHistory, setChallengeHistory] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [summary, setSummary] = useState({
    beginner: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0 },
    intermediate: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0 },
    pro: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0 },
    overall: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedChallengeType, setSelectedChallengeType] = useState('all');

  useEffect(() => {
    fetchChallengeHistory();
  }, []);

  const fetchChallengeHistory = async () => {
    try {
      setLoading(true);
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      // Fetch users data
      const response = await fetch(`${baseURL}/api/admin/users`);
      const users = await response.json();
      
      // Process challenge history
      const history = [];
      const userStatsMap = {};
      const summaryData = {
        beginner: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0 },
        intermediate: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0 },
        pro: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0 },
        overall: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0 }
      };

      // Process each user's challenge history
      users.forEach(user => {
        if (user.currentChallenge && user.currentChallenge !== 'No Challenge') {
          const challengeType = getChallengeType(user.currentChallenge);
          const status = user.challengeStats?.status || 'active';
          const purchaseDate = user.challengeStats?.startDate || user.createdAt;
          const profit = user.challengeStats?.currentProfit || 0;
          const loss = user.challengeStats?.totalLoss || 0;
          const fee = getChallengeFee(user.currentChallenge);
          
          // Add to challenge history
          history.push({
            id: user.id,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            challengeName: user.currentChallenge,
            challengeType,
            purchaseDate,
            status,
            profit,
            loss,
            fee,
            tradesCount: user.challengeStats?.tradesCount || 0,
            winRate: user.challengeStats?.winRate || 0,
            lastUpdated: user.updatedAt
          });

          // Update summary statistics
          summaryData.overall.total++;
          summaryData[challengeType].total++;
          
          // Update revenue
          summaryData.overall.revenue += fee;
          summaryData[challengeType].revenue += fee;

          // Update status counts
          if (status === 'passed' || status === 'completed') {
            summaryData.overall.win++;
            summaryData[challengeType].win++;
          } else if (status === 'failed' || status === 'rejected') {
            summaryData.overall.lose++;
            summaryData[challengeType].lose++;
          } else {
            summaryData.overall.pending++;
            summaryData[challengeType].pending++;
          }

          // Update user statistics
          if (!userStatsMap[user.id]) {
            userStatsMap[user.id] = {
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
              totalChallenges: 0,
              beginnerChallenges: 0,
              intermediateChallenges: 0,
              proChallenges: 0,
              wonChallenges: 0,
              lostChallenges: 0,
              activeChallenges: 0,
              totalSpent: 0,
              totalProfit: 0,
              totalLoss: 0,
              avgWinRate: 0
            };
          }

          const userStat = userStatsMap[user.id];
          userStat.totalChallenges++;
          userStat.totalSpent += fee;
          userStat.totalProfit += profit;
          userStat.totalLoss += loss;
          userStat.avgWinRate = (userStat.avgWinRate + (user.challengeStats?.winRate || 0)) / userStat.totalChallenges;

          if (challengeType === 'beginner') userStat.beginnerChallenges++;
          else if (challengeType === 'intermediate') userStat.intermediateChallenges++;
          else if (challengeType === 'pro') userStat.proChallenges++;

          if (status === 'passed') userStat.wonChallenges++;
          else if (status === 'failed') userStat.lostChallenges++;
          else if (status === 'active') userStat.activeChallenges++;
        }
      });

      setChallengeHistory(history);
      setUserStats(Object.values(userStatsMap));
      setSummary(summaryData);
      
    } catch (error) {
      console.error('Error fetching challenge history:', error);
      // Fallback demo data
      setChallengeHistory(getDemoHistory());
      setUserStats(getDemoUserStats());
      setSummary(getDemoSummary());
    } finally {
      setLoading(false);
    }
  };

  const getChallengeType = (challengeName) => {
    if (challengeName.includes('Beginner')) return 'beginner';
    if (challengeName.includes('Intermediate')) return 'intermediate';
    if (challengeName.includes('PRO') || challengeName.includes('Pro')) return 'pro';
    return 'unknown';
  };

  const getChallengeFee = (challengeName) => {
    if (challengeName.includes('Beginner')) return 1000;
    if (challengeName.includes('Intermediate')) return 2500;
    if (challengeName.includes('PRO') || challengeName.includes('Pro')) return 5000;
    return 0;
  };

  // Filter functions
  const filteredHistory = challengeHistory.filter(item => {
    if (selectedFilter !== 'all' && item.status !== selectedFilter) return false;
    if (selectedChallengeType !== 'all' && item.challengeType !== selectedChallengeType) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'passed': return <span className="badge badge-success">WON</span>;
      case 'failed': return <span className="badge badge-danger">LOST</span>;
      case 'active': return <span className="badge badge-warning">ACTIVE</span>;
      case 'pending': return <span className="badge badge-info">PENDING</span>;
      default: return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const getChallengeTypeBadge = (type) => {
    switch(type) {
      case 'beginner': return <span className="challenge-badge beginner">BEGINNER</span>;
      case 'intermediate': return <span className="challenge-badge intermediate">INTERMEDIATE</span>;
      case 'pro': return <span className="challenge-badge pro">PRO</span>;
      default: return <span className="challenge-badge">UNKNOWN</span>;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Challenge History...</p>
      </div>
    );
  }

  return (
    <div className="challenge-history-page">
      {/* Header */}
      <div className="settings-header">
        <h1><i className="fas fa-history"></i> Challenge History</h1>
        <p className="section-description">
          Comprehensive overview of all challenge purchases, wins, and losses
        </p>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="stat-info">
            <h3>Total Challenges Purchased</h3>
            <div className="stat-value">{summary.overall.total}</div>
            <div className="stat-detail">
              <span className="trend-up">
                <i className="fas fa-arrow-up"></i> 
                ₹{summary.overall.revenue.toLocaleString()} Revenue
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <i className="fas fa-trophy"></i>
          </div>
          <div className="stat-info">
            <h3>Challenges Won</h3>
            <div className="stat-value">{summary.overall.win}</div>
            <div className="stat-detail">
              <span className="trend-up">
                <i className="fas fa-check-circle"></i> 
                {((summary.overall.win / summary.overall.total) * 100 || 0).toFixed(1)}% Win Rate
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="stat-info">
            <h3>Challenges Lost</h3>
            <div className="stat-value">{summary.overall.lose}</div>
            <div className="stat-detail">
              <span className="trend-down">
                <i className="fas fa-arrow-down"></i> 
                {((summary.overall.lose / summary.overall.total) * 100 || 0).toFixed(1)}% Loss Rate
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <i className="fas fa-hourglass-half"></i>
          </div>
          <div className="stat-info">
            <h3>Active Challenges</h3>
            <div className="stat-value">{summary.overall.pending}</div>
            <div className="stat-detail">
              <span className="trend-up">
                <i className="fas fa-sync-alt"></i> 
                {((summary.overall.pending / summary.overall.total) * 100 || 0).toFixed(1)}% Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="challenge-summary-section">
        <h2><i className="fas fa-chart-pie"></i> Challenge Type Breakdown</h2>
        
        <div className="challenge-type-breakdown">
          <div className="challenge-type-card">
            <div className="type-header beginner-bg">
              <i className="fas fa-rocket"></i>
              <h3>Beginner Challenges</h3>
              <span className="type-count">{summary.beginner.total}</span>
            </div>
            <div className="type-stats">
              <div className="stat-row">
                <span>Won:</span>
                <span className="stat-value success">{summary.beginner.win}</span>
              </div>
              <div className="stat-row">
                <span>Lost:</span>
                <span className="stat-value danger">{summary.beginner.lose}</span>
              </div>
              <div className="stat-row">
                <span>Active:</span>
                <span className="stat-value warning">{summary.beginner.pending}</span>
              </div>
              <div className="stat-row">
                <span>Revenue:</span>
                <span className="stat-value primary">₹{summary.beginner.revenue.toLocaleString()}</span>
              </div>
              <div className="win-rate">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${(summary.beginner.win / summary.beginner.total) * 100 || 0}%`,
                      background: 'linear-gradient(90deg, #22c55e, #16a34a)'
                    }}
                  ></div>
                </div>
                <span>Win Rate: {((summary.beginner.win / summary.beginner.total) * 100 || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="challenge-type-card">
            <div className="type-header intermediate-bg">
              <i className="fas fa-chart-line"></i>
              <h3>Intermediate Challenges</h3>
              <span className="type-count">{summary.intermediate.total}</span>
            </div>
            <div className="type-stats">
              <div className="stat-row">
                <span>Won:</span>
                <span className="stat-value success">{summary.intermediate.win}</span>
              </div>
              <div className="stat-row">
                <span>Lost:</span>
                <span className="stat-value danger">{summary.intermediate.lose}</span>
              </div>
              <div className="stat-row">
                <span>Active:</span>
                <span className="stat-value warning">{summary.intermediate.pending}</span>
              </div>
              <div className="stat-row">
                <span>Revenue:</span>
                <span className="stat-value primary">₹{summary.intermediate.revenue.toLocaleString()}</span>
              </div>
              <div className="win-rate">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${(summary.intermediate.win / summary.intermediate.total) * 100 || 0}%`,
                      background: 'linear-gradient(90deg, #eab308, #ca8a04)'
                    }}
                  ></div>
                </div>
                <span>Win Rate: {((summary.intermediate.win / summary.intermediate.total) * 100 || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="challenge-type-card">
            <div className="type-header pro-bg">
              <i className="fas fa-crown"></i>
              <h3>PRO Challenges</h3>
              <span className="type-count">{summary.pro.total}</span>
            </div>
            <div className="type-stats">
              <div className="stat-row">
                <span>Won:</span>
                <span className="stat-value success">{summary.pro.win}</span>
              </div>
              <div className="stat-row">
                <span>Lost:</span>
                <span className="stat-value danger">{summary.pro.lose}</span>
              </div>
              <div className="stat-row">
                <span>Active:</span>
                <span className="stat-value warning">{summary.pro.pending}</span>
              </div>
              <div className="stat-row">
                <span>Revenue:</span>
                <span className="stat-value primary">₹{summary.pro.revenue.toLocaleString()}</span>
              </div>
              <div className="win-rate">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${(summary.pro.win / summary.pro.total) * 100 || 0}%`,
                      background: 'linear-gradient(90deg, #ef4444, #dc2626)'
                    }}
                  ></div>
                </div>
                <span>Win Rate: {((summary.pro.win / summary.pro.total) * 100 || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <div className="filter-select">
            <select 
              value={selectedFilter} 
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="passed">Won</option>
              <option value="failed">Lost</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="filter-select">
            <select 
              value={selectedChallengeType} 
              onChange={(e) => setSelectedChallengeType(e.target.value)}
            >
              <option value="all">All Challenge Types</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="pro">PRO</option>
            </select>
          </div>
          <button className="btn btn-secondary" onClick={fetchChallengeHistory}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {/* User Challenge Statistics */}
      <div className="content-section">
        <div className="section-header">
          <h2><i className="fas fa-user-chart"></i> User Challenge Statistics</h2>
          <span className="badge badge-primary">{userStats.length} Users</span>
        </div>
        <div className="section-content">
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Total Challenges</th>
                  <th>Beginner</th>
                  <th>Intermediate</th>
                  <th>PRO</th>
                  <th>Won</th>
                  <th>Lost</th>
                  <th>Active</th>
                  <th>Total Spent</th>
                  <th>Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {userStats.map((user, index) => (
                  <tr key={user.userId}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar-small">
                          {user.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="user-name">{user.userName}</div>
                          <div className="user-email">{user.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td><strong>{user.totalChallenges}</strong></td>
                    <td>
                      <span className="challenge-count beginner">
                        {user.beginnerChallenges}
                      </span>
                    </td>
                    <td>
                      <span className="challenge-count intermediate">
                        {user.intermediateChallenges}
                      </span>
                    </td>
                    <td>
                      <span className="challenge-count pro">
                        {user.proChallenges}
                      </span>
                    </td>
                    <td>
                      <span className="stat-value success">{user.wonChallenges}</span>
                    </td>
                    <td>
                      <span className="stat-value danger">{user.lostChallenges}</span>
                    </td>
                    <td>
                      <span className="stat-value warning">{user.activeChallenges}</span>
                    </td>
                    <td>₹{user.totalSpent.toLocaleString()}</td>
                    <td>
                      <div className="progress-container-small">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${user.avgWinRate}%`,
                              background: user.avgWinRate >= 50 ? 
                                'linear-gradient(90deg, #10b981, #34d399)' :
                                'linear-gradient(90deg, #ef4444, #f87171)'
                            }}
                          ></div>
                        </div>
                        <span>{user.avgWinRate.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Challenge History Table */}
      <div className="content-section">
        <div className="section-header">
          <h2><i className="fas fa-list-alt"></i> Detailed Challenge History</h2>
          <span className="badge badge-info">{filteredHistory.length} Records</span>
        </div>
        <div className="section-content">
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Challenge Type</th>
                  <th>Purchase Date</th>
                  <th>Status</th>
                  <th>Trades</th>
                  <th>Profit/Loss</th>
                  <th>Win Rate</th>
                  <th>Fee</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, index) => (
                  <tr key={`${item.userId}-${index}`}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar-small">
                          {item.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="user-name">{item.userName}</div>
                          <div className="user-email">{item.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getChallengeTypeBadge(item.challengeType)}</td>
                    <td>{new Date(item.purchaseDate).toLocaleDateString()}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>{item.tradesCount}</td>
                    <td>
                      <div className={`pnl-display ${item.profit >= 0 ? 'profit' : 'loss'}`}>
                        <i className={`fas ${item.profit >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                        ₹{Math.abs(item.profit).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div className="progress-container-small">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${item.winRate}%`,
                              background: item.winRate >= 50 ? 
                                'linear-gradient(90deg, #10b981, #34d399)' :
                                'linear-gradient(90deg, #ef4444, #f87171)'
                            }}
                          ></div>
                        </div>
                        <span>{item.winRate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>₹{item.fee.toLocaleString()}</td>
                    <td>{new Date(item.lastUpdated).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="export-section">
        <button className="btn btn-primary">
          <i className="fas fa-download"></i> Export to CSV
        </button>
        <button className="btn btn-secondary">
          <i className="fas fa-print"></i> Print Report
        </button>
      </div>
    </div>
  );
};

// Demo data functions (fallback)
const getDemoHistory = () => {
  const names = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis', 'Michael Brown'];
  const challenges = ['🚀 Beginner Challenge', '🟡 Intermediate Challenge', '🔴 PRO Challenge'];
  const statuses = ['passed', 'failed', 'active'];
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    userId: `user${i + 1}`,
    userName: names[i % names.length],
    userEmail: `user${i + 1}@example.com`,
    challengeName: challenges[i % 3],
    challengeType: i % 3 === 0 ? 'beginner' : i % 3 === 1 ? 'intermediate' : 'pro',
    purchaseDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: statuses[i % 3],
    profit: Math.random() * 5000 - 1000,
    loss: Math.random() * 3000,
    fee: i % 3 === 0 ? 1000 : i % 3 === 1 ? 2500 : 5000,
    tradesCount: Math.floor(Math.random() * 50) + 5,
    winRate: Math.random() * 100,
    lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }));
};

const getDemoUserStats = () => {
  const names = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis', 'Michael Brown'];
  
  return names.map((name, i) => ({
    userId: `user${i + 1}`,
    userName: name,
    userEmail: `user${i + 1}@example.com`,
    totalChallenges: Math.floor(Math.random() * 10) + 1,
    beginnerChallenges: Math.floor(Math.random() * 5),
    intermediateChallenges: Math.floor(Math.random() * 4),
    proChallenges: Math.floor(Math.random() * 3),
    wonChallenges: Math.floor(Math.random() * 5),
    lostChallenges: Math.floor(Math.random() * 3),
    activeChallenges: Math.floor(Math.random() * 2),
    totalSpent: (Math.floor(Math.random() * 5) * 1000) + 1000,
    totalProfit: Math.random() * 10000,
    totalLoss: Math.random() * 5000,
    avgWinRate: Math.random() * 100
  }));
};

const getDemoSummary = () => ({
  beginner: { total: 65, win: 25, lose: 20, pending: 20, revenue: 65000 },
  intermediate: { total: 45, win: 18, lose: 15, pending: 12, revenue: 112500 },
  pro: { total: 46, win: 25, lose: 16, pending: 5, revenue: 230000 },
  overall: { total: 156, win: 68, lose: 51, pending: 37, revenue: 407500 }
});

export default ChallengeHistory;
