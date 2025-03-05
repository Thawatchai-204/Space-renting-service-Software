import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Profile.css';
import { FaHome, FaUsers, FaCog, FaSignOutAlt, FaBell, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera, FaFacebook, FaLine, FaIdCard } from 'react-icons/fa';
import axios from 'axios';
import { LanguageContext } from '../../../LanguageContext';

function Profile() {
    const { language, toggleLanguage } = useContext(LanguageContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [facebook, setFacebook] = useState('');
    const [line, setLine] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userId, setUserId] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [idCardImage, setIdCardImage] = useState(null);
    const [idCardPreview, setIdCardPreview] = useState('');
    const [idCardStatus, setIdCardStatus] = useState('not_verified');
    const [walletBalance, setWalletBalance] = useState(0);

    const navigate = useNavigate();

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

        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
            fetchUserProfile(storedUserId);
            fetchWalletBalance(storedUserId);
        } else {
            console.error('User ID not found in localStorage');
            navigate('/login');
        }
    }, [navigate]);

    const fetchUserProfile = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
            const userData = response.data;
            // อัปเดต state ด้วยข้อมูลจาก backend
            setUsername(userData.username || '');
            setEmail(userData.email || '');
            setPhone(userData.phone || '');
            setAddress(userData.address || '');
            setFacebook(userData.facebook || '');
            setLine(userData.line || '');
            setImagePreview(userData.profileImage 
                ? `http://localhost:5000/uploads/${userData.profileImage}?t=${new Date().getTime()}` 
                : 'https://via.placeholder.com/150');
            setIdCardPreview(userData.idCardImage 
                ? `http://localhost:5000/uploads/${userData.idCardImage}?t=${new Date().getTime()}` 
                : 'https://via.placeholder.com/150x100');
            setIdCardStatus(userData.idCardStatus || 'not_verified');
            // บันทึก username ลง localStorage
            localStorage.setItem('username', userData.username || '');
        } catch (error) {
            console.error('Error fetching user profile:', error);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        }
    };

    const fetchWalletBalance = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/wallet/${userId}`);
            setWalletBalance(response.data.balance || 0);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleUpdateProfile = async () => {
        if (!confirmPassword) {
            alert(language === 'EN' ? 'Please enter your password to confirm.' : 'กรุณากรอกรหัสผ่านเพื่อยืนยัน');
            return;
        }

        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('address', address);
        formData.append('facebook', facebook);
        formData.append('line', line);
        formData.append('confirmPassword', confirmPassword);
        if (profileImage) formData.append('profileImage', profileImage);
        if (idCardImage) formData.append('idCardImage', idCardImage);

        try {
            const response = await axios.put(`http://localhost:5000/api/user/${userId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                alert(language === 'EN' 
                    ? 'Profile updated successfully! ID card verification pending admin approval.' 
                    : 'อัพเดทโปรไฟล์สำเร็จ! การยืนยันบัตรประชาชนรอการอนุมัติจากแอดมิน');
                localStorage.setItem('username', username);
                
                const timestamp = new Date().getTime();
                if (response.data.profileImage) {
                    setImagePreview(`http://localhost:5000/uploads/${response.data.profileImage}?t=${timestamp}`);
                }
                if (response.data.idCardImage) {
                    setIdCardPreview(`http://localhost:5000/uploads/${response.data.idCardImage}?t=${timestamp}`);
                }
                
                setIdCardStatus(response.data.idCardStatus || 'pending');
                setConfirmPassword('');
                setProfileImage(null);
                setIdCardImage(null);
                fetchUserProfile(userId); // รีเฟรชข้อมูลล่าสุด
            } else {
                alert(response.data.message || (language === 'EN' ? 'Failed to update profile.' : 'อัพเดทโปรไฟล์ไม่สำเร็จ'));
            }
        } catch (error) {
            console.error('Failed to update profile:', error.response ? error.response.data : error.message);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            } else {
                alert(error.response?.data?.message || (language === 'EN' ? 'Failed to update profile.' : 'อัพเดทโปรไฟล์ไม่สำเร็จ'));
            }
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleIdCardChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIdCardImage(file);
            setIdCardPreview(URL.createObjectURL(file));
            setIdCardStatus('pending');
        }
    };

    const handleSwitchRole = () => {
        navigate('/Service_provider/home');
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // ลบเฉพาะ token
        navigate('/login');
    };

    return (
        <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm">
                <div className="container">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link" href="/Home"><FaHome className="me-2" /> {language === 'EN' ? 'Home' : 'หน้าหลัก'}</a>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link btn btn-link" onClick={handleSwitchRole}><FaUsers className="me-2" /> {language === 'EN' ? 'Switch Role' : 'เปลี่ยนบทบาท'}</button>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link active" href="/Profile"><FaUser className="me-2" /> {language === 'EN' ? 'Profile' : 'โปรไฟล์'}</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/Settings"><FaCog className="me-2" /> {language === 'EN' ? 'Settings' : 'ตั้งค่า'}</a>
                            </li>
                        </ul>
                        <div className="d-flex align-items-center gap-3">
                            <a href="/Profile" className="text-decoration-none text-light">{username || 'User'}</a>
                            <a href="/Wallet" className="btn btn-outline-light btn-sm">
                                <FaBell className="me-2" /> {language === 'EN' ? 'Wallet' : 'กระเป๋าเงิน'}: {walletBalance} THB
                            </a>
                            <button onClick={handleLogout} className="btn btn-danger btn-sm"><FaSignOutAlt className="me-2" /> {language === 'EN' ? 'Logout' : 'ออกจากระบบ'}</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mt-5 pt-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="card shadow-lg border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                            <div className="card-header bg-primary text-white text-center py-3">
                                <h2 className="fw-bold mb-0">{language === 'EN' ? 'Profile' : 'โปรไฟล์'}</h2>
                            </div>
                            <div className="card-body p-4">
                                <div className="row">
                                    {/* Profile Image and ID Card */}
                                    <div className="col-md-4 text-center mb-4">
                                        <div className="mb-4">
                                            <div className="profile-image-placeholder" style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto' }}>
                                                <img
                                                    src={imagePreview || 'https://via.placeholder.com/150'}
                                                    alt="Profile"
                                                    className="img-fluid"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <label htmlFor="profileImageUpload" className="btn btn-secondary btn-sm mt-2">
                                                <FaCamera className="me-2" /> {language === 'EN' ? 'Change Image' : 'เปลี่ยนรูปภาพ'}
                                            </label>
                                            <input
                                                type="file"
                                                id="profileImageUpload"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                        <div>
                                            <div className="id-card-placeholder" style={{ width: '150px', height: '100px', borderRadius: '10px', overflow: 'hidden', margin: '0 auto' }}>
                                                <img
                                                    src={idCardPreview || 'https://via.placeholder.com/150x100'}
                                                    alt="ID Card"
                                                    className="img-fluid"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <label htmlFor="idCardUpload" className="btn btn-info btn-sm mt-2">
                                                <FaIdCard className="me-2" /> {language === 'EN' ? 'Upload ID Card' : 'อัพโหลดบัตรประชาชน'}
                                            </label>
                                            <input
                                                type="file"
                                                id="idCardUpload"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={handleIdCardChange}
                                            />
                                            <p className="mt-2" style={{ fontSize: '0.9rem', color: idCardStatus === 'verified' ? 'green' : idCardStatus === 'pending' ? 'orange' : 'red' }}>
                                                {language === 'EN'
                                                    ? `Status: ${idCardStatus === 'verified' ? 'Verified' : idCardStatus === 'pending' ? 'Pending Approval' : 'Not Verified'}`
                                                    : `สถานะ: ${idCardStatus === 'verified' ? 'ยืนยันแล้ว' : idCardStatus === 'pending' ? 'รออนุมัติ' : 'ยังไม่ยืนยัน'}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Personal Information */}
                                    <div className="col-md-8">
                                        <h5 className="fw-bold mb-4">{language === 'EN' ? 'Personal Information' : 'ข้อมูลส่วนตัว'}</h5>
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium"><FaUser className="me-2" /> {language === 'EN' ? 'Name:' : 'ชื่อ:'}</label>
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium"><FaEnvelope className="me-2" /> {language === 'EN' ? 'Email:' : 'อีเมล:'}</label>
                                                <input
                                                    type="email"
                                                    className="form-control shadow-sm"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium"><FaPhone className="me-2" /> {language === 'EN' ? 'Phone:' : 'โทรศัพท์:'}</label>
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium"><FaMapMarkerAlt className="me-2" /> {language === 'EN' ? 'Address:' : 'ที่อยู่:'}</label>
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium"><FaFacebook className="me-2" /> {language === 'EN' ? 'Facebook:' : 'เฟสบุ๊ค:'}</label>
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    value={facebook}
                                                    onChange={(e) => setFacebook(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium"><FaLine className="me-2" /> {language === 'EN' ? 'Line:' : 'ไลน์:'}</label>
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    value={line}
                                                    onChange={(e) => setLine(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">{language === 'EN' ? 'Confirm Password:' : 'ยืนยันรหัสผ่าน:'}</label>
                                                <input
                                                    type="password"
                                                    className="form-control shadow-sm"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder={language === 'EN' ? 'Enter password to confirm' : 'กรอกรหัสผ่านเพื่อยืนยัน'}
                                                />
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-end">
                                            <button className="btn btn-primary shadow" onClick={handleUpdateProfile}>
                                                {language === 'EN' ? 'Save' : 'บันทึก'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

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

export default Profile;