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
                        <li className="active"><a href="/Home"><FaHome /> หน้าแรก</a></li>
                        <li><a href="/Reserve"><FaCalendarAlt /> การจอง</a></li>
                        <li><a href="/Profile"><FaUser /> ข้อมูลส่วนตัว</a></li>
                        <li><a href="/Settings"><FaCog /> ตั้งค่า</a></li>
                        <li className="logout"><a href="/login"><FaSignOutAlt /> ออกจากระบบ</a></li>
                    </ul>
                </nav>
            </aside>
            <main className="main-content">
                <header>
                    <h1>หน้าแรก</h1>
                    <div className="search-bar">
                        <input type="text" placeholder="Search Here" />
                    </div>
                    <div className="user-info">
                        <span className="notification-icon">🔔</span>
                        <li><a href="/Profile"><span className="user-name">ผู้ใช้งาน</span></a></li>
                        <li><a href="/Wallet"><span className="user-balance">กระเป๋าเงิน</span></a></li>
                    </div>
                </header>
                <section className="content">
                    <div className="main-content-section">
                        <div className="management-section">
                            <button className="management-button">สถานะ</button>
                            <button className="management-button">ข้อมูลการจอง</button>
                            <button className="management-button">โปรโมชั่น</button>
                        </div>
                        <section className="ready-to-reserve">
                            <h2>พื้นที่ที่พร้อมให้บริการ</h2>
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
                        <h2>ตัวกรอง</h2>
                        <div className="filter-group">
                            <label>ราคา</label>
                            <select>
                                <option value="">ทั้งหมด</option>
                                <option value="less-500">น้อยกว่า 500 บาท</option>
                                <option value="less-1000">น้อยกว่า 1000 บาท</option>
                                <option value="more-1000">มากกว่า 1000 บาท</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>ประเภท</label>
                            <select>
                                <option value="">ทั้งหมด</option>
                                {/* Add more options*/}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>ขนาด
                            </label>
                            <select>
                                <option value="">ทั้งหมด</option>
                                {/* Add more options*/}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>ระยะเวลา</label>
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
