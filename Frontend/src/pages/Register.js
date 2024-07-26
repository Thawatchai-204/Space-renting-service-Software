import React from 'react';
import './Register.css';

function Register() {
  return (
    <div className="register-container">
      <div className="left-section">
        <h2>Sign Up</h2>
        <form>
          <input type="email" placeholder="E-mail" required />
          <input type="password" placeholder="Password" required />
          <input type="password" placeholder="Confirm Password" required />
          <select required>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Sign Up</button>
          <a href="/login">Login</a>
        </form>
      </div>
      <div className="right-section">
        <img src="https://d4804za1f1gw.cloudfront.net/wp-content/uploads/sites/60/2023/09/Job-Answers-Lead-Image.png" alt="Space renting service Software" className="logo" />
      </div>
    </div>
  );
}

export default Register;