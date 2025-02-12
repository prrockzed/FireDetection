import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import MQTTLogs from './components/MQTTLogs';
import Navbar from './components/Navbar';
import './components/style.css';

const App = () => {
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [showRegister, setShowRegister] = useState(false);

    return (
        <div>
            {loggedInUser ? (
                <>
                    <Navbar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
                    <MQTTLogs />
                </>
            ) : (
                <div className="auth-container">
                    {showRegister ? (
                        <Register setShowRegister={setShowRegister} />
                    ) : (
                        <Login setLoggedInUser={setLoggedInUser} setShowRegister={setShowRegister} />
                    )}
                </div>
            )}
        </div>
    );
};

export default App;
