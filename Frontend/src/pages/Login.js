import React, { useState } from 'react';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); // Save JWT token in local storage
        alert('Login successful');
        // Redirect to home or another page
        window.location.href = '/home';
      } else {
        const errorData = await response.json();
        alert(`Error logging in: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error logging in');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h1>Space renting service Software</h1>
        <img src="https://i0.wp.com/storage.googleapis.com/fplswordpressblog/2024/04/4-10.png?resize=1024%2C1024&ssl=1" alt="Space renting" />
      </div>
      <div className="login-right">
        <a href="/home">Skip</a>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="social-login">
            <button type="button" className="social-button facebook">Facebook</button>
            <button type="button" className="social-button google">Gmail</button>
            <button type="button" className="social-button apple">Apple</button>
            <button type="button" className="social-button line">LINE</button>
          </div>
          <div className="remember-me">
            <input type="checkbox" id="remember-me" />
            <label htmlFor="remember-me">Keep a record of my usage</label>
          </div>
          <div className="forgot-password">
            <a href="/forgot-password">Forget password</a>
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <div className="create-account">
          <a href="/register">Create a new account</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
