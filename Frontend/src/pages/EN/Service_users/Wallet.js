import React, { useState, useEffect } from 'react';
import './Wallet.css';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';

function Wallet() {
    const [balance, setBalance] = useState(0); // Store the current wallet balance
    const [transactionHistory, setTransactionHistory] = useState([]); // Store transaction history
    const [topUpAmount, setTopUpAmount] = useState(''); // Amount to top up
    const [qrCode, setQrCode] = useState(''); // QR Code URL
    const [showModal, setShowModal] = useState(false); // Show modal state
    const [uploadedProof, setUploadedProof] = useState(null); // Payment proof file
    const [proofUploadStatus, setProofUploadStatus] = useState('');
    const userId = localStorage.getItem('userId'); // Retrieve userId from local storage

    // Fetch wallet balance and transaction history on component load
    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/wallet/${userId}`);
                setBalance(response.data.balance || 0);
                setTransactionHistory(response.data.transactions || []);
            } catch (error) {
                console.error('Error fetching wallet data:', error);
                alert('Error fetching wallet data');
            }
        };

        fetchWalletData();
    }, [userId]);

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
        formData.append('proof', uploadedProof);
    
        try {
            const response = await axios.post('http://localhost:5000/api/upload/proof', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            if (response.status === 200) {
                setProofUploadStatus('✅ Proof uploaded successfully!');
                alert('Proof uploaded successfully!');
            } else {
                setProofUploadStatus('❌ Failed to upload proof.');
            }
        } catch (error) {
            console.error('Error uploading proof:', error.response?.data || error.message);
            setProofUploadStatus('❌ Failed to upload proof.');
        }
    };
    

    return (
        <div className="wallet-container">
            <aside className="sidebar">
                <div className="logo">
                    <li>
                        <a href="/Home">
                            <img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/refs/heads/main/Screenshot%20202024-07-26%2020013811.png" alt="Logo" />
                        </a>
                    </li>
                </div>
                <nav>
                    <ul>
                        <li><a href="/Home"><FaHome /> Home</a></li>
                        <li><a href="/Addspace"><FaCalendarAlt /> Add space</a></li>
                        <li><a href="/Managespace"><FaCalendarAlt /> Manage space</a></li>
                        <li><a href="/Profile"><FaUser /> Profile</a></li>
                        <li><a href="/Settings"><FaCog /> Settings</a></li>
                        <li className="logout"><a href="/login"><FaSignOutAlt /> Log out</a></li>
                    </ul>
                </nav>
            </aside>
            <main className="main-content">
                <header>
                    <h1>SPR-Wallet</h1>
                    <div className="search-bar">
                        <input type="text" placeholder="Search Here" />
                    </div>
                    <div className="user-info">
                        <span className="notification-icon">🔔</span>
                        <li><a href="/Profile"><span className="user-name">User</span></a></li>
                        <li><a href="/Wallet"><span className="user-balance">Wallet</span></a></li>
                    </div>
                </header>
                <section className="wallet-section">
                    <div className="wallet-info">
                        <img src="https://ps.w.org/user-avatar-reloaded/assets/icon-256x256.png?rev=2540745" alt="User Avatar" className="avatar" />
                        <h2>My Wallet(THB)</h2>
                        <span className="balance">{balance} THB</span>
                        <input 
                            type="number" 
                            value={topUpAmount} 
                            onChange={(e) => setTopUpAmount(e.target.value)} 
                            placeholder="Enter amount" 
                        />
                        <button className="top-up-button" onClick={handleTopUpClick}>TOP UP</button>
                    </div>
                    <div className="transaction-history">
                        <h3>All Transactions</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>NO.</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Transaction list</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactionHistory.length > 0 ? (
                                    transactionHistory.map((transaction, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{transaction.date}</td>
                                            <td>{transaction.time}</td>
                                            <td>{transaction.description}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4">No transactions yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {/* QR Code Modal */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                        <h2>Scan QR Code</h2>
                        {qrCode ? <img src={`http://localhost:5000${qrCode}`} alt="QR Code" className="qr-code" /> : <p>Loading...</p>}
                        <h3>Upload Payment Proof</h3>
                        <input type="file" onChange={(e) => setUploadedProof(e.target.files[0])} />
                        <button onClick={handleProofUpload}>Upload Proof</button>
                        {proofUploadStatus && <p>{proofUploadStatus}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Wallet;
