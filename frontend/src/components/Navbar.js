import React, { useState } from 'react';
import './Navbar.css';

const Navbar = ({ 
  equity, 
  dollarRate, 
  userAccount, 
  onRefresh, 
  onLogout,
  activeDashboard,
  onTabChange 
}) => {
    const [showDollarBalance, setShowDollarBalance] = useState(false);

    const calculateDollarBalance = (balance) => {
        return (balance / dollarRate).toFixed(2);
    };

    return (
        <div className="navbar-container">
            {/* DESKTOP VIEW - Everything in one line */}
            <div className="desktop-nav">
                {/* Logo */}
                <div className="desktop-logo">
                    <div className="platform-brand">
                        <div className="brand-logo-container compact">
                            <div className="candle-ring">
                                <div className="candle green" style={{ transform: 'rotate(0deg) translateY(-20px)' }}></div>
                                <div className="candle red" style={{ transform: 'rotate(60deg) translateY(-20px)' }}></div>
                                <div className="candle green" style={{ transform: 'rotate(120deg) translateY(-20px)' }}></div>
                                <div className="candle red" style={{ transform: 'rotate(180deg) translateY(-20px)' }}></div>
                                <div className="candle green" style={{ transform: 'rotate(240deg) translateY(-20px)' }}></div>
                                <div className="candle red" style={{ transform: 'rotate(300deg) translateY(-20px)' }}></div>
                            </div>
                            <div className="logo-cube-container compact">
                                <div className="cube-3d compact">
                                    <div className="cube-face front"><span className="face-letter">P</span></div>
                                    <div className="cube-face back"><span className="face-letter">2</span></div>
                                    <div className="cube-face right"><span className="face-letter">R</span></div>
                                    <div className="cube-face left"><span className="face-letter">2</span></div>
                                    <div className="cube-face top"><span className="face-letter">R</span></div>
                                    <div className="cube-face bottom"><span className="face-letter">P</span></div>
                                </div>
                            </div>
                            <div className="mini-chart-line"></div>
                        </div>
                        <div className="brand-text">
                            <span className="brand-name">Paper2Real</span>
                            <span className="brand-quote">Learn. Practice. Get Funded.</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs - Centered */}
                <div className="desktop-nav-tabs">
                    <button 
                        className={`desktop-nav-tab ${activeDashboard === 'Challenges' ? 'active' : ''}`}
                        onClick={() => onTabChange('Challenges')}
                    >
                        CHALLENGES
                    </button>
                    <button 
                        className={`desktop-nav-tab ${activeDashboard === 'Market' ? 'active' : ''}`}
                        onClick={() => onTabChange('Market')}
                    >
                        MARKET
                    </button>
                    <button 
                        className={`desktop-nav-tab ${activeDashboard === 'Trading' ? 'active' : ''}`}
                        onClick={() => onTabChange('Trading')}
                    >
                        TRADING
                    </button>
                    <button 
                        className={`desktop-nav-tab ${activeDashboard === 'Profile' ? 'active' : ''}`}
                        onClick={() => onTabChange('Profile')}
                    >
                        PROFILE
                    </button>
                    {userAccount?.role === 'admin' && (
                        <button 
                            className={`desktop-nav-tab ${activeDashboard === 'AdminPanel' ? 'active' : ''}`}
                            onClick={() => onTabChange('AdminPanel')}
                        >
                            ADMIN
                        </button>
                    )}
                </div>

                {/* User Info - Right side */}
                <div className="desktop-user-info">
                    <span className="desktop-user-name">👤 {userAccount?.name || 'User'}</span>
                    <div className="desktop-balance">
                        <span className="desktop-balance-amount">₹{equity?.toFixed(2) || '0'}</span>
                        {showDollarBalance && (
                            <span className="desktop-usd">(${calculateDollarBalance(equity || 0)})</span>
                        )}
                        <button 
                            className="desktop-eye-btn"
                            onClick={() => setShowDollarBalance(!showDollarBalance)}
                            title={showDollarBalance ? 'Hide USD' : 'Show USD'}
                        >
                            {showDollarBalance ? '👁️' : '👁️‍🗨️'}
                        </button>
                        <button 
                            className="desktop-refresh-btn"
                            onClick={onRefresh}
                            title="Refresh balance"
                        >
                            🔄
                        </button>
                    </div>
                    <button onClick={onLogout} className="desktop-logout-btn">
                        Logout
                    </button>
                </div>
            </div>

            {/* MOBILE VIEW - Two lines (keep existing mobile layout) */}
            <div className="mobile-nav">
                {/* Top row - Logo and Wallet */}
                <div className="navbar-top-row">
                    <div className="navbar-left">
                        <div className="platform-brand">
                            <div className="brand-logo-container compact">
                                <div className="candle-ring">
                                    <div className="candle green" style={{ transform: 'rotate(0deg) translateY(-20px)' }}></div>
                                    <div className="candle red" style={{ transform: 'rotate(60deg) translateY(-20px)' }}></div>
                                    <div className="candle green" style={{ transform: 'rotate(120deg) translateY(-20px)' }}></div>
                                    <div className="candle red" style={{ transform: 'rotate(180deg) translateY(-20px)' }}></div>
                                    <div className="candle green" style={{ transform: 'rotate(240deg) translateY(-20px)' }}></div>
                                    <div className="candle red" style={{ transform: 'rotate(300deg) translateY(-20px)' }}></div>
                                </div>
                                <div className="logo-cube-container compact">
                                    <div className="cube-3d compact">
                                        <div className="cube-face front"><span className="face-letter">P</span></div>
                                        <div className="cube-face back"><span className="face-letter">2</span></div>
                                        <div className="cube-face right"><span className="face-letter">R</span></div>
                                        <div className="cube-face left"><span className="face-letter">2</span></div>
                                        <div className="cube-face top"><span className="face-letter">R</span></div>
                                        <div className="cube-face bottom"><span className="face-letter">P</span></div>
                                    </div>
                                </div>
                                <div className="mini-chart-line"></div>
                            </div>
                            <div className="brand-text">
                                <span className="brand-name">Paper2Real</span>
                                <span className="brand-quote">Learn. Practice. Get Funded.</span>
                            </div>
                        </div>
                    </div>

                    <div className="navbar-right">
                        <div className="wallet-section">
                            <div className="balance-display">
                                <span className="balance-label">Balance</span>
                                <span className="balance-amount">₹{equity?.toFixed(2) || '0'}</span>
                                {showDollarBalance && (
                                    <span className="dollar-amount">(${calculateDollarBalance(equity || 0)})</span>
                                )}
                            </div>
                            
                            <div className="action-buttons">
                                <button 
                                    className="action-btn eye-btn"
                                    onClick={() => setShowDollarBalance(!showDollarBalance)}
                                    title={showDollarBalance ? 'Hide USD' : 'Show USD'}
                                >
                                    {showDollarBalance ? '👁️' : '👁️‍🗨️'}
                                </button>
                                
                                <button 
                                    className="action-btn refresh-btn"
                                    onClick={onRefresh}
                                    title="Refresh balance"
                                >
                                    🔄
                                </button>
                                
                                <button onClick={onLogout} className="logout-btn">
                                    <span className="logout-icon">🚪</span>
                                    <span className="logout-text">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom row - Navigation tabs */}
                <div className="navbar-bottom-row">
                    <div className="nav-tabs">
                        <button 
                            className={`nav-tab ${activeDashboard === 'Challenges' ? 'active' : ''}`}
                            onClick={() => onTabChange('Challenges')}
                        >
                            CHALLENGES
                        </button>
                        <button 
                            className={`nav-tab ${activeDashboard === 'Market' ? 'active' : ''}`}
                            onClick={() => onTabChange('Market')}
                        >
                            MARKET
                        </button>
                        <button 
                            className={`nav-tab ${activeDashboard === 'Trading' ? 'active' : ''}`}
                            onClick={() => onTabChange('Trading')}
                        >
                            TRADING
                        </button>
                        <button 
                            className={`nav-tab ${activeDashboard === 'Profile' ? 'active' : ''}`}
                            onClick={() => onTabChange('Profile')}
                        >
                            PROFILE
                        </button>
                        {userAccount?.role === 'admin' && (
                            <button 
                                className={`nav-tab ${activeDashboard === 'AdminPanel' ? 'active' : ''}`}
                                onClick={() => onTabChange('AdminPanel')}
                            >
                                ADMIN
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
