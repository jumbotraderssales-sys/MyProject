import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ equity, dollarRate, userAccount, onRefresh, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showDollarBalance, setShowDollarBalance] = useState(false);

    const calculateDollarBalance = (balance) => {
        return (balance / dollarRate).toFixed(2);
    };

    const handleLogout = () => {
        if (onLogout) onLogout();
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userData');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <div className="top-static-user-bar">
            {/* Left side - Logo with P2R Cube */}
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
                <div className="brand-text compact">
                    <span className="brand-name">Paper2Real</span>
                    <span className="brand-quote">Learn. Practice. Get Funded.</span>
                </div>
            </div>

            {/* Center - Navigation tabs */}
            <div className="nav-tabs-container-static">
                <Link to="/" className={`nav-tab-static ${location.pathname === '/' ? 'active' : ''}`}>
                    CHALLENGES
                </Link>
                <Link to="/market" className={`nav-tab-static ${location.pathname === '/market' ? 'active' : ''}`}>
                    MARKET
                </Link>
                <Link to="/trading" className={`nav-tab-static ${location.pathname === '/trading' ? 'active' : ''}`}>
                    TRADING
                </Link>
                <Link to="/profile" className={`nav-tab-static ${location.pathname === '/profile' ? 'active' : ''}`}>
                    PROFILE
                </Link>
                {userAccount?.role === 'admin' && (
                    <Link to="/admin" className={`nav-tab-static ${location.pathname === '/admin' ? 'active' : ''}`}>
                        ADMIN
                    </Link>
                )}
            </div>

            {/* Right side - User info */}
            <div className="static-user-info">
                <div className="static-user-name">
                    <i className="fas fa-user"></i>
                    <span>{userAccount?.name || 'User'}</span>
                </div>
                
                <div className="static-user-balance">
                    <div className="static-balance-currency">
                        <div className="static-balance-label">Paper Balance</div>
                        <div className="static-balance-amount">
                            ₹{equity?.toFixed(2) || '0'}
                            {showDollarBalance && (
                                <>
                                    <span className="balance-separator">|</span>
                                    <span className="usd-balance">(${calculateDollarBalance(equity || 0)})</span>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Eye button for mobile */}
                    <button 
                        className="eye-toggle-btn"
                        onClick={() => setShowDollarBalance(!showDollarBalance)}
                        title={showDollarBalance ? 'Hide USD' : 'Show USD'}
                    >
                        {showDollarBalance ? '👁️' : '👁️‍🗨️'}
                    </button>

                    {/* Refresh button */}
                    <button 
                        className="refresh-balance-btn"
                        onClick={onRefresh}
                        title="Refresh balance"
                    >
                        🔄
                    </button>
                </div>
                
                <button onClick={handleLogout} className="static-logout-btn">
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Navbar;
