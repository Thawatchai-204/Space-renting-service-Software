import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LanguageContext } from '../LanguageContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css'; // อัปเดต CSS เพื่อใช้สีที่เป็นทางการ

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { language, toggleLanguage } = useContext(LanguageContext);

  const API_BASE_URL = 'http://localhost:5000';

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage(
        language === 'EN'
          ? 'Please provide both email and password.'
          : 'กรุณาระบุทั้งอีเมลและรหัสผ่าน'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      const { token, userId, username, role } = response.data;

      localStorage.setItem('token', token || '');
      localStorage.setItem('userId', userId || '');
      localStorage.setItem('username', username || '');
      localStorage.setItem('role', role || 'user');

      toast.success(
        language === 'EN'
          ? 'You have successfully logged in.'
          : 'คุณได้เข้าสู่ระบบเรียบร้อยแล้ว'
      );

      const userRole = (role || 'user').toLowerCase();
      navigate(userRole === 'admin' ? '/AdminDashboard' : '/Home', { replace: true });
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || (language === 'EN' ? 'An error occurred.' : 'เกิดข้อผิดพลาด');
      setErrorMessage(
        language === 'EN'
          ? `Authentication failed: ${errorMsg}`
          : `การยืนยันตัวตนล้มเหลว: ${
              errorMsg === 'User not found'
                ? 'ไม่พบผู้ใช้งาน'
                : errorMsg === 'Invalid credentials'
                ? 'ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง'
                : 'ข้อผิดพลาดจากเซิร์ฟเวอร์'
            }`
      );
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page d-flex flex-column min-vh-100">
      <ToastContainer position="top-center" autoClose={3000} />
      <main className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="row w-100 align-items-center">
          {/* Left Section */}
          <div className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center text-center">
            <h1 className="display-5 fw-semibold mb-4 text-primary">
              {language === 'EN' ? 'Space Rental Management System' : 'ระบบการจัดการเช่าพื้นที่'}
            </h1>
            <img
              src="https://i0.wp.com/storage.googleapis.com/fplswordpressblog/2024/04/4-10.png?resize=1024%2C1024&ssl=1"
              alt={language === 'EN' ? 'Space Rental Illustration' : 'ภาพประกอบการเช่าพื้นที่'}
              className="img-fluid"
              style={{ maxWidth: '350px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </div>

          {/* Right Section - ฟอร์มล็อกอิน */}
          <div className="col-md-6 d-flex justify-content-center align-items-center">
            <div className="card shadow-sm border-0" style={{ maxWidth: '450px' }}>
              <div className="card-body p-5">
                <h2 className="card-title text-center mb-4 fw-semibold text-primary">
                  {language === 'EN' ? 'Sign In' : 'ลงชื่อเข้าใช้'}
                </h2>
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium text-muted">
                      {language === 'EN' ? 'Email Address' : 'ที่อยู่อีเมล'}
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={language === 'EN' ? 'Enter your email address' : 'กรุณาระบุที่อยู่อีเมล'}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-medium text-muted">
                      {language === 'EN' ? 'Password' : 'รหัสผ่าน'}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={language === 'EN' ? 'Enter your password' : 'กรุณาระบุรหัสผ่าน'}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {errorMessage && (
                    <div className="alert alert-danger mb-3" role="alert">
                      {errorMessage}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {language === 'EN' ? 'Signing in...' : 'กำลังลงชื่อเข้าใช้...'}
                      </>
                    ) : (
                      language === 'EN' ? 'Sign In' : 'ลงชื่อเข้าใช้'
                    )}
                  </button>
                </form>
                <div className="text-center mt-3">
                  <p className="text-muted mb-0">
                    {language === 'EN' ? 'Not registered yet?' : 'ยังไม่ได้ลงทะเบียนใช่หรือไม่?'}{' '}
                    <a href="/register" className="text-primary fw-medium text-decoration-none">
                      {language === 'EN' ? 'Create an Account' : 'สร้างบัญชีผู้ใช้'}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer py-4">
        <div className="container text-center">
          <img
            src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/refs/heads/main/Screenshot%20202024-07-26%2020013811.png"
            alt="System Logo"
            width="100"
            className="mb-3"
          />
          <p className="mb-2 text-light">
            © 2025 {language === 'EN' ? 'Space Rental Management System. All rights reserved.' : 'ระบบการจัดการเช่าพื้นที่ สงวนลิขสิทธิ์'}
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button onClick={() => toggleLanguage('EN')} className="btn btn-outline-light btn-sm">
              English
            </button>
            <button onClick={() => toggleLanguage('TH')} className="btn btn-outline-light btn-sm">
              ภาษาไทย
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Login;