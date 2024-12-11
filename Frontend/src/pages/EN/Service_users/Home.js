import React, { useEffect, useState } from 'react';
import './Home.css';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';

function Home() {
    const [spaces, setSpaces] = useState([]);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState(null);
    const [reservationDate, setReservationDate] = useState('');
    const [reservationTime, setReservationTime] = useState('');

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        console.log('Loaded userId from localStorage:', storedUserId); // Debug
        if (storedUserId) {
            setUserId(storedUserId);
        } else {
            console.error('userId not found in localStorage');
        }
    }, []);
    
    
    // Load user data from localStorage
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedUserId = localStorage.getItem('userId');
        if (storedUsername) setUsername(storedUsername);
        if (storedUserId) {
            console.log('User ID from localStorage:', storedUserId);
            setUserId(storedUserId);
        } else {
            console.error('User ID not found in localStorage');
        }
    }, []);

    // Fetch spaces from the backend
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
        setReservationDate('');
        setReservationTime('');
        setIsModalOpen(false);
    };


    
    const handleReserve = async () => {
        if (!userId) {
            alert('User ID not found. Please log in again.');
            return;
        }
    
        if (!reservationDate || !reservationTime) {
            alert('Please select a date and time for the reservation.');
            return;
        }
    
        console.log('Sending reservation data:', {
            spaceId: selectedSpace._id,
            userId: userId,
            date: reservationDate,
            time: reservationTime,
        });
    
        try {
            const response = await axios.post('http://localhost:5000/api/reserve', {
                spaceId: selectedSpace._id,
                userId: userId,
                date: reservationDate,
                time: reservationTime,
            });
    
            if (response.data.success) {
                alert(`Successfully reserved ${selectedSpace.name}!`);
                closeModal();
            } else {
                alert(response.data.message || 'Failed to reserve space.');
            }
        } catch (error) {
            console.error('Failed to reserve space:', error);
            alert('Failed to reserve space.');
        }
    };
    
    

    return (
        <div className="home-container">
            <aside className="sidebar">
                <div className="logo">
                    <li>
                        <a href="/Home">
                            <img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/refs/heads/main/backend/img/logoSRSS.png" alt="Logo" />
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

            <main className="main-content">
                <header>
                    <h1>Home</h1>
                    <div className="search-bar">
                        <input type="text" placeholder="Search Here" />
                    </div>
                    <div className="user-info">
                        <span className="notification-icon">🔔</span>
                        <li><a href="/Profile"><span className="user-name">{username || 'User'}</span></a></li>
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
                </section>
            </main>

            {isModalOpen && selectedSpace && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button onClick={closeModal} className="close-modal">✖</button>
                        <h2>{selectedSpace.name}</h2>
                        <img src={`http://localhost:5000/uploads/${selectedSpace.image}`} alt={selectedSpace.name} />
                        <p>{selectedSpace.advertisingWords}</p>
                        <p>{selectedSpace.address}</p>
                        <p>Price: {selectedSpace.price} THB</p>

                        <div>
                            <label>Select Date:</label>
                            <input
                                type="date"
                                value={reservationDate}
                                onChange={(e) => setReservationDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Select Time:</label>
                            <input
                                type="time"
                                value={reservationTime}
                                onChange={(e) => setReservationTime(e.target.value)}
                            />
                        </div>

                        <button onClick={handleReserve} className="reserve-button">Reserve</button>
                    </div>
                </div>
            )}
        </div>
    );
    
}

export default Home;
