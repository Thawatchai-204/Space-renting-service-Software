import React, { useState } from 'react';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt, FaKey } from 'react-icons/fa';
import './Settings.css';

function Settings() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handlePasswordChange = () => {
        console.log("Current Password:", currentPassword);
        console.log("New Password:", newPassword);
    };

    return (
        <div className="settings-container">
            <aside className="sidebar">
                <div className="logo">
                    <li><a href="/Home"><img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/main/Screenshot%202024-07-26%20013811.png" alt="Logo" /></a></li>
                </div>
                <nav>
                    <ul>
                        <li><a href="/Home"><FaHome /> หน้าแรก</a></li>
                        <li><a href="/Reserve"><FaCalendarAlt /> การจอง</a></li>
                        <li><a href="/Profile"><FaUser /> ข้อมูลส่วนตัว</a></li>
                        <li className="active"><a href="/Settings"><FaCog /> ตั้งค่า</a></li>
                        <li className="logout"><a href="/login"><FaSignOutAlt /> ออกจากระบบ</a></li>
                    </ul>
                </nav>
            </aside>
            <main className="main-content">
                <header>
                    <h1>Settings</h1>
                    <div className="user-info">
                        <span className="notification-icon">🔔</span>
                        <li><a href="/Profile"><span className="user-name">User</span></a></li>
                        <li><a href="/Wallet"><span className="user-balance">Wallet</span></a></li>
                    </div>
                </header>
                <section className="settings-section">
                    <div className="setting-option">
                        <FaKey className="setting-icon" />
                        <div className="setting-details">
                            <label>Current Password</label>
                            <input 
                                type="password" 
                                placeholder="Current Password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)} 
                            />
                            <label>New Password</label>
                            <input 
                                type="password" 
                                placeholder="New Password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)} 
                            />
                            <button onClick={handlePasswordChange}>Change Password</button>
                        </div>
                    </div>
                    
                    <button className="contact-admin">Contact Admin</button>
                </section>
            </main>
        </div>
    );
}

export default Settings;


