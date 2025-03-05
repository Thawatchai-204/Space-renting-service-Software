import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Wallet.css'; // สร้างไฟล์ CSS ใหม่สำหรับหน้า Wallet
import { FaHome, FaUsers, FaCog, FaSignOutAlt, FaBell, FaWallet, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import { LanguageContext } from '../../../LanguageContext';
import { CSSTransition } from 'react-transition-group';
import 'animate.css';

function Wallet() {
    const { language, toggleLanguage } = useContext(LanguageContext);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [uploadedProof, setUploadedProof] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) setUsername(storedUsername);
        if (userId) {
            fetchWalletData(userId);
        } else {
            navigate('/login');
        }
    }, [userId, navigate]);

    const fetchWalletData = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/wallet/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBalance(response.data.balance || 0);
            setTransactions(response.data.transactions || []);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            setError(language === 'EN' ? 'Failed to load wallet data' : 'ไม่สามารถโหลดข้อมูลกระเป๋าเงินได้');
        }
    };

    const fetchQRCode = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/qrcode', {
                responseType: 'blob',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const url = URL.createObjectURL(response.data);
            setQrCodeUrl(url);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching QR code:', error);
            setError(language === 'EN' ? 'Failed to fetch QR code' : 'ไม่สามารถดึง QR Code ได้');
        }
    };

    const handleTopUpClick = () => {
        if (!topUpAmount || topUpAmount <= 0) {
            setError(language === 'EN' ? 'Please enter a valid amount' : 'กรุณากรอกจำนวนเงินที่ถูกต้อง');
            return;
        }
        fetchQRCode();
    };

    const handleProofUpload = async () => {
        if (!uploadedProof) {
            setError(language === 'EN' ? 'Please select a file to upload' : 'กรุณาเลือกไฟล์เพื่ออัปโหลด');
            return;
        }
    
        if (!['image/jpeg', 'image/png'].includes(uploadedProof.type)) {
            setError(language === 'EN' ? 'Only JPG or PNG files are allowed' : 'อนุญาตเฉพาะไฟล์ JPG หรือ PNG เท่านั้น');
            return;
        }
    
        if (uploadedProof.size > 5 * 1024 * 1024) {
            setError(language === 'EN' ? 'File size must not exceed 5MB' : 'ขนาดไฟล์ต้องไม่เกิน 5MB');
            return;
        }
    
        const formData = new FormData();
        formData.append('userId', userId); // ใช้ userId จาก localStorage
        formData.append('amount', topUpAmount);
        formData.append('paymentProof', uploadedProof);
    
        try {
            const response = await axios.post(`http://localhost:5000/api/wallet/deposit/${userId}`, formData, { // แก้ไข URL ให้ใช้ userId จริง
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUploadStatus(language === 'EN' ? '✅ Upload successful! Waiting for approval' : '✅ อัปโหลดสำเร็จ! รอการอนุมัติ');
            fetchWalletData(userId); // รีเฟรชข้อมูลหลังอัปโหลด
            setTopUpAmount('');
            setUploadedProof(null);
        } catch (error) {
            console.error('Error uploading proof:', error);
            setError(language === 'EN' ? 'Failed to upload payment proof' : 'ไม่สามารถอัปโหลดหลักฐานการชำระเงินได้');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleSwitchRole = () => {
        navigate('/Service_provider/home');
    };

    return (
        <div className="container-fluid" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm">
                <div className="container">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
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
                                <a className="nav-link" href="/Settings"><FaCog className="me-2" /> {language === 'EN' ? 'Settings' : 'ตั้งค่า'}</a>
                            </li>
                        </ul>
                        <div className="d-flex align-items-center gap-3">
                            <a href="/Profile" className="text-decoration-none text-light">{username || 'User'}</a>
                            <a href="/Wallet" className="btn btn-outline-light btn-sm active">
                                <FaBell className="me-2" /> {language === 'EN' ? 'Wallet' : 'กระเป๋าเงิน'}: {balance} THB
                            </a>
                            <button onClick={handleLogout} className="btn btn-danger btn-sm">
                                <FaSignOutAlt className="me-2" /> {language === 'EN' ? 'Logout' : 'ออกจากระบบ'}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mt-5 pt-5">
                <h1 className="text-center mb-5 fw-bold" style={{ color: '#343a40' }}>
                    {language === 'EN' ? 'My Wallet' : 'กระเป๋าเงินของฉัน'}
                </h1>

                {/* Wallet Balance */}
                <div className="row justify-content-center mb-4">
                    <div className="col-lg-6 col-md-8">
                        <div className="card shadow-lg border-0" style={{ borderRadius: '15px' }}>
                            <div className="card-body text-center p-4">
                                <FaWallet size={40} className="mb-3" style={{ color: '#007bff' }} />
                                <h2 className="fw-bold">{balance} THB</h2>
                                <p className="text-muted">{language === 'EN' ? 'Current Balance' : 'ยอดเงินคงเหลือ'}</p>
                                <div className="input-group mb-3">
                                    <input
                                        type="number"
                                        className="form-control shadow-sm"
                                        value={topUpAmount}
                                        onChange={(e) => setTopUpAmount(e.target.value)}
                                        placeholder={language === 'EN' ? 'Enter amount' : 'กรอกจำนวนเงิน'}
                                    />
                                    <button className="btn btn-primary" onClick={handleTopUpClick}>
                                        {language === 'EN' ? 'Top Up' : 'เติมเงิน'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-10">
                        <div className="card shadow-lg border-0" style={{ borderRadius: '15px' }}>
                            <div className="card-body p-4">
                                <h3 className="fw-bold mb-4">{language === 'EN' ? 'Transaction History' : 'ประวัติการทำรายการ'}</h3>
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>{language === 'EN' ? 'Date' : 'วันที่'}</th>
                                                <th>{language === 'EN' ? 'Description' : 'รายการ'}</th>
                                                <th>{language === 'EN' ? 'Amount' : 'จำนวนเงิน'}</th>
                                                <th>{language === 'EN' ? 'Status' : 'สถานะ'}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.length > 0 ? (
                                                transactions.map((transaction, index) => (
                                                    <tr key={transaction.id}>
                                                        <td>{index + 1}</td>
                                                        <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                                                        <td>{transaction.description}</td>
                                                        <td style={{ color: transaction.amount > 0 ? 'green' : 'red' }}>
                                                            {transaction.amount} THB
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${transaction.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                                                                {transaction.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center">
                                                        {language === 'EN' ? 'No transactions yet' : 'ยังไม่มีรายการ'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                <CSSTransition in={!!error} timeout={500} classNames="fade" unmountOnExit>
                    <div className="alert alert-danger mt-4 text-center animate__animated animate__shakeX">
                        {error}
                    </div>
                </CSSTransition>
            </main>

            {/* Top Up Modal */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">{language === 'EN' ? 'Top Up Wallet' : 'เติมเงินเข้าสู่กระเป๋า'}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body text-center">
                                <h6>{language === 'EN' ? 'Scan QR Code to Pay' : 'สแกน QR Code เพื่อชำระเงิน'}</h6>
                                {qrCodeUrl ? (
                                    <img src={qrCodeUrl} alt="QR Code" className="img-fluid mb-3" style={{ maxWidth: '200px' }} />
                                ) : (
                                    <p>{language === 'EN' ? 'Loading QR Code...' : 'กำลังโหลด QR Code...'}</p>
                                )}
                                <hr />
                                <h6>{language === 'EN' ? 'Upload Payment Proof' : 'อัปโหลดหลักฐานการชำระเงิน'}</h6>
                                <input
                                    type="file"
                                    className="form-control mb-3"
                                    accept="image/jpeg,image/png"
                                    onChange={(e) => setUploadedProof(e.target.files[0])}
                                />
                                <button className="btn btn-primary w-100" onClick={handleProofUpload}>
                                    <FaUpload className="me-2" /> {language === 'EN' ? 'Upload Proof' : 'อัปโหลดหลักฐาน'}
                                </button>
                                {uploadStatus && (
                                    <p className="mt-3" style={{ color: uploadStatus.includes('✅') ? 'green' : 'red' }}>
                                        {uploadStatus}
                                    </p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    {language === 'EN' ? 'Close' : 'ปิด'}
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

export default Wallet;