import React, { useState, useEffect } from 'react';
import './Profile.css';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import axios from 'axios';

function Profile() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [isConfirmingPassword, setIsConfirmingPassword] = useState(false);

    // Fetch user data from backend when the component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Replace this with your API endpoint and add user authentication (token, etc.)
                const response = await axios.get('/api/profile'); // Example: '/api/profile'
                
                const { name, email, phone } = response.data; // Adjust based on your API response
                setName(name);
                setEmail(email);
                setPhone(phone);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

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

        // Make API call to save updated user data (if necessary)
        const updateUserData = async () => {
            try {
                const response = await axios.put('/api/profile', {
                    name,
                    email,
                    phone,
                    confirmPassword
                });
                console.log(response.data.message); // Show success message
            } catch (error) {
                console.error('Error updating user data:', error);
            }
        };

        updateUserData();
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
