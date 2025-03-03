import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Settings.css'; // สร้างไฟล์ CSS สำหรับหน้า Settings
import { FaHome, FaUsers, FaCog, FaSignOutAlt, FaBell, FaTrash, FaPlus, FaList } from 'react-icons/fa'; // เพิ่ม FaPlus และ FaList
import { LanguageContext } from '../../../LanguageContext'; // ตรวจสอบเส้นทางนำเข้า
import axios from 'axios'; // นำเข้า axios

function Settings() {
    const { language, toggleLanguage } = useContext(LanguageContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState(''); // เพิ่ม state สำหรับชื่อผู้ใช้
    const [walletBalance, setWalletBalance] = useState(0); // เพิ่ม state สำหรับยอดเงินใน Wallet
    const navigate = useNavigate();

    // ดึงข้อมูลชื่อผู้ใช้และยอดเงินใน Wallet เมื่อคอมโพเนนต์โหลด
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedUserId = localStorage.getItem('userId');

        if (storedUsername) {
            setUsername(storedUsername);
        }

        if (storedUserId) {
            fetchWalletBalance(storedUserId);
        }
    }, []);

    // ฟังก์ชันดึงยอดเงินใน Wallet
    const fetchWalletBalance = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/wallet/${userId}`);
            setWalletBalance(response.data.balance || 0);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        }
    };

    // ฟังก์ชันสำหรับสลับบทบาท
    const handleSwitchRole = () => {
        navigate('/Service_provider/home'); // เปลี่ยนเส้นทางไปยังหน้า Service Provider
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            alert(language === 'EN' ? 'Please fill in all fields.' : 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        try {
            const response = await axios.post('/api/change-password', {
                currentPassword,
                newPassword,
            });
            if (response.data.success) {
                alert(language === 'EN' ? 'Password changed successfully!' : 'เปลี่ยนรหัสผ่านสำเร็จ');
            } else {
                alert(response.data.message || 'Failed to change password.');
            }
        } catch (error) {
            console.error('Failed to change password:', error);
            alert(language === 'EN' ? 'Failed to change password.' : 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirmEmail || !confirmPassword) {
            alert(language === 'EN' ? 'Please fill in all fields.' : 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        try {
            const response = await axios.post('/api/delete-account', {
                confirmEmail,
                confirmPassword,
            });
            if (response.data.success) {
                alert(language === 'EN' ? 'Account deleted successfully!' : 'ลบบัญชีสำเร็จ');
                navigate('/login');
            } else {
                alert(response.data.message || 'Failed to delete account.');
            }
        } catch (error) {
            console.error('Failed to delete account:', error);
            alert(language === 'EN' ? 'Failed to delete account.' : 'ลบบัญชีไม่สำเร็จ');
        }
    };

    return (
        <div className="container-fluid">
            {/* Fixed Top Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm">
                <div className="container-fluid">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link" href="/Home"><FaHome className="me-2" /> {language === 'EN' ? 'Home' : 'หน้าหลัก'}</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/Addspace"><FaPlus className="me-2" /> {language === 'EN' ? 'Add Space' : 'เพิ่มพื้นที่'}</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/Managespace"><FaList className="me-2" /> {language === 'EN' ? 'Manage Space' : 'จัดการพื้นที่'}</a>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link btn btn-link" onClick={handleSwitchRole}><FaUsers className="me-2" /> {language === 'EN' ? 'Switch Role' : 'เปลี่ยนบทบาท'}</button>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/Settings"><FaCog className="me-2" /> {language === 'EN' ? 'Settings' : 'ตั้งค่า'}</a>
                            </li>
                        </ul>
                        <div className="d-flex align-items-center gap-3">
                            <a href="/Profile" className="text-decoration-none text-light">{username || 'User'}</a> {/* แสดงชื่อผู้ใช้ */}
                            <a href="/Wallet" className="btn btn-outline-light btn-sm"><FaBell className="me-2" /> {language === 'EN' ? 'Wallet' : 'กระเป๋าเงิน'}: {walletBalance} THB</a> {/* แสดงยอดเงินใน Wallet */}
                            <a href="/login" className="btn btn-danger btn-sm"><FaSignOutAlt className="me-2" /> {language === 'EN' ? 'Logout' : 'ออกจากระบบ'}</a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container-fluid mt-5 pt-4">
                <header className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="fw-bold">{language === 'EN' ? 'Settings' : 'ตั้งค่า'}</h1>
                </header>

                {/* Change Password and Delete Account Sections */}
                <div className="row">
                    {/* Change Password Section */}
                    <div className="col-md-6 mb-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h2 className="fw-bold">{language === 'EN' ? 'Change Password' : 'เปลี่ยนรหัสผ่าน'}</h2>
                                <div className="mb-3">
                                    <label className="form-label">{language === 'EN' ? 'Current Password' : 'รหัสผ่านปัจจุบัน'}</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">{language === 'EN' ? 'New Password' : 'รหัสผ่านใหม่'}</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <button className="btn btn-primary w-100" onClick={handleChangePassword}>
                                    {language === 'EN' ? 'Change Password' : 'เปลี่ยนรหัสผ่าน'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Delete Account Section */}
                    <div className="col-md-6 mb-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h2 className="fw-bold text-danger">{language === 'EN' ? 'Delete Account' : 'ลบบัญชี'}</h2>
                                <div className="mb-3">
                                    <label className="form-label">{language === 'EN' ? 'Confirm Email' : 'ยืนยันอีเมล'}</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={confirmEmail}
                                        onChange={(e) => setConfirmEmail(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">{language === 'EN' ? 'Confirm Password' : 'ยืนยันรหัสผ่าน'}</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                <p className="text-danger">
                                    <FaTrash className="me-2" />
                                    {language === 'EN' ? 'Warning: This action will permanently delete this account.' : 'คำเตือน: การดำเนินการนี้จะลบบัญชีของคุณอย่างถาวร'}
                                </p>
                                <button className="btn btn-danger w-100" onClick={handleDeleteAccount}>
                                    {language === 'EN' ? 'Delete Account' : 'ลบบัญชี'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer with Logo and Language Toggle */}
            <footer className="bg-dark text-light py-4 mt-5">
                <div className="container text-center">
                    <img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/refs/heads/main/Screenshot%20202024-07-26%2020013811.png" alt="Logo" width="100" />
                    <p className="mt-3">© 2023 {language === 'EN' ? 'All rights reserved.' : 'สงวนลิขสิทธิ์'}</p>
                    <div className="mt-2">
                        <button
                            onClick={() => toggleLanguage('EN')}
                            className="btn btn-link text-light"
                        >
                            🇺🇸
                        </button>
                        <button
                            onClick={() => toggleLanguage('TH')}
                            className="btn btn-link text-light"
                        >
                            🇹🇭
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Settings;