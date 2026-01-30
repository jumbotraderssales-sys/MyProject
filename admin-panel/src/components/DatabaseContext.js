import React, { createContext, useState, useContext, useEffect } from 'react';

const DatabaseContext = createContext();

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [plans, setPlans] = useState([
    { id: 1, name: 'Basic', price: 100, features: ['Basic Trading', '24/7 Support'] },
    { id: 2, name: 'Pro', price: 300, features: ['Advanced Trading', 'Priority Support', 'Analytics'] },
    { id: 3, name: 'Enterprise', price: 1000, features: ['All Features', 'Dedicated Manager', 'API Access'] }
  ]);

  // Initialize from localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('admin_users');
    const savedTransactions = localStorage.getItem('admin_transactions');
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Default users
      const defaultUsers = [
        {
          id: 1,
          firstName: 'Laltu',
          lastName: 'Mandal',
          email: 'Slattu@gmail.com',
          phone: '+91 41414141',
          country: 'India',
          balance: 1250,
          plan: 'Pro',
          status: 'active',
          verification: {
            email: true,
            mobile: true,
            kyc: true,
            twoFA: true
          },
          createdAt: new Date().toISOString()
        }
      ];
      setUsers(defaultUsers);
    }
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('admin_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('admin_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Database methods
  const addUser = (userData) => {
    const newUser = {
      id: Date.now(),
      ...userData,
      balance: 0,
      status: 'active',
      verification: {
        email: false,
        mobile: false,
        kyc: false,
        twoFA: false
      },
      createdAt: new Date().toISOString()
    };
    
    setUsers(prev => [newUser, ...prev]);
    
    // Add notification
    addNotification({
      type: 'new_user',
      message: `New user registered: ${userData.firstName} ${userData.lastName}`,
      user: newUser,
      read: false
    });
    
    return newUser;
  };

  const updateUserBalance = (userId, amount, type = 'deposit', note = '') => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const oldBalance = user.balance;
        const newBalance = type === 'deposit' ? user.balance + amount : user.balance - amount;
        
        // Add transaction
        const newTransaction = {
          id: Date.now(),
          userId,
          type,
          amount,
          oldBalance,
          newBalance,
          description: note || `${type} by admin`,
          status: 'completed',
          timestamp: new Date().toISOString()
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        
        // Add notification for large transactions
        if (amount >= 1000) {
          addNotification({
            type: 'large_transaction',
            message: `Large ${type}: $${amount} for user ${user.firstName}`,
            user,
            read: false
          });
        }
        
        return { ...user, balance: newBalance };
      }
      return user;
    }));
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getNewUsers = () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return users.filter(user => new Date(user.createdAt) > oneDayAgo);
  };

  const getUnverifiedUsers = (type) => {
    return users.filter(user => {
      if (type === 'email') return !user.verification.email;
      if (type === 'mobile') return !user.verification.mobile;
      if (type === 'kyc') return !user.verification.kyc;
      return false;
    });
  };

  return (
    <DatabaseContext.Provider value={{
      users,
      transactions,
      notifications,
      plans,
      addUser,
      updateUserBalance,
      addNotification,
      markNotificationAsRead,
      clearNotifications,
      getNewUsers,
      getUnverifiedUsers
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};