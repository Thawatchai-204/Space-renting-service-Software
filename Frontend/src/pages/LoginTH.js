import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginTH.css';

function LoginTH() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('กรุณากรอกทั้งอีเมลและรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

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
        console.log('Full Login Response:', data); // Debug: ดูข้อมูลทั้งหมดที่ backend ส่งมา

        // บันทึกข้อมูลลง localStorage
        localStorage.setItem('token', data.token || '');
        localStorage.setItem('userId', data.userId || '');
        localStorage.setItem('username', data.username || '');
        localStorage.setItem('role', data.role || '');

        // Debug: ดูข้อมูลที่บันทึกใน localStorage
        console.log('Stored in localStorage:', {
          token: localStorage.getItem('token'),
          userId: localStorage.getItem('userId'),
          username: localStorage.getItem('username'),
          role: localStorage.getItem('role'),
        });

        // เงื่อนไขการ redirect
        const userRole = data.role ? data.role.toLowerCase() : '';
        const userEmail = data.username ? data.username.toLowerCase() : '';

        if (userRole === 'admin' || userEmail === 'admin@example.com') {
          console.log('Redirecting to /AdminDashboard');
          navigate('/AdminDashboard');
        } else {
          console.log('Redirecting to /Home');
          navigate('/Home');
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(`เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h1>บริการเช่าพื้นที่</h1>
        <img
          src="https://i0.wp.com/storage.googleapis.com/fplswordpressblog/2024/04/4-10.png?resize=1024%2C1024&ssl=1"
          alt="การเช่าพื้นที่"
        />
      </div>
      <div className="login-right">
        <h1>เข้าสู่ระบบ</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">อีเมล</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">รหัสผ่าน</label>
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
            <label htmlFor="remember-me">คงสถานะการเข้าสู่ระบบ</label>
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
        <div className="create-account">
          <a href="/registerTH">สร้างบัญชีใหม่</a>
        </div>
      </div>
    </div>
  );
}

export default LoginTH;