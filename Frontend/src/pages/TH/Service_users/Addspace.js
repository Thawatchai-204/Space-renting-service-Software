import React from 'react';
import './Addspace.css';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

function Reserve() {
    return (
        <div className="reserve-container">
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
                        <li><a href="/Profile"><span className="user-name">hazeijz jaz</span></a></li>
                    </div>
                </header>
                <section className="content">
                    <form className="reserve-form">
                        <div className="form-group">
                            <label>Name area:</label>
                            <input type="text" />
                        </div>
                        <div className="form-group">
                            <label>Advertising words:</label>
                            <input type="text" />
                        </div>
                        <div className="form-group">
                            <label>Address:</label>
                            <input type="text" />
                        </div>
                        <div className="form-group">
                            <label>Types:</label>
                            <input type="text" />
                        </div>
                        <div className="form-group-inline">
                            <div className="form-group">
                                <label>Size:</label>
                                <input type="text" />
                            </div>
                            <div className="form-group">
                                <label>Price:</label>
                                <input type="text" />
                            </div>
                        </div>
                        <div className="form-group">
                            <button className="save-button">Save</button>
                            <button className="cancel-button">Cancel</button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default Reserve;
