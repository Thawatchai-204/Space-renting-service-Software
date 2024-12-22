import React, { useEffect, useState } from 'react';
import './Home.css';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';

function Home() {
    const [spaces, setSpaces] = useState([]);
    const [walletUserId, setWalletUserId] = useState('');
    const [topUpAmount, setTopUpAmount] = useState(0);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

    useEffect(() => {
        const fetchSpaces = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/spaces');
                setSpaces(response.data);
            } catch (error) {
                console.error('Error fetching spaces:', error);
            }
        };

        fetchSpaces();
    }, []);

    const handleTopUp = async () => {
        if (!walletUserId || topUpAmount <= 0) {
            alert('Please enter a valid user ID and amount.');
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/wallet/${walletUserId}`, {
                amount: topUpAmount,
            });
            alert('Wallet top-up approved successfully!');
        } catch (error) {
            console.error('Error approving wallet top-up:', error);
            alert('Failed to approve wallet top-up.');
        }
    };

    const handleImageUpload = async () => {
        if (!uploadedImage) {
            alert('Please select an image to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('image', uploadedImage);

        try {
            const response = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUploadStatus('Image uploaded successfully: ' + response.data.fileName);
        } catch (error) {
            console.error('Error uploading image:', error);
            setUploadStatus('Failed to upload image.');
        }
    };

    return (
        <div className="home-container">
            <aside className="sidebar">
                <div className="logo">
                    <a href="/Home">
                        <img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/refs/heads/main/backend/img/logoSRSS.png" alt="Logo" />
                    </a>
                </div>
                <nav>
                    <ul>
                        <li className="active"><a href="/Home"><FaHome /> Home</a></li>
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
                    <h1>Admin Actions</h1>
                </header>

                <section className="wallet-approval-section">
                    <h2>Approve Wallet Top-Up</h2>
                    <input
                        type="text"
                        placeholder="Enter User ID"
                        value={walletUserId}
                        onChange={(e) => setWalletUserId(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Enter Amount"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    />
                    <button onClick={handleTopUp}>Approve Top-Up</button>
                </section>

                <section className="image-upload-section">
                    <h2>Upload Image</h2>
                    <input
                        type="file"
                        onChange={(e) => setUploadedImage(e.target.files[0])}
                    />
                    <button onClick={handleImageUpload}>Upload</button>
                    {uploadStatus && <p>{uploadStatus}</p>}
                </section>

                <section className="spaces-section">
                    <h2>Available Spaces</h2>
                    <div className="spaces-list">
                        {spaces.map((space) => (
                            <div key={space._id} className="space-item">
                                <img src={`http://localhost:5000/uploads/${space.image}`} alt={space.name} />
                                <h3>{space.name}</h3>
                                <p>{space.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Home;
