import React from 'react';
import './style.css';

const Navbar = ({ loggedInUser, setLoggedInUser }) => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        setLoggedInUser(null);
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                Welcome, {loggedInUser}
            </div>
            <div className="navbar-right">
                <span onClick={handleLogout} className="logout-link">Logout</span>
            </div>
        </nav>
    );
};

export default Navbar;
