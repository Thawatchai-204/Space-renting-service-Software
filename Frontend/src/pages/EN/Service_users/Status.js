import React, { useEffect, useState } from 'react';
import './Home.css';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { getSpaces } from '../../../services/api';

function Home() {
    const [spaces, setSpaces] = useState([]);

    useEffect(() => {
        async function fetchSpaces() {
            try {
                const data = await getSpaces();
                setSpaces(data);
            } catch (error) {
                console.error('Error fetching spaces:', error);
            }
        }

        fetchSpaces();
    }, []);

    return (
        <div className="home-container">
            <aside className="sidebar">
                <div className="logo">
                    <li><a href="/Home"><img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/main/Screenshot%202024-07-26%20013811.png" alt="Logo" /></a></li>
                </div>
                <nav>
                    <ul>
                        <li className="active"><a href="/Home"><FaHome /> Home</a></li>
                        <li><a href="/Reserve"><FaCalendarAlt /> Reserve</a></li>
                        <li><a href="/Profile"><FaUser /> Profile</a></li>
                        <li><a href="/Settings"><FaCog /> Settings</a></li>
                        <li className="logout"><a href="/login"><FaSignOutAlt /> Log out</a></li>
                    </ul>
                </nav>
            </aside>
            <main className="main-content">
                <header>
                    <h1>Home</h1>
                    <div className="search-bar">
                        <input type="text" placeholder="Search Here" />
                    </div>
                    <div className="user-info">
                        <span className="notification-icon">🔔</span>
                        <li><a href="/Profile"><span className="user-name">User</span></a></li>
                        <li><a href="/Wallet"><span className="user-balance">Wallet</span></a></li>
                    </div>
                </header>
                <section className="content">
                    <div className="main-content-section">
                        <div className="management-section">
                            <button className="management-button"><li><a href="/Status"><span className="user-name">Status</span></a></li></button>
                            <button className="management-button">Reserved</button>
                            <button className="management-button">Promotion</button>
                        </div>
                        <section className="ready-to-reserve">
                            <h2>Ready to Reserve</h2>
                            <div className="spaces-list">
                                {spaces.map((space) => (
                                    <div key={space.id} className="space-item">
                                        <img src={space.image} alt={space.name} />
                                        <h3>{space.name}</h3>
                                        <p>{space.description}</p>
                                        <p>Price: {space.price} baht</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                    <aside className="filter-section">
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
                                {/* Add more options*/}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Size</label>
                            <select>
                                <option value="">Select</option>
                                {/* Add more options*/}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Start-End Date</label>
                            <input type="date" />
                        </div>
                        <button className="apply-button">Apply</button>
                    </aside>
                </section>
            </main>
        </div>
    );
}

export default Home;
