import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAdmin = localStorage.getItem('role') === 'admin';

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const username = userData.username || localStorage.getItem('username') || 'User';
    const paperBalance = userData.paperBalance || 0;
    const usdBalance = userData.usdBalance || 0;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userData');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const formatBalance = (balance) => {
        return parseFloat(balance).toFixed(3);
    };

    return (
        <div className="top-static-user-bar">
            {/* Left side - Navigation tabs */}
            <div className="nav-tabs-container-static">
                <Link 
                    to="/" 
                    className={`nav-tab-static ${location.pathname === '/' ? 'active' : ''}`}
                >
                    HOME
                </Link>
                
                <Link 
                    to="/market" 
                    className={`nav-tab-static ${location.pathname === '/market' ? 'active' : ''}`}
                >
                    MARKET
                </Link>
                
                <Link 
                    to="/trading" 
                    className={`nav-tab-static ${location.pathname === '/trading' ? 'active' : ''}`}
                >
                    TRADING
                </Link>
                
                <Link 
                    to="/profile" 
                    className={`nav-tab-static ${location.pathname === '/profile' ? 'active' : ''}`}
                >
                    PROFILE
                </Link>
            </div>

            {/* Right side - User info, balance, and logout */}
            <div className="static-user-info">
                <div className="static-user-name">
                    <i className="fas fa-user"></i>
                    <span>{username}</span>
                </div>
                
                <div className="static-user-balance">
                    <div className="static-balance-currency">
                        <div className="static-balance-label">Paper Balance</div>
                        <div className="static-balance-amount">
                            {formatBalance(paperBalance)} <span className="balance-separator">|</span> 
                            <span className="usd-balance">(${formatBalance(usdBalance)})</span>
                        </div>
                    </div>
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
