import React, { createContext, useContext, useState, useEffect } from 'react';

const DatabaseContext = createContext();

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    activeTrades: 0,
    totalBalance: 0,
    dailyVolume: 0,
    totalPnl: 0
  });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Try your admin backend on port 3002
      const response = await fetch('http://localhost:3002/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setStats(data.stats || {});
        setConnected(true);
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      // Fallback to mock data
      console.log('Using mock data:', error.message);
      setConnected(false);
      
      // Mock data
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', balance: 12500, status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', balance: 8500, status: 'active' },
        { id: 3, name: 'Bob Wilson', email: 'bob@example.com', balance: 3200, status: 'inactive' },
        { id: 4, name: 'Alice Johnson', email: 'alice@example.com', balance: 21000, status: 'active' },
        { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', balance: 5600, status: 'pending' }
      ];
      
      const mockStats = {
        totalUsers: 5,
        activeUsers: 3,
        activeTrades: 12,
        totalBalance: 50800,
        dailyVolume: 24500,
        totalPnl: 1250
      };
      
      setUsers(mockUsers);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <DatabaseContext.Provider value={{
      users,
      stats,
      loading,
      connected,
      loadAllData
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};