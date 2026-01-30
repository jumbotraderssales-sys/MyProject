// src/components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/users', icon: 'fas fa-users', label: 'Users' },
    { path: '/trades', icon: 'fas fa-exchange-alt', label: 'Trades' },
    { path: '/payments', icon: 'fas fa-credit-card', label: 'Payments' },
    { path: '/withdrawals', icon: 'fas fa-money-bill-wave', label: 'Withdrawals' },
    // ADDED UPI SETTINGS LINK
    { path: '/upi-settings', icon: 'fas fa-qrcode', label: 'UPI Settings' },
    // END OF ADDED LINK
    { path: '/settings', icon: 'fas fa-cog', label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2><i className="fas fa-chart-line"></i> Paper2Real</h2>
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
    </div>
  );
};

export default Sidebar;