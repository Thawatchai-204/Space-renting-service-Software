// src/pages/EN/Service_users/Profile.js
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Profile.css';
import { FaHome, FaPlus, FaList, FaBell, FaCog, FaSignOutAlt, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera } from 'react-icons/fa';
import axios from 'axios';
import { LanguageContext } from '../../../LanguageContext';

function Profile() {
    const { language, toggleLanguage } = useContext(LanguageContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userId, setUserId] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [walletBalance, setWalletBalance] = useState(0); // State for wallet balance

    const navigate = useNavigate();

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
            fetchUserProfile(storedUserId);
            fetchWalletBalance(storedUserId); // Fetch wallet balance
        } else {
            console.error('User ID not found in localStorage');
        }
    }, []);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) setUsername(storedUsername);
    }, []);

    const fetchUserProfile = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
            const userData = response.data;
            setEmail(userData.email);
            setPhone(userData.phone);
            setImagePreview(userData.profileImage || ''); // Set profile image URL if available
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const fetchWalletBalance = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/wallet/${userId}`);
            setWalletBalance(response.data.balance || 0);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        }
    };

    const handleUpdateProfile = async () => {
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('password', password);
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        try {
            const response = await axios.put(`http://localhost:5000/api/user/${userId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                alert('Profile updated successfully!');
                setImagePreview(response.data.profileImage || ''); // Update image preview
                fetchWalletBalance(userId); // Fetch updated wallet balance
            } else {
                alert(response.data.message || 'Failed to update profile.');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile.');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file)); // Preview the selected image
        }
    };

    return (
        <div className="container-fluid profile-container">
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
                                <a className="nav-link active" href="/Profile"><FaUser className="me-2" /> {language === 'EN' ? 'Profile' : 'โปรไฟล์'}</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/Settings"><FaCog className="me-2" /> {language === 'EN' ? 'Settings' : 'ตั้งค่า'}</a>
                            </li>
                        </ul>
                        <div className="d-flex align-items-center gap-3">
                            <a href="/Profile" className="text-decoration-none text-light"> {username || 'User'}</a>
                            <a href="/Wallet" className="btn btn-outline-light btn-sm">
                                <FaBell className="me-2" /> {language === 'EN' ? 'Wallet' : 'กระเป๋าเงิน'}: {walletBalance} THB
                            </a>
                            <a href="/login" className="btn btn-danger btn-sm"><FaSignOutAlt className="me-2" /> {language === 'EN' ? 'Logout' : 'ออกจากระบบ'}</a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container-fluid mt-5 pt-4">
                <header className="d-flex justify-content-between align-items-center mb-4">
                    
                </header>

                {/* Profile Section */}
                <section className="mb-5">
                    <div className="row justify-content-center">
                        {/* Column 1: Profile Image */}
                        <div className="col-md-4 mb-4">
                            <div className="profile-image-section text-center">
                                <div className="profile-image-container mb-4">
                                    <div className="profile-image-wrapper">
                                        <img
                                            src={imagePreview || "https://via.placeholder.com/150"} // Default placeholder image
                                            alt="Profile"
                                            className="profile-image"
                                        />
                                    </div>
                                </div>
                                <div className="upload-section">
                                    <label htmlFor="profileImageUpload" className="btn btn-secondary">
                                        <FaCamera className="me-2" /> {language === 'EN' ? 'Upload Image' : 'อัปโหลดรูปภาพ'}
                                    </label>
                                    <input
                                        type="file"
                                        id="profileImageUpload"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Personal Information */}
                        <div className="col-md-8">
                            <div className="personal-info-section">
                                <h5 className="fw-bold">{language === 'EN' ? 'Personal Information' : 'ข้อมูลส่วนตัว'}</h5>
                                <div className="mb-3">
                                    <label className="form-label">{language === 'EN' ? 'Name:' : 'ชื่อ:'}</label>
                                    <input type="text" className="form-control custom-input" value={username} readOnly />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">{language === 'EN' ? 'Email:' : 'อีเมล:'}</label>
                                    <input type="email" className="form-control custom-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">{language === 'EN' ? 'Phone:' : 'โทรศัพท์:'}</label>
                                    <input type="text" className="form-control custom-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">{language === 'EN' ? 'Password:' : 'รหัสผ่าน:'}</label>
                                    <input type="password" className="form-control custom-input" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">{language === 'EN' ? 'Confirm Password:' : 'ยืนยันรหัสผ่าน:'}</label>
                                    <input type="password" className="form-control custom-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                </div>
                                <div className="d-flex justify-content-end">
                                    <button className="btn btn-primary" onClick={handleUpdateProfile}>
                                        {language === 'EN' ? 'Save' : 'บันทึก'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
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

export default Profile;