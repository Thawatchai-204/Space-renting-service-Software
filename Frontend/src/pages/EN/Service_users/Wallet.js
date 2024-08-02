import React from 'react';
import './Wallet.css';

function Wallet() {
    return (
        <div className="wallet-container">
            <aside className="sidebar">
                <div className="logo">
                    <li><a href="/Home"><img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/main/Screenshot%202024-07-26%20013811.png" alt="Logo" /></a></li>
                </div>
                <nav>
                    <ul>
                        <li><a href="/Home">Home</a></li>
                        <li><a href="/Reserve">Reserve</a></li>
                        <li className="active"><a href="/Profile">Profile</a></li>
                        <li><a href="/Settings">Settings</a></li>
                        <li className="logout"><a href="/login">Log out</a></li>
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
                        <span className="balance">- BATH</span>
                        <button className="top-up-button">TOP UP</button>
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
                                <tr>
                                        
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Wallet;
