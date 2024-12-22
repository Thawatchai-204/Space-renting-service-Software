import React, { useEffect, useState } from 'react';
import './Reservations.css';
import axios from 'axios';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import './Reservations.css';



function Reservations() {
  const [reservations, setReservations] = useState([]);
  const userId = localStorage.getItem('userId'); 

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/bookings/${userId}`);
        setReservations(response.data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    };

    fetchReservations();
  }, [userId]);

  return (
    <div className="reservations-container">
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
            <li><a href="/Home"><FaHome /> Home</a></li>
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
          <h1>My Reservations</h1>
        </header>
        <section className="reservation-list">
          {reservations.length > 0 ? (
            reservations.map((reservation) => (
              <div key={reservation._id} className="reservation-item">
                <h3>{reservation.spaceId.name}</h3>
                <p>Address: {reservation.spaceId.address}</p>
                <p>Reserved Date: {reservation.date}</p>
                <p>Reserved Time: {reservation.time}</p>
              </div>
            ))
          ) : (
            <p>No reservations found.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default Reservations;
