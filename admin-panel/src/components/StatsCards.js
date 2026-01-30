import React from 'react';
import { useDatabase } from '../context/DatabaseContext';

const StatsCards = () => {
  const { getStats } = useDatabase();
  const stats = getStats();

  return (
    <div className="dashboard-stats">
      <div className="stat-card total-users">
        <h3>Total Users</h3>
        <div className="stat-value">{stats.totalUsers}</div>
        <div className="stat-trend trend-up">
          <span>{stats.newToday} new today</span>
        </div>
      </div>
      
      <div className="stat-card active-trades">
        <h3>Active Trades</h3>
        <div className="stat-value">{stats.activeTrades}</div>
        <div className="stat-trend trend-up">
          <span>8.3% from yesterday</span>
        </div>
      </div>
      
      <div className="stat-card revenue">
        <h3>Revenue Today</h3>
        <div className="stat-value">${stats.revenueToday.toLocaleString()}</div>
        <div className="stat-trend trend-up">
          <span>5.2% from yesterday</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;