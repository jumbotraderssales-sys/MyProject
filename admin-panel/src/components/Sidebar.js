// components/Sidebar.js - Updated with Challenges link
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', icon: 'fas fa-chart-line', label: 'Dashboard' },
    { path: '/users', icon: 'fas fa-users', label: 'Users' },
    { path: '/trades', icon: 'fas fa-exchange-alt', label: 'Trades' },
    { path: '/challenges', icon: 'fas fa-trophy', label: 'Challenges' },
    { path: '/orders', icon: 'fas fa-clipboard-list', label: 'Orders' },
    { path: '/payments', icon: 'fas fa-credit-card', label: 'Payments' },
    { path: '/withdrawals', icon: 'fas fa-money-bill-wave', label: 'Withdrawals' },
    { path: '/p2p', icon: 'fas fa-handshake', label: 'P2P Trading' },
    { path: '/upi-settings', icon: 'fas fa-qrcode', label: 'UPI Settings' },
    { path: '/settings', icon: 'fas fa-cog', label: 'Settings' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>
          <i className="fas fa-chart-bar"></i>
          <span>Paper2Real Admin</span>
        </h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <i className={`icon ${item.icon}`}></i>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="version-info">
          <span>v1.1.0</span>
          <small>Challenge System</small>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
