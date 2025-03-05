import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminSettings.css';
import { FaHome, FaUsers, FaFileAlt, FaCog, FaSignOutAlt, FaHistory, FaBell, FaTrash } from 'react-icons/fa';
import { LanguageContext } from '../../../LanguageContext';
import axios from 'axios';
import { CSSTransition } from 'react-transition-group';
import 'animate.css';

function Settings() {
    const { language, toggleLanguage } = useContext(LanguageContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);
    const [reservations, setReservations] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [agreeToDelete, setAgreeToDelete] = useState(false);
    const navigate = useNavigate();

    // ตั้งค่า axios headers ด้วย token
    const setupAxiosAuth = () => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
            navigate('/login');
        }
    };

    useEffect(() => {
        setupAxiosAuth();

        const storedUsername = localStorage.getItem('username');
        const storedUserId = localStorage.getItem('userId');

        if (storedUserId) {
            setUsername(storedUsername || 'Admin');
            fetchWalletBalance(storedUserId);
            fetchReservations(storedUserId);
        } else {
            console.error('User ID not found in localStorage. Redirecting to login...');
            navigate('/login');
        }
    }, [navigate]);

    const fetchWalletBalance = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/wallet/${userId}`);
            setWalletBalance(response.data.balance || 0);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
            setWalletBalance(0);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        }
    };

    const fetchReservations = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/reservations/${userId}`);
            setReservations(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching reservations:', error);
            setReservations([]);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleSwitchRole = () => {
        navigate('/Service_provider/home');
    };

    const handleChangePassword = async () => {
        setError(''); setSuccess('');
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setError(language === 'EN' ? 'Please fill in all fields.' : 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError(language === 'EN' ? 'New passwords do not match.' : 'รหัสผ่านใหม่ไม่ตรงกัน');
            return;
        }
        if (newPassword.length < 6) {
            setError(language === 'EN' ? 'Password must be at least 6 characters.' : 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        try {
            const userId = localStorage.getItem('userId');
            const response = await axios.post(
                'http://localhost:5000/api/change-password',
                { userId, currentPassword, newPassword }
            );

            if (response.data.success) {
                setSuccess(language === 'EN' ? 'Password changed successfully!' : 'เปลี่ยนรหัสผ่านสำเร็จ');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setError(error.response?.data?.message || (language === 'EN' ? 'Failed to change password.' : 'เปลี่ยนรหัสผ่านไม่สำเร็จ'));
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleDeleteAccount = async () => {
        setError(''); setSuccess('');
        if (!agreeToDelete) {
            setError(language === 'EN' ? 'Please agree to the terms before deleting.' : 'กรุณายอมรับเงื่อนไขก่อนลบ');
            return;
        }
        if (!confirmEmail || !confirmPassword) {
            setError(language === 'EN' ? 'Please fill in all fields.' : 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            const userId = localStorage.getItem('userId');
            const response = await axios.post(
                'http://localhost:5000/api/delete-account',
                { userId, email: confirmEmail, password: confirmPassword }
            );

            if (response.data.success) {
                setSuccess(language === 'EN' ? 'Account deleted successfully!' : 'ลบบัญชีสำเร็จ');
                setTimeout(() => {
                    localStorage.clear();
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            setError(error.response?.data?.message || (language === 'EN' ? 'Failed to delete account.' : 'ลบบัญชีไม่สำเร็จ'));
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleUsers = () => {
        navigate('/AdminUsers');
    };

    const handleRequest = () => {
        navigate('/AdminRequests');
    };

    const activeReservations = reservations.filter(res => new Date(`${res.endDate}T${res.endTime}`) > new Date());

    return (
        <div className="container-fluid" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm">
                <div className="container">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link" href="/AdminDashboard"><FaHome className="me-2" /> {language === 'EN' ? 'Home' : 'หน้าหลัก'}</a>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link btn btn-link" onClick={handleUsers}><FaUsers className="me-2" /> {language === 'EN' ? 'Users' : 'ผู้ใช้'}</button>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link btn btn-link" onClick={handleRequest}><FaFileAlt className="me-2" /> {language === 'EN' ? 'Request' : 'คำขอ'}</button>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link active" href="/AdminSettings"><FaCog className="me-2" /> {language === 'EN' ? 'Settings' : 'ตั้งค่า'}</a>
                            </li>
                        </ul>
                        <div className="d-flex align-items-center gap-3">
                            <a href="/AdminProfile" className="text-decoration-none text-light">{username || 'Admin'}</a>
                            <a href="/AdminTransactions" className="btn btn-outline-light btn-sm">
                                <FaHistory className="me-2" /> {language === 'EN' ? 'Transaction' : 'ธุรกรรม'}
                            </a>
                            <button onClick={handleLogout} className="btn btn-danger btn-sm"><FaSignOutAlt className="me-2" /> {language === 'EN' ? 'Logout' : 'ออกจากระบบ'}</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mt-5 pt-5">
                <h1 className="text-center mb-5 fw-bold" style={{ color: '#343a40' }}>{language === 'EN' ? 'Settings' : 'ตั้งค่า'}</h1>

                <div className="row justify-content-center">
                    {/* Change Password */}
                    <div className="col-lg-5 col-md-6 mb-4">
                        <div className="card shadow-lg border-0" style={{ borderRadius: '15px' }}>
                            <div className="card-body p-4">
                                <h2 className="fw-bold mb-4" style={{ color: '#007bff' }}>{language === 'EN' ? 'Change Password' : 'เปลี่ยนรหัสผ่าน'}</h2>
                                <div className="mb-3">
                                    <label className="form-label fw-medium">{language === 'EN' ? 'Current Password' : 'รหัสผ่านปัจจุบัน'}</label>
                                    <input type="password" className="form-control shadow-sm" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-medium">{language === 'EN' ? 'New Password' : 'รหัสผ่านใหม่'}</label>
                                    <input type="password" className="form-control shadow-sm" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-medium">{language === 'EN' ? 'Confirm New Password' : 'ยืนยันรหัสผ่านใหม่'}</label>
                                    <input type="password" className="form-control shadow-sm" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                                </div>
                                <button className="btn btn-primary w-100 shadow" onClick={handleChangePassword}>
                                    {language === 'EN' ? 'Change Password' : 'เปลี่ยนรหัสผ่าน'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Delete Account */}
                    <div className="col-lg-5 col-md-6 mb-4">
                        <div className="card shadow-lg border-0" style={{ borderRadius: '15px' }}>
                            <div className="card-body p-4">
                                <h2 className="fw-bold mb-4 text-danger">{language === 'EN' ? 'Delete Account' : 'ลบบัญชี'}</h2>
                                <div className="mb-3">
                                    <label className="form-label fw-medium">{language === 'EN' ? 'Confirm Email' : 'ยืนยันอีเมล'}</label>
                                    <input type="email" className="form-control shadow-sm" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-medium">{language === 'EN' ? 'Confirm Password' : 'ยืนยันรหัสผ่าน'}</label>
                                    <input type="password" className="form-control shadow-sm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                </div>
                                <button className="btn btn-outline-danger w-100 mb-3" onClick={() => setShowDeleteConfirm(true)}>
                                    {language === 'EN' ? 'Delete Account' : 'ลบบัญชี'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success/Error Messages */}
                <CSSTransition in={!!success} timeout={500} classNames="fade" unmountOnExit>
                    <div className="alert alert-success mt-4 text-center animate__animated animate__bounceIn">
                        {success}
                    </div>
                </CSSTransition>
                <CSSTransition in={!!error} timeout={500} classNames="fade" unmountOnExit>
                    <div className="alert alert-danger mt-4 text-center animate__animated animate__shakeX">
                        {error}
                    </div>
                </CSSTransition>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">{language === 'EN' ? 'Confirm Account Deletion' : 'ยืนยันการลบบัญชี'}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteConfirm(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-danger fw-bold">{language === 'EN' ? 'Warning: This action cannot be undone!' : 'คำเตือน: การดำเนินการนี้ไม่สามารถย้อนกลับได้!'}</p>
                                {activeReservations.length > 0 && (
                                    <div className="alert alert-warning">
                                        <p>{language === 'EN' ? 'You have active reservations:' : 'คุณมีการจองที่ยังใช้งานอยู่:'}</p>
                                        <ul>
                                            {activeReservations.map(res => (
                                                <li key={res._id}>{res.spaceName} ({res.startDate} - {res.endDate})</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {walletBalance > 0 && (
                                    <div className="alert alert-warning">
                                        {language === 'EN' 
                                            ? `You have ${walletBalance} THB remaining in your wallet.` 
                                            : `คุณมียอดเงินคงเหลือ ${walletBalance} บาทในกระเป๋าเงิน`}
                                    </div>
                                )}
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="agreeDelete"
                                        checked={agreeToDelete}
                                        onChange={(e) => setAgreeToDelete(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="agreeDelete">
                                        {language === 'EN' 
                                            ? 'I understand and agree to permanently delete my account' 
                                            : 'ฉันเข้าใจและยอมรับที่จะลบบัญชีของฉันอย่างถาวร'}
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                                    {language === 'EN' ? 'Cancel' : 'ยกเลิก'}
                                </button>
                                <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={!agreeToDelete}>
                                    {language === 'EN' ? 'Delete' : 'ลบ'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-dark text-light py-4 mt-5">
                <div className="container text-center">
                    <img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/refs/heads/main/Screenshot%20202024-07-26%2020013811.png" alt="Logo" width="100" />
                    <p className="mt-3">© 2023 {language === 'EN' ? 'All rights reserved.' : 'สงวนลิขสิทธิ์'}</p>
                    <div className="mt-2">
                        <button onClick={() => toggleLanguage('EN')} className="btn btn-link text-light">🇺🇸</button>
                        <button onClick={() => toggleLanguage('TH')} className="btn btn-link text-light">🇹🇭</button>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Settings;