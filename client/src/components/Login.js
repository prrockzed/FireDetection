import React, { useState } from 'react';
import axios from 'axios';
import './style.css';

const Login = ({ setLoggedInUser, setShowRegister }) => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [message, setMessage] = useState("");

    const { username, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://firedetection-server.onrender.com/api/auth/login', {
                username,
                password
            });
            localStorage.setItem('token', res.data.token);
            setLoggedInUser(username);
            setMessage('Logged in successfully');
        } catch (err) {
            console.error('Login error:', err);
            let errorMessage = 'Failed to login';
            
            if (err.response) {
                // The request was made and the server responded with a status code
                if (err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else {
                    errorMessage = err.response.statusText || 'Invalid credentials';
                }
            } else if (err.request) {
                // The request was made but no response was received
                errorMessage = 'No response from server';
            } else {
                // Something happened in setting up the request
                errorMessage = 'Login request failed';
            }
            
            setMessage(errorMessage);
        }
    };

    return (
        <div className="auth-form">
            <h2>Login</h2>
            <form onSubmit={onSubmit}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    name="username" 
                    value={username} 
                    onChange={onChange} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    name="password" 
                    value={password} 
                    onChange={onChange} 
                    required 
                />
                <button type="submit">Login</button>
            </form>
            <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                {message}
            </p>
            <p className="toggle-link">
                Not registered already?{' '}
                <span onClick={() => setShowRegister(true)}>Register now</span>
            </p>
        </div>
    );
};

export default Login;
