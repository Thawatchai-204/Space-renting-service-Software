// src/pages/EN/Service_users/Profile.js
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminProfile.css';
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
    const [users, setUsers] = useState([]);
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

    const fetchAllUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    
    useEffect(() => {
        fetchAllUsers();
    }, []);

    const handleDeleteUser = async (userId) => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/user/${userId}`);
            if (response.data.success) {
                alert('User deleted successfully!');
                fetchAllUsers(); // Refresh the list after deletion
            } else {
                alert(response.data.message || 'Failed to delete user.');
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user.');
        }
    };

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
                                <a className="nav-link" href="/AdminDashboard"><FaHome className="me-2" /> {language === 'EN' ? 'Home' : 'หน้าหลัก'}</a>
                            </li>
                            
                            <li className="nav-item">
                                <a className="nav-link active" href="/AdminProfile"><FaUser className="me-2" /> {language === 'EN' ? 'Users' : 'บัญชีผู้ใช้งาน'}</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/AdminSettings"><FaCog className="me-2" /> {language === 'EN' ? 'Settings' : 'ตั้งค่า'}</a>
                            </li>
                        </ul>
                        <div className="d-flex align-items-center gap-3">
                            <a href="/AdminProfile" className="text-decoration-none text-light"> {username || 'User'}</a>
                            <a href="/AdminWallet" className="btn btn-outline-light btn-sm">
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
    <h5 className="fw-bold">{language === 'EN' ? 'All Users' : 'บัญชีทั้งหมด'}</h5>
    <table className="table table-striped">
        <thead>
            <tr>
                <th>{language === 'EN' ? 'Name' : 'ชื่อ'}</th>
                <th>{language === 'EN' ? 'Email' : 'อีเมล'}</th>
                <th>{language === 'EN' ? 'Phone' : 'โทรศัพท์'}</th>
                <th>{language === 'EN' ? 'Actions' : 'การกระทำ'}</th>
            </tr>
        </thead>
        <tbody>
            {users.map(user => (
                <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user._id)}>
                            {language === 'EN' ? 'Delete' : 'ลบ'}
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
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