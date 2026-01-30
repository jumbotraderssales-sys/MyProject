import React, { useState, useEffect } from 'react';
import adminApi from '../services/api';

const TradesPage = () => {
  const [trades, setTrades] = useState([]);
  const [filters, setFilters] = useState({
    symbol: '',
    side: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('TradesPage: Component mounted, loading trades...');
    loadTrades();
  }, []);

  const loadTrades = async () => {
    setLoading(true);
    try {
      console.log('TradesPage: Loading trades from API...');
      const response = await adminApi.getAllTrades();
      
      console.log('TradesPage: API response received:', response);
      
      // Handle different response formats
      let tradesData = [];
      
      if (response && Array.isArray(response)) {
        // Direct array response (what our fixed backend returns)
        tradesData = response;
        console.log('TradesPage: Got direct array with', tradesData.length, 'trades');
      } else if (response && response.trades && Array.isArray(response.trades)) {
        // Nested response format
        tradesData = response.trades;
        console.log('TradesPage: Got nested trades array with', tradesData.length, 'trades');
      } else if (response && response.data && Array.isArray(response.data)) {
        // Another possible nested format
        tradesData = response.data;
        console.log('TradesPage: Got data array with', tradesData.length, 'trades');
      } else {
        console.log('TradesPage: Unexpected response format:', response);
      }
      
      // Log first few trades for debugging
      if (tradesData.length > 0) {
        console.log('TradesPage: First trade sample:', tradesData[0]);
      }
      
      setTrades(tradesData);
    } catch (error) {
      console.error('TradesPage: Error loading trades:', error);
      setTrades([]); // Set empty array on error
    }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getTotalStats = () => {
    // Ensure trades is an array before filtering
    if (!Array.isArray(trades)) {
      return {
        totalTrades: 0,
        openTrades: 0,
        closedTrades: 0,
        totalVolume: 0,
        totalPnl: 0
      };
    }
    
    const openTrades = trades.filter(t => 
      t.status === 'OPEN' || t.status === 'open' || t.status === 'Open'
    );
    const closedTrades = trades.filter(t => 
      t.status === 'CLOSED' || t.status === 'closed' || t.status === 'Closed'
    );
    
    // Calculate total volume using various possible field names
    const totalVolume = trades.reduce((sum, t) => {
      const quantity = t.quantity || t.size || 0;
      const price = t.price || t.entryPrice || t.currentPrice || 0;
      return sum + (quantity * price);
    }, 0);
    
    return {
      totalTrades: trades.length,
      openTrades: openTrades.length,
      closedTrades: closedTrades.length,
      totalVolume: totalVolume,
      totalPnl: trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    };
  };

  const stats = getTotalStats();

  // Apply filters to trades
  const getFilteredTrades = () => {
    if (!Array.isArray(trades)) return [];
    
    return trades.filter(trade => {
      // Symbol filter
      if (filters.symbol && trade.symbol) {
        const tradeSymbol = trade.symbol || '';
        const filterSymbol = filters.symbol || '';
        if (!tradeSymbol.toLowerCase().includes(filterSymbol.toLowerCase())) {
          return false;
        }
      }
      
      // Side filter
      if (filters.side && trade.side) {
        const tradeSide = (trade.side || '').toLowerCase();
        const filterSide = (filters.side || '').toLowerCase();
        if (tradeSide !== filterSide) {
          return false;
        }
      }
      
      // Status filter - handle different status formats
      if (filters.status) {
        const tradeStatus = (trade.status || '').toLowerCase();
        const filterStatus = (filters.status || '').toLowerCase();
        
        if (filterStatus === 'open' && !(tradeStatus === 'open')) {
          return false;
        }
        if (filterStatus === 'closed' && !(tradeStatus === 'closed')) {
          return false;
        }
      }
      
      // Date filters
      if (filters.startDate && trade.createdAt) {
        const tradeDate = new Date(trade.createdAt);
        const filterDate = new Date(filters.startDate);
        if (tradeDate < filterDate) {
          return false;
        }
      }
      
      if (filters.endDate && trade.createdAt) {
        const tradeDate = new Date(trade.createdAt);
        const filterDate = new Date(filters.endDate);
        filterDate.setHours(23, 59, 59, 999); // End of day
        if (tradeDate > filterDate) {
          return false;
        }
      }
      
      return true;
    });
  };

  const filteredTrades = getFilteredTrades();

  return (
    <div className="trades-page">
      <div className="page-header">
        <h1>Trading Activity Monitor</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={loadTrades} disabled={loading}>
            <i className="fas fa-sync-alt"></i> {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Trades</div>
          <div className="stat-value">{stats.totalTrades}</div>
          <div className="stat-detail">
            {stats.openTrades} open, {stats.closedTrades} closed
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Volume</div>
          <div className="stat-value">${stats.totalVolume.toLocaleString()}</div>
          <div className="stat-detail">All trading volume</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total P&L</div>
          <div className={`stat-value ${stats.totalPnl >= 0 ? 'text-success' : 'text-danger'}`}>
            ${stats.totalPnl.toFixed(2)}
          </div>
          <div className="stat-detail">Combined profit/loss</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Symbol (BTC, ETH...)"
            value={filters.symbol}
            onChange={(e) => handleFilterChange('symbol', e.target.value)}
            className="filter-input"
          />
          <select
            value={filters.side}
            onChange={(e) => handleFilterChange('side', e.target.value)}
            className="filter-select"
          >
            <option value="">All Sides</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <button 
            className="btn btn-secondary" 
            onClick={() => setFilters({
              symbol: '',
              side: '',
              status: '',
              startDate: '',
              endDate: ''
            })}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Trades Table */}
      <div className="content-section">
        <div className="section-content">
          {loading ? (
            <div className="loading">Loading trades...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trade ID</th>
                  <th>User</th>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th>Quantity</th>
                  <th>Entry Price</th>
                  <th>Current Price</th>
                  <th>P&L</th>
                  <th>Status</th>
                  <th>Opened</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.length > 0 ? (
                  filteredTrades.map(trade => {
                    // Debug log for each trade
                    console.log('Rendering trade:', trade);
                    
                    return (
                      <tr key={trade.id || trade._id}>
                        <td>#{trade.id ? trade.id.substring(0, 8) : 'N/A'}</td>
                        <td>{trade.userName || trade.user || `User #${trade.userId || 'N/A'}`}</td>
                        <td><strong>{trade.symbol || 'N/A'}</strong></td>
                        <td>
                          <span className={`badge ${
                            (trade.side || '').toLowerCase() === 'buy' || 
                            (trade.side || '').toLowerCase() === 'long' ? 'badge-success' : 'badge-danger'
                          }`}>
                            {(trade.side || 'N/A').toUpperCase()}
                          </span>
                        </td>
                        <td>{trade.quantity || trade.size || 0}</td>
                        <td>${(trade.entryPrice || trade.price || 0).toFixed(2)}</td>
                        <td>${(trade.currentPrice || trade.entryPrice || 0).toFixed(2)}</td>
                        <td>
                          <span className={(trade.pnl || 0) >= 0 ? 'text-success' : 'text-danger'}>
                            ${(trade.pnl || 0).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${(trade.status || 'unknown').toLowerCase()}`}>
                            {(trade.status || 'N/A').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {trade.createdAt || trade.openedAt || trade.timestamp
                            ? new Date(trade.createdAt || trade.openedAt || trade.timestamp).toLocaleString()
                            : 'N/A'
                          }
                        </td>
                        <td>
                          <button className="action-btn view">
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="11" className="no-data">
                      <i className="fas fa-chart-line"></i>
                      <p>No trades found {trades.length > 0 ? '(filtered out)' : ''}</p>
                      {trades.length === 0 && (
                        <button className="btn btn-primary mt-2" onClick={loadTrades}>
                          Try Loading Again
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradesPage;