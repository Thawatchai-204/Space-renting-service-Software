import React, { useEffect, useState } from 'react';
import './Home.css';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';

function Home() {
    const [spaces, setSpaces] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState(null);
    const [reservationStartDate, setReservationStartDate] = useState('');
    const [reservationEndDate, setReservationEndDate] = useState('');
    const [reservationStartTime, setReservationStartTime] = useState('');
    const [reservationEndTime, setReservationEndTime] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
            fetchWalletBalance(storedUserId);
            fetchReservations(storedUserId);
        } else {
            console.error('User ID not found in localStorage');
        }
    }, []);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) setUsername(storedUsername);
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

    const fetchWalletBalance = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/wallet/${userId}`);
            setWalletBalance(response.data.balance || 0);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        }
    };

    const fetchReservations = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/reservations/${userId}`);
            setReservations(response.data);
        } catch (error) {
            console.error('Error fetching reservations:', error);
        }
    };

    const openModal = (space) => {
        setSelectedSpace(space);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedSpace(null);
        setReservationStartDate('');
        setReservationEndDate('');
        setReservationStartTime('');
        setReservationEndTime('');
        setIsModalOpen(false);
    };

    const calculateTotalPrice = () => {
        if (!reservationStartDate || !reservationEndDate || !reservationStartTime || !reservationEndTime) {
            return 0;
        }

        const startDateTime = new Date(`${reservationStartDate}T${reservationStartTime}`);
        const endDateTime = new Date(`${reservationEndDate}T${reservationEndTime}`);

        if (startDateTime >= endDateTime) {
            alert('Invalid time range. Please select a valid start and end time.');
            return 0;
        }

        const hoursUsed = Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60));
        const pricePerHour = selectedSpace?.pricePerHour || 0;

        return hoursUsed * pricePerHour;
    };

    const handleReserve = async () => {
        if (!userId) {
            alert('User ID not found. Please log in again.');
            return;
        }

        if (!reservationStartDate || !reservationEndDate || !reservationStartTime || !reservationEndTime) {
            alert('Please select both start and end dates and times.');
            return;
        }

        const totalPrice = calculateTotalPrice();

        if (walletBalance < totalPrice) {
            alert('Insufficient wallet balance.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/reserve', {
                spaceId: selectedSpace._id,
                userId: userId,
                startDate: reservationStartDate,
                endDate: reservationEndDate,
                startTime: reservationStartTime,
                endTime: reservationEndTime,
                totalPrice: totalPrice,
            });

            if (response.data.success) {
                await axios.put(`http://localhost:5000/api/wallet/${userId}`, {
                    amount: -totalPrice,
                });
                fetchWalletBalance(userId);
                fetchReservations(userId);
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
                    <a href="/Home">
                        <img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/refs/heads/main/Screenshot%20202024-07-26%2020013811.png" alt="Logo" />
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
                    <h1>Home</h1>
                    <div className="search-bar">
                        <input type="text" placeholder="Search Here" />
                    </div>
                    <div className="user-info">
                        <span className="notification-icon">🔔</span>
                        <a href="/Profile" className="user-name">{username || 'User'}</a>
                        <a href="/Wallet" className="user-balance">Wallet: {walletBalance} THB</a>
                    </div>
                </header>

                <section className="reservations-section">
                    <h2>My Reservations</h2>
                    <div className="reservations-list">
                        {reservations.length > 0 ? (
                            reservations.map((reservation) => (
                                <div key={reservation._id} className="reservation-item">
                                    <h3>{reservation.spaceName}</h3>
                                    <p>From: {reservation.startDate} {reservation.startTime}</p>
                                    <p>To: {reservation.endDate} {reservation.endTime}</p>
                                    <p>Total Price: {reservation.totalPrice} THB</p>
                                </div>
                            ))
                        ) : (
                            <p>No reservations available at the moment.</p>
                        )}
                    </div>
                </section>

                <section className="spaces-section">
                    <h2>Ready to Reserve</h2>
                    <div className="spaces-list">
                        {spaces.length > 0 ? (
                            spaces.map((space) => (
                                <div key={space._id} className="space-item">
                                    <img src={`http://localhost:5000/uploads/${space.image}`} alt={space.name} />
                                    <h3>{space.name}</h3>
                                    <p>{space.advertisingWords}</p>
                                    <p>{space.address}</p>
                                    <p>Price per Hour: {space.pricePerHour || 'N/A'} THB</p>
                                    <button onClick={() => openModal(space)} className="details-link">View Details</button>
                                </div>
                            ))
                        ) : (
                            <p>No spaces available at the moment.</p>
                        )}
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
                        <p>Price per Hour: {selectedSpace.pricePerHour || 'N/A'} THB</p>

                        <div>
                            <label>Select Start Date:</label>
                            <input type="date" value={reservationStartDate} onChange={(e) => setReservationStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label>Select End Date:</label>
                            <input type="date" value={reservationEndDate} onChange={(e) => setReservationEndDate(e.target.value)} />
                        </div>
                        <div>
                            <label>Select Start Time:</label>
                            <input type="time" value={reservationStartTime} onChange={(e) => setReservationStartTime(e.target.value)} />
                        </div>
                        <div>
                            <label>Select End Time:</label>
                            <input type="time" value={reservationEndTime} onChange={(e) => setReservationEndTime(e.target.value)} />
                        </div>
                        <div>
                            <p>Total Price: {calculateTotalPrice()} THB</p>
                        </div>

                        <button onClick={handleReserve} className="reserve-button">Reserve</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
