import React, { useState } from 'react';
import './Profile.css';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt, FaEdit } from 'react-icons/fa';

function Profile() {
    const [name, setName] = useState("jusmean jojo");
    const [email, setEmail] = useState("jusmean_jojo@psu.pre.project.com");
    const [phone, setPhone] = useState("xxx-xxx-xxxx");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [isConfirmingPassword, setIsConfirmingPassword] = useState(false);

    const handleSave = () => {
        if (!confirmPassword) {
            alert("Please enter your password to confirm changes.");
            return;
        }

        setIsEditingName(false);
        setIsEditingEmail(false);
        setIsEditingPhone(false);
        setIsConfirmingPassword(false);
        setConfirmPassword("");
        // Add save logic here if necessary (e.g., API calls)
    };

    const startEditing = (editType) => {
        setIsConfirmingPassword(true);
        if (editType === "name") setIsEditingName(true);
        if (editType === "email") setIsEditingEmail(true);
        if (editType === "phone") setIsEditingPhone(true);
    };

    return (
        <div className="home-container">
            <aside className="sidebar">
                <div className="logo">
                    <li><a href="/Home"><img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/main/Screenshot%202024-07-26%20013811.png" alt="Logo" /></a></li>
                </div>
                <nav>
                    <ul>
                        <li><a href="/Home"><FaHome /> Home</a></li>
                        <li><a href="/Reserve"><FaCalendarAlt /> Reserve</a></li>
                        <li className="active"><a href="/Profile"><FaUser /> Profile</a></li>
                        <li><a href="/Settings"><FaCog /> Settings</a></li>
                        <li className="logout"><a href="/login"><FaSignOutAlt /> Log out</a></li>
                    </ul>
                </nav>
            </aside>
            <main className="main-content">
                <header>
                    <h1>Profile</h1>
                    <div className="user-info">
                        <span className="notification-icon">🔔</span>
                        <li><a href="/Profile"><span className="user-name">User</span></a></li>
                        <li><a href="/Wallet"><span className="user-balance">Wallet</span></a></li>
                    </div>
                </header>
                <section className="profile-section">
                    <img src="https://ps.w.org/user-avatar-reloaded/assets/icon-256x256.png?rev=2540745" alt="Profile" />
                    <div className="profile-info">
                        <div className="profile-item">
                            <label>Change Name</label>
                            <div className="profile-edit">
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    disabled={!isEditingName}
                                />
                                <button className="edit-button" onClick={() => startEditing("name")}>
                                    <FaEdit />
                                </button>
                            </div>
                        </div>
                        <div className="profile-item">
                            <label>Change E-mail</label>
                            <div className="profile-edit">
                                <input 
                                    type="text" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    disabled={!isEditingEmail}
                                />
                                <button className="edit-button" onClick={() => startEditing("email")}>
                                    <FaEdit />
                                </button>
                            </div>
                        </div>
                        <div className="profile-item">
                            <label>Change Phone</label>
                            <div className="profile-edit">
                                <input 
                                    type="text" 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)} 
                                    disabled={!isEditingPhone}
                                />
                                <button className="edit-button" onClick={() => startEditing("phone")}>
                                    <FaEdit />
                                </button>
                            </div>
                        </div>
                        
             
                        {isConfirmingPassword && (
                            <div className="profile-item">
                                <label>Confirm Password</label>
                                <div className="profile-edit">
                                    <input 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <button className="save-button" onClick={handleSave}>Save</button>
                </section>
            </main>
        </div>
    );
}

export default Profile;
