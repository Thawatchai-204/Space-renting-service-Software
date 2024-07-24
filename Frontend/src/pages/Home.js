import React from 'react';
import './Home.css';

function Home() {
    return (
        <div className="home-container">
            <aside className="sidebar">
                <div className="logo">
                    <img src="your-logo-url" alt="Logo" />
                </div>
                <nav>
                    <ul>
                        <li className="active"><a href="/Home">Home</a></li>
                        <li><a href="/Reserve">Reserve</a></li>
                        <li><a href="/Profile">Profile</a></li>
                        <li><a href="/Settings">Settings</a></li>
                        <li><a href="/login">Log in</a></li>
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
                        <span className="user-name">jusmean jojo</span>
                        <span className="user-balance">500 bath</span>
                    </div>
                </header>
                <section className="management-section">
                    <button className="management-button">Status</button>
                    <button className="management-button">Reseved</button>
                    <button className="management-button">Promotion</button>
                </section>
                <section className="ready-to-reserve">
                    <h2>Ready to Reseve</h2>
                    <div className="storage-options">
                        <div className="storage-option">
                            <img src="image-url" alt="Spaceup Storage" />
                            <h3>SPACEUP STORAGE</h3>
                            <p>Wide space suitable for storing a lot of things.</p>
                        </div>
                        <div className="storage-option">
                            <img src="image-url" alt="RCK Storage" />
                            <h3>RCK Storage</h3>
                            <p>Can store products coming from the factory. Located next to the road, convenient to travel.</p>
                        </div>
                        <div className="storage-option">
                            <img src="image-url" alt="Pnat Storage Hub" />
                            <h3>Pnat Storage Hub</h3>
                            <p>Lockers for storing personal items. It is safe. No more worries about lost items.</p>
                        </div>
                        {/* Add more storage options as needed */}
                    </div>
                </section>
                <aside className="filter-section">
                    <h2>Filter</h2>
                    <div className="filter-group">
                        <label>Price</label>
                        <select>
                            <option value="">Select</option>
                            {/* Add more options as needed */}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Types</label>
                        <select>
                            <option value="">Select</option>
                            {/* Add more options as needed */}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Size</label>
                        <select>
                            <option value="">Select</option>
                            {/* Add more options as needed */}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Start-End Date</label>
                        <input type="date" />
                    </div>
                    <button className="apply-button">Apply</button>
                </aside>
            </main>
        </div>
    );
}

export default Home;
