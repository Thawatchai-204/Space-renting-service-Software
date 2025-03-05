import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaHome, FaUsers, FaFileAlt, FaCog, FaSignOutAlt, FaHistory, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { LanguageContext } from '../../../LanguageContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Users() {
    const { language, toggleLanguage } = useContext(LanguageContext);
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);
    const navigate = useNavigate();

    const API_BASE_URL = 'http://localhost:5000';

    const setupAxiosAuth = () => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return true;
        } else {
            delete axios.defaults.headers.common['Authorization'];
            toast.error(language === 'EN' ? 'Please log in to continue.' : 'กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ');
            navigate('/login');
            return false;
        }
    };

    useEffect(() => {
        if (setupAxiosAuth()) {
            const storedUserId = localStorage.getItem('userId');
            const storedUsername = localStorage.getItem('username');
            if (storedUserId) {
                setUserId(storedUserId);
                setUsername(storedUsername || 'Admin');
                fetchAllUsers();
            } else {
                console.error('User ID not found in localStorage');
                toast.error(language === 'EN' ? 'User ID not found. Please log in again.' : 'ไม่พบรหัสผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
                navigate('/login');
            }
        }
    }, [navigate, language]);

    const fetchAllUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/users`);
            setUsers(response.data);
            const pending = response.data.filter(user => user.idCardStatus === 'pending').length;
            setPendingCount(pending);
        } catch (error) {
            console.error('Error fetching users:', error.message);
            toast.error(language === 'EN' ? 'Failed to fetch users.' : 'ไม่สามารถดึงข้อมูลผู้ใช้ได้');
            setUsers([]);
        }
    };

    const handleApprove = async (userId) => {
        try {
            await axios.put(`${API_BASE_URL}/api/user/${userId}/approve`, { idCardStatus: 'approved' });
            setUsers(users.map(user => 
                user._id === userId ? { ...user, idCardStatus: 'approved' } : user
            ));
            setPendingCount(prev => prev - 1);
            toast.success(language === 'EN' ? 'User approved successfully!' : 'อนุมัติผู้ใช้สำเร็จ!');
        } catch (error) {
            console.error('Error approving user:', error.message);
            toast.error(language === 'EN' ? 'Failed to approve user.' : 'ไม่สามารถอนุมัติผู้ใช้ได้');
        }
    };

    const handleReject = async (userId) => {
        try {
            await axios.put(`${API_BASE_URL}/api/user/${userId}/reject`, { idCardStatus: 'rejected' });
            setUsers(users.map(user => 
                user._id === userId ? { ...user, idCardStatus: 'rejected' } : user
            ));
            toast.success(language === 'EN' ? 'User rejected successfully!' : 'ปฏิเสธผู้ใช้สำเร็จ!');
        } catch (error) {
            console.error('Error rejecting user:', error.message);
            toast.error(language === 'EN' ? 'Failed to reject user.' : 'ไม่สามารถปฏิเสธผู้ใช้ได้');
        }
    };

    const handleRequest = () => {
        navigate('/AdminRequests');
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <ToastContainer />
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
                            <li className="nav-item position-relative">
                                <a className="nav-link active" href="/AdminUsers">
                                    <FaUsers className="me-2" /> {language === 'EN' ? 'Users' : 'ผู้ใช้'}
                                    {pendingCount > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                            {pendingCount}
                                        </span>
                                    )}
                                </a>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link btn btn-link" onClick={handleRequest}><FaFileAlt className="me-2" /> {language === 'EN' ? 'Request' : 'คำขอ'}</button>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/AdminSettings"><FaCog className="me-2" /> {language === 'EN' ? 'Settings' : 'ตั้งค่า'}</a>
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

            <div className="container mt-5 pt-5">
                <header className="mb-4 text-center">
                    <h1 className="fw-bold text-dark" style={{ fontSize: '2rem' }}>{language === 'EN' ? 'Users Management' : 'การจัดการผู้ใช้'}</h1>
                </header>

                <section className="mb-5">
                    <h2 className="fw-bold text-dark mb-3">{language === 'EN' ? 'All Users in System' : 'ผู้ใช้ทั้งหมดในระบบ'}</h2>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th className="text-center">{language === 'EN' ? 'User Name' : 'ชื่อผู้ใช้'}</th>
                                    <th className="text-center">{language === 'EN' ? 'E-mail' : 'อีเมล'}</th>
                                    <th className="text-center">{language === 'EN' ? 'Profile Picture' : 'รูปโปรไฟล์'}</th>
                                    <th className="text-center">{language === 'EN' ? 'Card Status' : 'สถานะบัตร'}</th>
                                    <th className="text-center">{language === 'EN' ? 'Actions' : 'การดำเนินการ'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user._id}>
                                            {/* User Name (ไม่มีลิงก์) */}
                                            <td className="text-center">{user.username || 'N/A'}</td>

                                            {/* E-mail */}
                                            <td className="text-center">{user.email}</td>

                                            {/* รูป Profile */}
                                            <td className="text-center">
                                                {user.profilePic ? (
                                                    <img
                                                        src={user.profilePic}
                                                        alt={`${user.username}'s profile`}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }}
                                                    />
                                                ) : (
                                                    language === 'EN' ? 'No Profile Picture' : 'ไม่มีรูปโปรไฟล์'
                                                )}
                                            </td>

                                            {/* Card Status และแสดงรูปไอดีการ์ด */}
                                            <td className="text-center">
                                                <span>{user.idCardStatus || 'Not Uploaded'}</span>
                                                {user.idCardPic ? (
                                                    <div className="mt-2">
                                                        <img
                                                            src={user.idCardPic}
                                                            alt={`${user.username}'s ID card`}
                                                            style={{ width: '100px', height: 'auto', border: '1px solid #ddd' }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="mt-2 text-muted">
                                                        {language === 'EN' ? 'No ID Card' : 'ไม่มีบัตรประชาชน'}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="text-center">
                                                {user.idCardStatus === 'pending' && (
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleApprove(user._id)}
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleReject(user._id)}
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted">
                                            {language === 'EN' ? 'No users available in the system.' : 'ไม่มีผู้ใช้ในระบบ'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

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

export default Users;