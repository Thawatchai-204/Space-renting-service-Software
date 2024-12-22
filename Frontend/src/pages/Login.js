import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // สำหรับ Redirect
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // เพิ่มสถานะ Loader
  const [errorMessage, setErrorMessage] = useState(''); // ข้อความแสดงข้อผิดพลาด
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setIsLoading(true); // เริ่ม Loader
    setErrorMessage(''); // ล้างข้อความแสดงข้อผิดพลาด

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

        // บันทึกข้อมูลผู้ใช้ใน localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role); // เพิ่ม role ลงใน localStorage
        console.log('Login Response:', data); // ตรวจสอบว่ามี role ใน data หรือไม่
        console.log('Role in LocalStorage:', localStorage.getItem('role'));

        // ตรวจสอบ role แล้ว Redirect
        if (data.username === 'admin@example.com') {
          navigate('/AdminDashboard'); // ไปยัง AdminDashboard
        } else {
          navigate('/home'); // ไปยัง Home สำหรับ user ปกติ
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(`Error logging in: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Error connecting to server. Please try again.');
    } finally {
      setIsLoading(false); // จบ Loader
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h1>Space Renting Service</h1>
        <img
          src="https://i0.wp.com/storage.googleapis.com/fplswordpressblog/2024/04/4-10.png?resize=1024%2C1024&ssl=1"
          alt="Space renting"
        />
      </div>
      <div className="login-right">
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
          <div className="remember-me">
            <input type="checkbox" id="remember-me" />
            <label htmlFor="remember-me">Keep me logged in</label>
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          {errorMessage && <p className="error-message">{errorMessage}</p>} {/* แสดงข้อความ Error */}
        </form>
        <div className="create-account">
          <a href="/register">Create a new account</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
