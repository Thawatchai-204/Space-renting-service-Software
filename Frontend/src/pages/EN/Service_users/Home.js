import React, { useEffect, useState } from 'react';
import './Home.css';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';

function Home() {
    const [spaces, setSpaces] = useState([]);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

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

    const openModal = (space) => {
        setSelectedSpace(space);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedSpace(null);
        setIsModalOpen(false);
    };

    const handleReserve = () => {
        // Logic for reservation can be implemented here
        alert(`Reserved ${selectedSpace.name}!`);
    };

    return (
        <div className="home-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="logo">
                    <li>
                        <a href="/Home">
                            <img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/main/Screenshot%20202024-07-26%2020013811.png" alt="Logo" />
                        </a>
                    </li>
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

            {/* Main Content */}
            <main className="main-content">
                <header>
                    <h1>Home</h1>
                    <div className="search-bar">
                        <input type="text" placeholder="Search Here" />
                    </div>
                    <div className="user-info">
                        <span className="notification-icon">🔔</span>
                        <li><a href="/Profile"><span className="user-name">{username ? username : 'User'}</span></a></li>
                        <li><a href="/Wallet"><span className="user-balance">Wallet</span></a></li>
                    </div>
                </header>

                <section className="content">
                    <div className="main-content-section">
                        <h2>Ready to Reserve</h2>
                        <div className="spaces-list">
                            {spaces.length > 0 ? (
                                spaces.map((space) => (
                                    <div key={space._id} className="space-item">
                                        <img src={`http://localhost:5000/uploads/${space.image}`} alt={space.name} />
                                        <h3>{space.name}</h3>
                                        <p>{space.advertisingWords}</p>
                                        <p>{space.address}</p>
                                        <p>Price: {space.price} THB</p>
                                        <button onClick={() => openModal(space)} className="details-link">View Details</button>
                                    </div>
                                ))
                            ) : (
                                <p>No spaces available at the moment.</p>
                            )}
                        </div>
                    </div>

                    {/* Filter Section */}
                    <aside className={`filter-section ${isCollapsed ? 'collapsed' : ''}`}>
                        <button className="toggle-filter" onClick={() => setIsCollapsed(!isCollapsed)}>
                            {isCollapsed ? 'Show Filters' : 'Hide Filters'}
                        </button>
                        <div className={`filter-content ${isCollapsed ? 'hidden' : ''}`}>
                            <h2>Filter</h2>
                            <div className="filter-group">
                                <label>Price</label>
                                <select>
                                    <option value="">All</option>
                                    <option value="less-500">Less than 500 baht</option>
                                    <option value="less-1000">Less than 1000 baht</option>
                                    <option value="more-1000">More than 1000 baht</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Types</label>
                                <select>
                                    <option value="">Select</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Size</label>
                                <select>
                                    <option value="">Select</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Start-End Date</label>
                                <input type="date" />
                            </div>
                            <button className="apply-button">Apply</button>
                        </div>
                    </aside>
                </section>
            </main>

            {/* Modal สำหรับแสดงรายละเอียดพื้นที่ */}
            {isModalOpen && selectedSpace && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button onClick={closeModal} className="close-modal">✖</button>
                        <h2>{selectedSpace.name}</h2>
                        <img src={`http://localhost:5000/uploads/${selectedSpace.image}`} alt={selectedSpace.name} />
                        <p>{selectedSpace.advertisingWords}</p>
                        <p>{selectedSpace.address}</p>
                        <p>Price: {selectedSpace.price} THB</p>
                        <button onClick={handleReserve} className="reserve-button">Reserve</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
