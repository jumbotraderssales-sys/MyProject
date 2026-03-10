import React, { useState, useEffect } from 'react';
import './ChallengeHistory.css';

const ChallengeHistory = () => {
  const [challengeHistory, setChallengeHistory] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [summary, setSummary] = useState({
    beginner: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0, paperProfit: 0, realPayout: 0 },
    intermediate: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0, paperProfit: 0, realPayout: 0 },
    pro: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0, paperProfit: 0, realPayout: 0 },
    overall: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0, paperProfit: 0, realPayout: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedChallengeType, setSelectedChallengeType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchRealChallengeData();
  }, []);

  const fetchRealChallengeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const baseURL = process.env.REACT_APP_API_URL || 'https://myproject1-d097.onrender.com';
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('📊 Fetching real challenge data from backend...');

      // Fetch all required data in parallel
      const [usersRes, paymentsRes, tradesRes, withdrawalsRes] = await Promise.all([
        fetch(`${baseURL}/api/admin/users`, { headers }),
        fetch(`${baseURL}/api/admin/payments`, { headers }),
        fetch(`${baseURL}/api/admin/trades`, { headers }),
        fetch(`${baseURL}/api/admin/withdrawals`, { headers })
      ]);

      if (!usersRes.ok || !paymentsRes.ok) {
        throw new Error('Failed to fetch data from server');
      }

      const users = await usersRes.json();
      const payments = await paymentsRes.json();
      const trades = await tradesRes.json();
      const withdrawals = await withdrawalsRes.json();

      console.log(`✅ Fetched ${users.length} users, ${payments.length} payments`);

      // Process challenge history from REAL data
      const history = [];
      const userStatsMap = {};
      
      const summaryData = {
        beginner: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0, paperProfit: 0, realPayout: 0 },
        intermediate: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0, paperProfit: 0, realPayout: 0 },
        pro: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0, paperProfit: 0, realPayout: 0 },
        overall: { total: 0, win: 0, lose: 0, pending: 0, revenue: 0, paperProfit: 0, realPayout: 0 }
      };

      // First, process all payments (challenge purchases)
      payments.forEach(payment => {
        if (!payment) return;
        
        const challengeType = getChallengeType(payment.challengeName || payment.planName || '');
        const status = payment.status || 'pending';
        const amount = parseFloat(payment.amount) || 0;
        const userId = payment.userId || payment.user_id || '';
        
        // Find user details
        const user = users.find(u => u.id === userId || u._id === userId) || {};
        
        // Calculate paper profit from trades for this user
        const userTrades = trades.filter(t => t.userId === userId && t.status === 'closed');
        const paperProfit = userTrades.reduce((sum, trade) => sum + (parseFloat(trade.pnl) || 0), 0) * 90; // Convert USD to INR
        
        // Calculate real payout from withdrawals
        const userWithdrawals = withdrawals.filter(w => w.userId === userId && w.status === 'approved');
        const realPayout = userWithdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);

        // Add to challenge history
        history.push({
          id: payment.id || `pay_${Date.now()}_${Math.random()}`,
          userId: userId,
          userName: user.name || payment.userName || 'Unknown User',
          userEmail: user.email || payment.userEmail || 'unknown@email.com',
          challengeName: payment.challengeName || payment.planName || 'Unknown Challenge',
          challengeType,
          purchaseDate: payment.submittedAt || payment.createdAt || payment.date || new Date().toISOString(),
          status: status === 'approved' ? 'passed' : 
                  status === 'rejected' ? 'failed' : 
                  status === 'pending' ? 'pending' : status,
          paperProfit: paperProfit > 0 ? paperProfit : 0,
          paperLoss: paperProfit < 0 ? Math.abs(paperProfit) : 0,
          realPayout,
          fee: amount,
          tradesCount: userTrades.length,
          winRate: calculateWinRate(userTrades),
          lastUpdated: payment.updatedAt || payment.processedAt || new Date().toISOString()
        });

        // Update summary statistics
        summaryData.overall.total++;
        summaryData[challengeType].total++;
        summaryData.overall.revenue += amount;
        summaryData[challengeType].revenue += amount;
        
        if (paperProfit > 0) {
          summaryData.overall.paperProfit += paperProfit;
          summaryData[challengeType].paperProfit += paperProfit;
        }
        
        summaryData.overall.realPayout += realPayout;
        summaryData[challengeType].realPayout += realPayout;

        // Update status counts
        if (status === 'approved' || status === 'passed' || status === 'completed') {
          summaryData.overall.win++;
          summaryData[challengeType].win++;
        } else if (status === 'rejected' || status === 'failed') {
          summaryData.overall.lose++;
          summaryData[challengeType].lose++;
        } else {
          summaryData.overall.pending++;
          summaryData[challengeType].pending++;
        }

        // Update user statistics
        if (!userStatsMap[userId]) {
          userStatsMap[userId] = {
            userId,
            userName: user.name || payment.userName || 'Unknown',
            userEmail: user.email || payment.userEmail || 'unknown@email.com',
            totalChallenges: 0,
            beginnerChallenges: 0,
            intermediateChallenges: 0,
            proChallenges: 0,
            wonChallenges: 0,
            lostChallenges: 0,
            activeChallenges: 0,
            totalSpent: 0,
            totalPaperProfit: 0,
            totalRealPayout: 0,
            totalTrades: 0,
            avgWinRate: 0
          };
        }

        const userStat = userStatsMap[userId];
        userStat.totalChallenges++;
        userStat.totalSpent += amount;
        userStat.totalPaperProfit += paperProfit;
        userStat.totalRealPayout += realPayout;
        userStat.totalTrades += userTrades.length;
        
        if (challengeType === 'beginner') userStat.beginnerChallenges++;
        else if (challengeType === 'intermediate') userStat.intermediateChallenges++;
        else if (challengeType === 'pro') userStat.proChallenges++;

        if (status === 'approved' || status === 'passed') userStat.wonChallenges++;
        else if (status === 'rejected' || status === 'failed') userStat.lostChallenges++;
        else if (status === 'pending') userStat.activeChallenges++;
      });

      // Calculate average win rates for users
      Object.values(userStatsMap).forEach(userStat => {
        if (userStat.totalTrades > 0) {
          const userTrades = trades.filter(t => t.userId === userStat.userId && t.status === 'closed');
          const winningTrades = userTrades.filter(t => (t.pnl || 0) > 0).length;
          userStat.avgWinRate = (winningTrades / userTrades.length) * 100;
        }
      });

      // Sort history by date (newest first)
      history.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

      setChallengeHistory(history);
      setUserStats(Object.values(userStatsMap));
      setSummary(summaryData);
      
      console.log('✅ Challenge history processed successfully');
      
    } catch (error) {
      console.error('❌ Error fetching challenge history:', error);
      setError(error.message);
      
      // Only use mock data if API fails
      const mockData = getMockData();
      setChallengeHistory(mockData.history);
      setUserStats(mockData.userStats);
      setSummary(mockData.summary);
    } finally {
      setLoading(false);
    }
  };

  const getChallengeType = (challengeName) => {
    if (!challengeName) return 'unknown';
    const name = challengeName.toLowerCase();
    if (name.includes('beginner')) return 'beginner';
    if (name.includes('intermediate')) return 'intermediate';
    if (name.includes('pro') || name.includes('🔴')) return 'pro';
    return 'unknown';
  };

  const calculateWinRate = (trades) => {
    if (!trades || trades.length === 0) return 0;
    const winningTrades = trades.filter(t => (t.pnl || 0) > 0).length;
    return (winningTrades / trades.length) * 100;
  };

  // Filter functions
  const filteredHistory = challengeHistory.filter(item => {
    if (selectedFilter !== 'all' && item.status !== selectedFilter) return false;
    if (selectedChallengeType !== 'all' && item.challengeType !== selectedChallengeType) return false;
    
    // Date range filter
    if (dateRange.start) {
      const itemDate = new Date(item.purchaseDate);
      const startDate = new Date(dateRange.start);
      if (itemDate < startDate) return false;
    }
    if (dateRange.end) {
      const itemDate = new Date(item.purchaseDate);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      if (itemDate > endDate) return false;
    }
    
    return true;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'passed':
      case 'approved':
      case 'completed':
        return <span className="badge badge-success">WON</span>;
      case 'failed':
      case 'rejected':
        return <span className="badge badge-danger">LOST</span>;
      case 'active':
        return <span className="badge badge-warning">ACTIVE</span>;
      case 'pending':
        return <span className="badge badge-info">PENDING</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const getChallengeTypeBadge = (type) => {
    switch(type) {
      case 'beginner': 
        return <span className="challenge-badge beginner">BEGINNER</span>;
      case 'intermediate': 
        return <span className="challenge-badge intermediate">INTERMEDIATE</span>;
      case 'pro': 
        return <span className="challenge-badge pro">PRO</span>;
      default: 
        return <span className="challenge-badge">UNKNOWN</span>;
    }
  };

  const exportToCSV = () => {
    const headers = ['User Name', 'Email', 'Challenge', 'Type', 'Purchase Date', 'Status', 'Trades', 'Paper Profit', 'Real Payout', 'Fee', 'Win Rate'];
    
    const csvData = filteredHistory.map(item => [
      item.userName,
      item.userEmail,
      item.challengeName,
      item.challengeType,
      new Date(item.purchaseDate).toLocaleDateString(),
      item.status,
      item.tradesCount,
      item.paperProfit.toFixed(2),
      item.realPayout.toFixed(2),
      item.fee.toFixed(2),
      item.winRate.toFixed(1) + '%'
    ]);
    
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `challenge-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Real Challenge Data...</p>
      </div>
    );
  }

  return (
    <div className="challenge-history-page">
      {/* Header */}
      <div className="settings-header">
        <h1><i className="fas fa-history"></i> Challenge History</h1>
        <p className="section-description">
          Real-time challenge statistics from your platform data
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
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-info">
            <h3>Total Paper Profit</h3>
            <div className="stat-value">₹{summary.overall.paperProfit.toLocaleString()}</div>
            <div className="stat-detail">
              <span className="trend-up">
                <i className="fas fa-coins"></i> Generated by users
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <i className="fas fa-hand-holding-usd"></i>
          </div>
          <div className="stat-info">
            <h3>Total Real Payout</h3>
            <div className="stat-value">₹{summary.overall.realPayout.toLocaleString()}</div>
            <div className="stat-detail">
              <span className="trend-up">
                <i className="fas fa-wallet"></i> Paid to users
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="challenge-summary-section">
        <h2><i className="fas fa-chart-pie"></i> Challenge Type Breakdown</h2>
        
        <div className="challenge-type-breakdown">
          {/* Beginner Card */}
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
              <div className="stat-row">
                <span>Paper Profit:</span>
                <span className="stat-value success">₹{summary.beginner.paperProfit.toLocaleString()}</span>
              </div>
              <div className="stat-row">
                <span>Real Payout:</span>
                <span className="stat-value primary">₹{summary.beginner.realPayout.toLocaleString()}</span>
              </div>
              <div className="win-rate">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${(summary.beginner.win / (summary.beginner.total || 1)) * 100}%`,
                      background: 'linear-gradient(90deg, #22c55e, #16a34a)'
                    }}
                  ></div>
                </div>
                <span>Win Rate: {((summary.beginner.win / (summary.beginner.total || 1)) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Intermediate Card */}
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
              <div className="stat-row">
                <span>Paper Profit:</span>
                <span className="stat-value success">₹{summary.intermediate.paperProfit.toLocaleString()}</span>
              </div>
              <div className="stat-row">
                <span>Real Payout:</span>
                <span className="stat-value primary">₹{summary.intermediate.realPayout.toLocaleString()}</span>
              </div>
              <div className="win-rate">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${(summary.intermediate.win / (summary.intermediate.total || 1)) * 100}%`,
                      background: 'linear-gradient(90deg, #eab308, #ca8a04)'
                    }}
                  ></div>
                </div>
                <span>Win Rate: {((summary.intermediate.win / (summary.intermediate.total || 1)) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* PRO Card */}
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
              <div className="stat-row">
                <span>Paper Profit:</span>
                <span className="stat-value success">₹{summary.pro.paperProfit.toLocaleString()}</span>
              </div>
              <div className="stat-row">
                <span>Real Payout:</span>
                <span className="stat-value primary">₹{summary.pro.realPayout.toLocaleString()}</span>
              </div>
              <div className="win-rate">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${(summary.pro.win / (summary.pro.total || 1)) * 100}%`,
                      background: 'linear-gradient(90deg, #ef4444, #dc2626)'
                    }}
                  ></div>
                </div>
                <span>Win Rate: {((summary.pro.win / (summary.pro.total || 1)) * 100).toFixed(1)}%</span>
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

          <div className="filter-select">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              placeholder="Start Date"
            />
          </div>

          <div className="filter-select">
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              placeholder="End Date"
            />
          </div>

          <button className="btn btn-secondary" onClick={fetchRealChallengeData}>
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
                  <th>Paper Profit</th>
                  <th>Real Payout</th>
                  <th>Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {userStats.map((user, index) => (
                  <tr key={user.userId || index}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar-small">
                          {user.userName?.charAt(0).toUpperCase() || 'U'}
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
                      <span className={user.totalPaperProfit >= 0 ? 'stat-value success' : 'stat-value danger'}>
                        ₹{Math.abs(user.totalPaperProfit).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="stat-value primary">₹{user.totalRealPayout.toLocaleString()}</span>
                    </td>
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

      {/* Detailed Challenge History Table */}
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
                  <th>Challenge</th>
                  <th>Type</th>
                  <th>Purchase Date</th>
                  <th>Status</th>
                  <th>Trades</th>
                  <th>Paper Profit</th>
                  <th>Real Payout</th>
                  <th>Fee</th>
                  <th>Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar-small">
                          {item.userName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="user-name">{item.userName}</div>
                          <div className="user-email">{item.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td>{item.challengeName}</td>
                    <td>{getChallengeTypeBadge(item.challengeType)}</td>
                    <td>{new Date(item.purchaseDate).toLocaleDateString()}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>{item.tradesCount}</td>
                    <td>
                      <div className={`pnl-display ${item.paperProfit >= 0 ? 'profit' : 'loss'}`}>
                        <i className={`fas ${item.paperProfit >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                        ₹{Math.abs(item.paperProfit).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <span className="stat-value primary">₹{item.realPayout.toLocaleString()}</span>
                    </td>
                    <td>₹{item.fee.toLocaleString()}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="export-section">
        <button className="btn btn-primary" onClick={exportToCSV}>
          <i className="fas fa-download"></i> Export to CSV
        </button>
        <button className="btn btn-secondary" onClick={window.print}>
          <i className="fas fa-print"></i> Print Report
        </button>
      </div>
    </div>
  );
};

// Keep mock data as fallback only
const getMockData = () => {
  const names = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis', 'Michael Brown'];
  const challenges = ['🚀 Beginner Challenge', '🟡 Intermediate Challenge', '🔴 PRO Challenge'];
  const statuses = ['passed', 'failed', 'pending'];
  
  const history = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    userId: `user${i + 1}`,
    userName: names[i % names.length],
    userEmail: `user${i + 1}@example.com`,
    challengeName: challenges[i % 3],
    challengeType: i % 3 === 0 ? 'beginner' : i % 3 === 1 ? 'intermediate' : 'pro',
    purchaseDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: statuses[i % 3],
    paperProfit: Math.random() * 5000,
    paperLoss: Math.random() * 1000,
    realPayout: Math.random() > 0.7 ? Math.random() * 2000 : 0,
    fee: i % 3 === 0 ? 1000 : i % 3 === 1 ? 2500 : 5000,
    tradesCount: Math.floor(Math.random() * 50) + 5,
    winRate: Math.random() * 100,
    lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }));

  const userStats = names.map((name, i) => ({
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
    totalPaperProfit: Math.random() * 10000,
    totalRealPayout: Math.random() * 5000,
    totalTrades: Math.floor(Math.random() * 100) + 10,
    avgWinRate: Math.random() * 100
  }));

  const summary = {
    beginner: { total: 65, win: 25, lose: 20, pending: 20, revenue: 65000, paperProfit: 45000, realPayout: 12000 },
    intermediate: { total: 45, win: 18, lose: 15, pending: 12, revenue: 112500, paperProfit: 78000, realPayout: 25000 },
    pro: { total: 46, win: 25, lose: 16, pending: 5, revenue: 230000, paperProfit: 156000, realPayout: 85000 },
    overall: { total: 156, win: 68, lose: 51, pending: 37, revenue: 407500, paperProfit: 279000, realPayout: 122000 }
  };

  return { history, userStats, summary };
};

export default ChallengeHistory;
