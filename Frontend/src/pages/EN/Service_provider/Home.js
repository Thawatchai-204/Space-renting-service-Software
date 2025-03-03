// src/pages/EN/Service_users/Home.js
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import { FaHome, FaPlus, FaList, FaUsers, FaCog, FaSignOutAlt, FaBell, FaSearch, FaArrowRight, FaCalendar, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { LanguageContext } from '../../../LanguageContext'; // ตรวจสอบเส้นทางนำเข้า

function Home() {
    const { language, toggleLanguage } = useContext(LanguageContext); // ใช้ useContext เพื่อเข้าถึงภาษาและฟังก์ชันเปลี่ยนภาษา
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
    const [currentPage, setCurrentPage] = useState(1);
    const [spacesPerPage] = useState(20);

    const navigate = useNavigate();

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

    // Pagination Logic
    const indexOfLastSpace = currentPage * spacesPerPage;
    const indexOfFirstSpace = indexOfLastSpace - spacesPerPage;
    const currentSpaces = spaces.slice(indexOfFirstSpace, indexOfLastSpace);

    const nextPage = () => {
        if (currentPage < Math.ceil(spaces.length / spacesPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Switch Role Function
    const handleSwitchRole = () => {
        navigate('/home'); // ต้องตรงกับเส้นทางใน App.js
    };

    return (
        <div className="container-fluid">
            {/* Fixed Top Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm">
                <div className="container-fluid">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link active" href="/Home"><FaHome className="me-2" /> {language === 'EN' ? 'Home' : 'หน้าหลัก'}</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/Addspace"><FaPlus className="me-2" /> {language === 'EN' ? 'Add Space' : 'เพิ่มพื้นที่'}</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/Managespace"><FaList className="me-2" /> {language === 'EN' ? 'Manage Space' : 'จัดการพื้นที่'}</a>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link btn btn-link" onClick={handleSwitchRole}><FaUsers className="me-2" /> {language === 'EN' ? 'Switch Role' : 'เปลี่ยนบทบาท'}</button>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/Settings"><FaCog className="me-2" /> {language === 'EN' ? 'Settings' : 'ตั้งค่า'}</a>
                            </li>
                        </ul>
                        <div className="d-flex align-items-center gap-3">
                            <a href="/Profile" className="text-decoration-none text-light"> {username || 'User'}</a>
                            <a href="/Wallet" className="btn btn-outline-light btn-sm"><FaBell className="me-2" /> {language === 'EN' ? 'Wallet' : 'กระเป๋าเงิน'}: {walletBalance} THB</a>
                            <a href="/login" className="btn btn-danger btn-sm"><FaSignOutAlt className="me-2" /> {language === 'EN' ? 'Logout' : 'ออกจากระบบ'}</a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Header Image with Search Bar */}
            <div className="header-image position-relative">
                <img
                    src="https://images.unsplash.com/photo-1531973576160-7125cd663d86?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                    alt="Header"
                    className="img-fluid w-100"
                    style={{ height: '400px', objectFit: 'cover' }}
                />
                <div className="header-content position-absolute top-50 start-50 translate-middle text-center text-white">
                    <h1 className="fw-bold">{language === 'EN' ? 'Welcome to Our Space Rental Service provider' : 'ยินดีต้อนรับสู่บริการเช่าพื้นที่'}</h1>
                    <p className="lead">{language === 'EN' ? 'Find the perfect space for your needs' : 'ค้นหาพื้นที่ที่เหมาะกับความต้องการของคุณ'}</p>
                    <div className="input-group mt-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <input type="text" className="form-control form-control-lg" placeholder={language === 'EN' ? 'Search Here' : 'ค้นหาที่นี่'} />
                        <button className="btn btn-primary btn-lg" type="button"><FaSearch /></button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container-fluid mt-5 pt-4">
                <header className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="fw-bold">{language === 'EN' ? 'Service provider' : 'ผู้ให้บริการ'}</h1>
                </header>

                {/* Reservations Section */}
                <section className="mb-5">
                    <h2 className="fw-bold">{language === 'EN' ? 'My Reservations' : 'การจองของฉัน'}</h2>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {reservations.length > 0 ? (
                            reservations.map((reservation) => (
                                <div key={reservation._id} className="col">
                                    <div className="card h-100 shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title fw-bold">{reservation.spaceName}</h5>
                                            <p className="card-text">{language === 'EN' ? 'From:' : 'ตั้งแต่:'} {reservation.startDate} {reservation.startTime}</p>
                                            <p className="card-text">{language === 'EN' ? 'To:' : 'ถึง:'} {reservation.endDate} {reservation.endTime}</p>
                                            <p className="card-text">{language === 'EN' ? 'Total Price:' : 'ราคารวม:'} {reservation.totalPrice} THB</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>{language === 'EN' ? 'No reservations available at the moment.' : 'ไม่มีข้อมูลการจองในขณะนี้'}</p>
                        )}
                    </div>
                </section>

                {/* Spaces Section */}
                <section>
                    <h2 className="fw-bold">{language === 'EN' ? 'Ready to Reserve' : 'พร้อมให้จอง'}</h2>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                        {currentSpaces.length > 0 ? (
                            currentSpaces.map((space) => (
                                <div key={space._id} className="col">
                                    <div className="card h-100 shadow-sm space-card">
                                        <img src={`http://localhost:5000/uploads/${space.image}`} className="card-img-top" alt={space.name} />
                                        <div className="card-body">
                                            <h5 className="card-title fw-bold">{space.name}</h5>
                                            <p className="card-text text-muted">{space.advertisingWords}</p>
                                            <p className="card-text"><small className="text-muted">{space.address}</small></p>
                                            <p className="card-text fw-bold">{language === 'EN' ? 'Price per Hour:' : 'ราคาต่อชั่วโมง:'} {space.pricePerHour || 'N/A'} THB</p>
                                            <button onClick={() => openModal(space)} className="btn btn-secondary w-100">{language === 'EN' ? 'View Details' : 'ดูรายละเอียด'}</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>{language === 'EN' ? 'No spaces available at the moment.' : 'ไม่มีพื้นที่ว่างในขณะนี้'}</p>
                        )}
                    </div>
                    {/* Pagination Button */}
                    <div className="d-flex justify-content-center mt-4">
                        <button onClick={nextPage} className="btn btn-dark">
                            {language === 'EN' ? 'Next Page' : 'หน้าถัดไป'} <FaArrowRight className="ms-2" />
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer with Logo and Language Toggle */}
            <footer className="bg-dark text-light py-4 mt-5">
                <div className="container text-center">
                    <img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/refs/heads/main/Screenshot%20202024-07-26%2020013811.png" alt="Logo" width="100" />
                    <p className="mt-3">© 2023 {language === 'EN' ? 'All rights reserved.' : 'สงวนลิขสิทธิ์'}</p>
                    <div className="mt-2">
                        <button
                            onClick={() => toggleLanguage('EN')}
                            className="btn btn-link text-light"
                        >
                            🇺🇸
                        </button>
                        <button
                            onClick={() => toggleLanguage('TH')}
                            className="btn btn-link text-light"
                        >
                            🇹🇭
                        </button>
                    </div>
                </div>
            </footer>

            {/* Modal */}
            {isModalOpen && selectedSpace && (
                <div className="modal fade show" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">{selectedSpace.name}</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <img src={`http://localhost:5000/uploads/${selectedSpace.image}`} className="img-fluid rounded" alt={selectedSpace.name} />
                                    </div>
                                    <div className="col-md-6">
                                        <p className="text-muted">{selectedSpace.advertisingWords}</p>
                                        <p className="text-muted"><FaCalendar className="me-2" />{selectedSpace.address}</p>
                                        <p className="fw-bold">{language === 'EN' ? 'Price per Hour:' : 'ราคาต่อชั่วโมง:'} {selectedSpace.pricePerHour || 'N/A'} THB</p>
                                        <hr />
                                        <h6 className="fw-bold">{language === 'EN' ? 'Reservation Details' : 'รายละเอียดการจอง'}</h6>
                                        <div className="mb-3">
                                            <label className="form-label">{language === 'EN' ? 'Start Date:' : 'วันที่เริ่มต้น:'}</label>
                                            <input type="date" className="form-control" value={reservationStartDate} onChange={(e) => setReservationStartDate(e.target.value)} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">{language === 'EN' ? 'End Date:' : 'วันที่สิ้นสุด:'}</label>
                                            <input type="date" className="form-control" value={reservationEndDate} onChange={(e) => setReservationEndDate(e.target.value)} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">{language === 'EN' ? 'Start Time:' : 'เวลาเริ่มต้น:'}</label>
                                            <input type="time" className="form-control" value={reservationStartTime} onChange={(e) => setReservationStartTime(e.target.value)} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">{language === 'EN' ? 'End Time:' : 'เวลาสิ้นสุด:'}</label>
                                            <input type="time" className="form-control" value={reservationEndTime} onChange={(e) => setReservationEndTime(e.target.value)} />
                                        </div>
                                        <div className="mb-3">
                                            <p className="fw-bold">{language === 'EN' ? 'Total Price:' : 'ราคารวม:'} {calculateTotalPrice()} THB</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>{language === 'EN' ? 'Close' : 'ปิด'}</button>
                                <button type="button" className="btn btn-primary" onClick={handleReserve}>{language === 'EN' ? 'Reserve' : 'จอง'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;