// src/components/Header.js
import React from 'react';

const Header = () => {
  return (
    <header className="admin-header">
      <div>
        <h1>Admin Dashboard</h1>
      </div>
      <div className="header-right">
        <div className="user-profile">
          <div className="user-avatar">A</div>
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;