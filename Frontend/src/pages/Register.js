  import React, { useState } from 'react';
  import './Register.css';

  function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, role }),
        });

        if (response.ok) {
          alert('User registered successfully');
        } else {
          alert('Error registering user');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error registering user');
      }
    };

    return (
      <div className="register-container">
        <div className="left-section">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="E-mail" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              required
            >
              <option value="">Select</option>
              <option value="service_user">Service user</option>
              <option value="service_provider">Service provider</option>
            </select>
            <button type="submit">Sign Up</button>
            <a href="/login">Login</a>
          </form>
        </div>
        <div className="right-section">
          <img 
            src="https://d4804za1f1gw.cloudfront.net/wp-content/uploads/sites/60/2023/09/Job-Answers-Lead-Image.png" 
            alt="Space renting service Software" 
            className="logo" 
          />
        </div>
      </div>
    );
  }

  export default Register;
