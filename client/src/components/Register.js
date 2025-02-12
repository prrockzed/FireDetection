import React, { useState } from 'react';
import axios from 'axios';
import './style.css';

const Register = ({ setShowRegister }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [message, setMessage] = useState('');

    const { username, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8080/api/auth/register', {
                username,
                password
            });
            setMessage('Registered successfully');
        } catch (err) {
            console.error(err.response.data);
            setMessage('Failed to register, User already exists');
        }
    };

    return (
        <div className="auth-form">
            <h2>Register</h2>
            <form onSubmit={onSubmit}>
                <input type="text" placeholder="Username" name="username" value={username} onChange={onChange} required />
                <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required />
                <button type="submit">Register</button>
            </form>
            <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>
            <p className="toggle-link">
                Already registered?{' '}
                <span onClick={() => setShowRegister(false)}>Login now</span>
            </p>
        </div>
    );
};

export default Register;
