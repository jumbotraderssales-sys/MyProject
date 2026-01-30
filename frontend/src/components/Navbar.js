import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAdmin = localStorage.getItem('role') === 'admin';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userData');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo/Brand */}
                <div className="navbar-brand">
                    <Link to="/">
                        <i className="fas fa-chart-line"></i>
                        <span>Trading Platform</span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="navbar-links">
                    <Link 
                        to="/" 
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        <i className="fas fa-home"></i>
                        <span>Dashboard</span>
                    </Link>
                    
                    <Link 
                        to="/account-setup" 
                        className={`nav-link ${location.pathname === '/account-setup' ? 'active' : ''}`}
                    >
                        <i className="fas fa-university"></i>
                        <span>Bank Account</span>
                    </Link>
                    
                    <Link 
                        to="/withdrawal" 
                        className={`nav-link ${location.pathname === '/withdrawal' ? 'active' : ''}`}
                    >
                        <i className="fas fa-money-check-alt"></i>
                        <span>Withdraw</span>
                    </Link>
                    
                    <Link 
                        to="/withdrawal-history" 
                        className={`nav-link ${location.pathname === '/withdrawal-history' ? 'active' : ''}`}
                    >
                        <i className="fas fa-history"></i>
                        <span>History</span>
                    </Link>
                    
                    {/* Admin link - only show for admins */}
                    {isAdmin && (
                        <Link 
                            to="/admin/withdrawals" 
                            className={`nav-link ${location.pathname === '/admin/withdrawals' ? 'active' : ''}`}
                        >
                            <i className="fas fa-user-shield"></i>
                            <span>Admin Panel</span>
                        </Link>
                    )}
                </div>

                {/* User profile and logout */}
                <div className="navbar-user">
                    <div className="user-profile">
                        <i className="fas fa-user-circle"></i>
                        <span>{localStorage.getItem('username') || 'User'}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;