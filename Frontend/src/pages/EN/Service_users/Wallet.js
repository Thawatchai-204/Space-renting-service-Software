import React, { useState } from 'react';
import './Wallet.css';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

function Wallet() {
    const [balance, setBalance] = useState(0); // เริ่มต้นด้วยยอดเงิน 0 บาท
    const [transactionHistory, setTransactionHistory] = useState([]); // สำหรับเก็บประวัติการทำธุรกรรม
    const [topUpAmount, setTopUpAmount] = useState(''); // เก็บค่าที่จะเติมเงิน

    const handleTopUp = () => {
        if (topUpAmount && !isNaN(topUpAmount)) {
            const newBalance = balance + parseFloat(topUpAmount);
            setBalance(newBalance); // อัปเดตยอดเงิน

            // เพิ่มประวัติการทำธุรกรรม
            const newTransaction = {
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                description: `Top up ${topUpAmount} THB`,
            };
            setTransactionHistory([...transactionHistory, newTransaction]);

            setTopUpAmount(''); // รีเซ็ตช่องกรอกยอดเงิน
        }
    };

    return (
        <div className="wallet-container">
            <aside className="sidebar">
                <div className="logo">
                    <li>
                        <a href="/Home">
                            <img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/refs/heads/main/backend/img/logoSRSS.png" alt="Logo" />
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
                        <button className="top-up-button" onClick={handleTopUp}>TOP UP</button>
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
        </div>
    );
}

export default Wallet;
