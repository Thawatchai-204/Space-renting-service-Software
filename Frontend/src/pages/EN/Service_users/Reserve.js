import React from 'react';
import './Reserve.css';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

function Home() {
    return (
        <div className="home-container">
            <aside className="sidebar">
                <div className="logo">
                <li><a href="/Home"><img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/main/Screenshot%202024-07-26%20013811.png" alt="Logo" /></a></li>
                    
                </div>
                <nav>
                    <ul>
                        <li><a href="/Home"><FaHome /> Home</a></li>
                        <li className="active"><a href="/Reserve"><FaCalendarAlt /> Reserve</a></li>
                        <li><a href="/Profile"><FaUser /> Profile</a></li>
                        <li><a href="/Settings"><FaCog /> Settings</a></li>
                        <li className="logout"><a href="/login"><FaSignOutAlt /> Log out</a></li>
                    </ul>
                </nav>
            </aside>
            <main className="main-content">
                <header>
                    <h1>Reserve</h1>
                    <div className="user-info">
                        <span className="notification-icon">🔔</span>
                        <li><a href="/Profile"><span className="user-name">User</span></a></li>
                        <li><a href="/Wallet"><span className="user-balance">Wallet</span></a></li>
                    </div>
                </header>
                <section className="content">
                    <div className="main-content-section">

                        <section className="ready-to-reserve">
                                                 
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
