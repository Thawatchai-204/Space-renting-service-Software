import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LanguageContext } from '../LanguageContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Register.css'; // อัปเดต CSS เพื่อให้สอดคล้องกับ Login

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { language, toggleLanguage } = useContext(LanguageContext);

  const API_BASE_URL = 'http://localhost:5000';

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !role) {
      setErrorMessage(
        language === 'EN'
          ? 'Please provide all required information.'
          : 'กรุณาระบุข้อมูลทั้งหมดที่จำเป็น'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        language === 'EN' ? 'Passwords do not match.' : 'รหัสผ่านไม่ตรงกัน'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, { email, password, role });
      if (response.status === 200 || response.status === 201) {
        toast.success(
          language === 'EN'
            ? 'Registration completed successfully.'
            : 'การลงทะเบียนสำเร็จเรียบร้อยแล้ว'
        );
        setTimeout(() => navigate('/login'), 2000); // Redirect ไปหน้า Login หลัง 2 วินาที
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || (language === 'EN' ? 'An error occurred.' : 'เกิดข้อผิดพลาด');
      setErrorMessage(
        language === 'EN'
          ? `Registration failed: ${errorMsg}`
          : `การลงทะเบียนล้มเหลว: ${
              errorMsg === 'User already exists' ? 'ผู้ใช้นี้มีอยู่แล้ว' : 'ข้อผิดพลาดจากเซิร์ฟเวอร์'
            }`
      );
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page d-flex flex-column min-vh-100">
      <ToastContainer position="top-center" autoClose={3000} />
      <main className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="row w-100 align-items-center">
          {/* Left Section - Form */}
          <div className="col-md-6 d-flex justify-content-center align-items-center">
            <div className="card shadow-sm border-0" style={{ maxWidth: '450px' }}>
              <div className="card-body p-5">
                <h2 className="card-title text-center mb-4 fw-semibold text-primary">
                  {language === 'EN' ? 'Register' : 'ลงทะเบียน'}
                </h2>
                <form onSubmit={handleSignUp}>
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
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label fw-medium text-muted">
                      {language === 'EN' ? 'Confirm Password' : 'ยืนยันรหัสผ่าน'}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={language === 'EN' ? 'Confirm your password' : 'กรุณายืนยันรหัสผ่าน'}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label fw-medium text-muted">
                      {language === 'EN' ? 'Role' : 'บทบาท'}
                    </label>
                    <select
                      className="form-select"
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      disabled={isLoading}
                    >
                      <option value="">{language === 'EN' ? 'Select Role' : 'เลือกบทบาท'}</option>
                      <option value="service_user">{language === 'EN' ? 'Service User' : 'ผู้ใช้บริการ'}</option>
                      <option value="service_provider">{language === 'EN' ? 'Service Provider' : 'ผู้ให้บริการ'}</option>
                    </select>
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
                        {language === 'EN' ? 'Registering...' : 'กำลังลงทะเบียน...'}
                      </>
                    ) : (
                      language === 'EN' ? 'Register' : 'ลงทะเบียน'
                    )}
                  </button>
                </form>
                <div className="text-center mt-3">
                  <p className="text-muted mb-0">
                    {language === 'EN' ? 'Already have an account?' : 'มีบัญชีผู้ใช้อยู่แล้ว?'}{' '}
                    <a href="/login" className="text-primary fw-medium text-decoration-none">
                      {language === 'EN' ? 'Sign In' : 'ลงชื่อเข้าใช้'}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Image */}
          <div className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center text-center">
            <h1 className="display-5 fw-semibold mb-4 text-primary">
              {language === 'EN' ? 'Space Rental Management System' : 'ระบบการจัดการเช่าพื้นที่'}
            </h1>
            <img
              src="https://d4804za1f1gw.cloudfront.net/wp-content/uploads/sites/60/2023/09/Job-Answers-Lead-Image.png"
              alt={language === 'EN' ? 'Space Rental Illustration' : 'ภาพประกอบการเช่าพื้นที่'}
              className="img-fluid"
              style={{ maxWidth: '350px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
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

export default SignUp;