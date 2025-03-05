import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminWallet.css';
import { FaHome, FaPlus, FaList, FaBell, FaCog, FaSignOutAlt, FaUser } from 'react-icons/fa';
import axios from 'axios';
import { LanguageContext } from '../../../LanguageContext';

function Wallet() {
    const { language, toggleLanguage } = useContext(LanguageContext);
    const [balance, setBalance] = useState(0); // Store the current wallet balance
    const [transactionHistory, setTransactionHistory] = useState([]); // ตั้งค่าเริ่มต้นเป็น array ว่าง
    const [topUpAmount, setTopUpAmount] = useState(''); // Amount to top up
    const [qrCode, setQrCode] = useState(''); // QR Code URL
    const [showModal, setShowModal] = useState(false); // Show modal state
    const [uploadedProof, setUploadedProof] = useState(null); // Payment proof file
    const [proofUploadStatus, setProofUploadStatus] = useState('');
    const [username, setUsername] = useState('');
    const userId = localStorage.getItem('userId'); // Retrieve userId from local storage
    const navigate = useNavigate();

    // Fetch wallet balance and transaction history on component load
    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/wallet/${userId}`);
                setBalance(response.data.balance || 0);
    
                // ดึงประวัติการทำรายการ
                const historyResponse = await axios.get(`http://localhost:5000/api/wallet/${userId}/transactions`);
                if (historyResponse.data && Array.isArray(historyResponse.data)) {
                    setTransactionHistory(historyResponse.data);
                } else {
                    setTransactionHistory([]); // ตั้งค่าเป็น array ว่างหากไม่มีข้อมูล
                }
            } catch (error) {
                console.error('Error fetching wallet data:', error);
                alert('Error fetching wallet data');
            }
        };
    
        fetchWalletData();
    }, [userId]);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) setUsername(storedUsername);
    }, []);

    // Fetch QR Code from backend
    const fetchQRCode = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/qrcode');
            setQrCode(response.data.qrCode);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching QR code:', error);
            alert('Failed to fetch QR code.');
        }
    };

    const handleApproveTransaction = async (userId, transactionId, status) => {
        try {
            const response = await axios.put('http://localhost:5000/api/wallet/approve', {
                userId,
                transactionId,
                status,
            });
    
            if (response.status === 200) {
                alert(`Transaction ${status} successfully`);
                // อัปเดตประวัติการทำรายการ
                const updatedHistory = await axios.get(`http://localhost:5000/api/wallet/${userId}/transactions`);
                setTransactionHistory(updatedHistory.data || []);
            }
        } catch (error) {
            console.error('Error approving transaction:', error.response?.data || error.message);
            alert('Failed to approve transaction.');
        }
    };

    // Handle wallet top-up (Show QR Code Modal)
    const handleTopUpClick = () => {
        if (topUpAmount > 0) {
            fetchQRCode();
        } else {
            alert('Please enter a valid amount.');
        }
    };

    // Handle proof of payment upload
    const handleProofUpload = async () => {
        if (!uploadedProof) {
            alert('Please select a file to upload.');
            return;
        }
    
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('amount', topUpAmount);
        formData.append('proof', uploadedProof);
    
        try {
            const response = await axios.post('http://localhost:5000/api/wallet/topup', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            if (response.status === 200) {
                setProofUploadStatus('✅ Proof uploaded successfully!');
                alert('Top-up successful!');
    
                // อัปเดตยอดเงินใน Wallet
                setBalance(response.data.balance);
    
                // อัปเดตประวัติการทำรายการ
                if (response.data.transaction) {
                    setTransactionHistory((prevHistory) => [
                        response.data.transaction,
                        ...prevHistory,
                    ]);
                }
            } else {
                setProofUploadStatus('❌ Failed to upload proof.');
            }
        } catch (error) {
            console.error('Error uploading proof:', error.response?.data || error.message);
            setProofUploadStatus('❌ Failed to upload proof.');
        }
    };

    return (
        <div className="container-fluid wallet-container">
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
                                <a className="nav-link" href="/Settings"><FaCog className="me-2" /> {language === 'EN' ? 'Settings' : 'ตั้งค่า'}</a>
                            </li>
                        </ul>
                        <div className="d-flex align-items-center gap-3">
                            <a href="/AdminProfile" className="text-decoration-none text-light"> {username || 'User'}</a>
                            <a href="/AdminWallet" className="btn btn-outline-light btn-sm">
                                <FaBell className="me-2" /> {language === 'EN' ? 'Wallet' : 'กระเป๋าเงิน'}: {balance} THB
                            </a>
                            <a href="/login" className="btn btn-danger btn-sm"><FaSignOutAlt className="me-2" /> {language === 'EN' ? 'Logout' : 'ออกจากระบบ'}</a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container-fluid mt-5 pt-4">
                <section className="wallet-section">
                    <div className="wallet-info">
                        <img src="https://ps.w.org/user-avatar-reloaded/assets/icon-256x256.png?rev=2540745" alt="User Avatar" className="avatar" />
                        <h2>{language === 'EN' ? 'Admin Wallet' : 'กระเป๋าเงินแอดมิน (THB)'}</h2>
                        <span className="balance">{balance} THB</span>
                        <input
                            type="number"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                            placeholder={language === 'EN' ? 'Enter amount' : 'กรอกจำนวนเงิน'}
                        />
                        <button className="top-up-button" onClick={handleTopUpClick}>
                            {language === 'EN' ? 'TOP UP' : 'เติมเงิน'}
                        </button>
                    </div>
                    <div className="transaction-history">
    <h3>{language === 'EN' ? 'All Transactions' : 'ประวัติการทำรายการ'}</h3>
    <table>
        <thead>
            <tr>
                <th>{language === 'EN' ? 'ลำดับที่' : 'ลำดับที่'}</th>
                <th>{language === 'EN' ? 'วันที่' : 'วันที่'}</th>
                <th>{language === 'EN' ? 'เวลา' : 'เวลา'}</th>
                <th>{language === 'EN' ? 'รายการ' : 'รายการ'}</th>
                <th>{language === 'EN' ? 'ยอดเงินรวม' : 'ยอดเงินรวม'}</th>
                <th>{language === 'EN' ? 'สถานะ' : 'สถานะ'}</th>
                <th>{language === 'EN' ? 'Actions' : 'การดำเนินการ'}</th>
            </tr>
        </thead>
        <tbody>
            {transactionHistory.length > 0 ? (
                transactionHistory.map((transaction, index) => {
                    if (!transaction) return null;
                    return (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{transaction.date}</td>
                            <td>{transaction.time}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.amount} THB</td>
                            <td>
                                {transaction.status === 'pending' && (
                                    <span style={{ color: 'orange' }}>Pending</span>
                                )}
                                {transaction.status === 'approved' && (
                                    <span style={{ color: 'green' }}>Approved</span>
                                )}
                                {transaction.status === 'rejected' && (
                                    <span style={{ color: 'red' }}>Rejected</span>
                                )}
                            </td>
                            <td>
                                {transaction.status === 'pending' && (
                                    <div>
                                        <button 
                                            onClick={() => handleApproveTransaction(userId, transaction._id, 'approved')}
                                            style={{ backgroundColor: 'green', color: 'white', marginRight: '10px' }}
                                        >
                                            {language === 'EN' ? 'Approve' : 'อนุมัติ'}
                                        </button>
                                        <button 
                                            onClick={() => handleApproveTransaction(userId, transaction._id, 'rejected')}
                                            style={{ backgroundColor: 'red', color: 'white' }}
                                        >
                                            {language === 'EN' ? 'Reject' : 'ปฏิเสธ'}
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    );
                })
            ) : (
                <tr>
                    <td colSpan="7">{language === 'EN' ? 'No transactions yet' : 'ยังไม่มีรายการ'}</td>
                </tr>
            )}
        </tbody>
    </table>
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

            {/* QR Code Modal */}
            {showModal && (
             <div className="modal">
              <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <h2>{language === 'EN' ? 'Scan QR Code' : 'สแกน QR Code'}</h2>
            {qrCode ? <img src={`http://localhost:5000${qrCode}`} alt="QR Code" className="qr-code" /> : <p>Loading...</p>}
            <h3>{language === 'EN' ? 'Upload Payment Proof' : 'อัปโหลดหลักฐานการชำระเงิน'}</h3>
            <input type="file" onChange={(e) => setUploadedProof(e.target.files[0])} />
            <button onClick={handleProofUpload}>
                {language === 'EN' ? 'Upload Proof' : 'อัปโหลดหลักฐาน'}
            </button>
            {proofUploadStatus && <p>{proofUploadStatus}</p>}
        </div>
    </div>
)}
        </div>
    );
}


export default Wallet;