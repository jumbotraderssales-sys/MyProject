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
            {/* DESKTOP VIEW - Original layout */}
            <div className="desktop-nav">
                {/* Left side - Logo */}
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

                {/* Center - Navigation tabs */}
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

                {/* Right side - User info */}
                <div className="desktop-user-info">
                    <div className="desktop-user-name">
                        <i className="fas fa-user"></i>
                        <span>{userAccount?.name || 'User'}</span>
                    </div>
                    
                    <div className="desktop-user-balance">
                        <div className="desktop-balance">
                            <span className="desktop-balance-label">Balance</span>
                            <span className="desktop-balance-amount">₹{equity?.toFixed(2) || '0'}</span>
                        </div>
                        
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
                        
                        {showDollarBalance && (
                            <span className="desktop-usd">(${calculateDollarBalance(equity || 0)})</span>
                        )}
                    </div>
                    
                    <button onClick={onLogout} className="desktop-logout-btn">
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </div>

            {/* MOBILE VIEW - Two line layout */}
            <div className="mobile-nav">
                {/* Top row - Logo and Wallet */}
                <div className="mobile-top-row">
                    <div className="mobile-left">
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

                    <div className="mobile-right">
                        <div className="mobile-wallet">
                            <span className="mobile-balance">₹{equity?.toFixed(2) || '0'}</span>
                            {showDollarBalance && (
                                <span className="mobile-usd">(${calculateDollarBalance(equity || 0)})</span>
                            )}
                            <button 
                                className="mobile-eye-btn"
                                onClick={() => setShowDollarBalance(!showDollarBalance)}
                            >
                                {showDollarBalance ? '👁️' : '👁️‍🗨️'}
                            </button>
                            <button 
                                className="mobile-refresh-btn"
                                onClick={onRefresh}
                            >
                                🔄
                            </button>
                            <button onClick={onLogout} className="mobile-logout-btn">
                                🚪
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom row - Navigation tabs */}
                <div className="mobile-bottom-row">
                    <div className="mobile-nav-tabs">
                        <button 
                            className={`mobile-nav-tab ${activeDashboard === 'Challenges' ? 'active' : ''}`}
                            onClick={() => onTabChange('Challenges')}
                        >
                            CHALLENGES
                        </button>
                        <button 
                            className={`mobile-nav-tab ${activeDashboard === 'Market' ? 'active' : ''}`}
                            onClick={() => onTabChange('Market')}
                        >
                            MARKET
                        </button>
                        <button 
                            className={`mobile-nav-tab ${activeDashboard === 'Trading' ? 'active' : ''}`}
                            onClick={() => onTabChange('Trading')}
                        >
                            TRADING
                        </button>
                        <button 
                            className={`mobile-nav-tab ${activeDashboard === 'Profile' ? 'active' : ''}`}
                            onClick={() => onTabChange('Profile')}
                        >
                            PROFILE
                        </button>
                        {userAccount?.role === 'admin' && (
                            <button 
                                className={`mobile-nav-tab ${activeDashboard === 'AdminPanel' ? 'active' : ''}`}
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
