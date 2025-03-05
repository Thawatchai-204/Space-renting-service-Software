import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import { FaHome, FaUsers, FaCog, FaSignOutAlt, FaBell, FaSearch, FaArrowRight, FaArrowLeft, FaCalendar, FaClock, FaTrash, FaExpand, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import axios from 'axios';
import { LanguageContext } from '../../../LanguageContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import debounce from 'lodash/debounce'; // ต้องติดตั้ง lodash

function Home() {
    const { language, toggleLanguage } = useContext(LanguageContext);
    const [spaces, setSpaces] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [selectedReservation, setSelectedReservation] = useState(null);
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
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [expandedImage, setExpandedImage] = useState(null);
    const [isReservationsCollapsed, setIsReservationsCollapsed] = useState(false);
    const [isReserving, setIsReserving] = useState(false); // สถานะล็อกการจอง

    const navigate = useNavigate();

    const setupAxiosAuth = () => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
            navigate('/login');
        }
    };

    const fetchUserProfile = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
            const userData = response.data;
            setUsername(userData.username || 'User');
            localStorage.setItem('username', userData.username || '');
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        }
    };

    const fetchSpaces = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/spaces');
            setSpaces(response.data || []);
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลพื้นที่:', error);
            setSpaces([]);
        }
    };

    const fetchWalletBalance = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/wallet/${userId}`);
            setWalletBalance(response.data.balance || 0);
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงยอดเงินในกระเป๋า:', error);
            setWalletBalance(0);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        }
    };

    const fetchReservations = async (userId) => {
        try {
            if (!userId) {
                console.error('ไม่พบรหัสผู้ใช้สำหรับดึงข้อมูลการจอง');
                setReservations([]);
                return;
            }
            const response = await axios.get(`http://localhost:5000/api/reservations/${userId}`);
            setReservations(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลการจอง:', error.message);
            setReservations([]);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        setupAxiosAuth();
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
            fetchUserProfile(storedUserId);
            fetchWalletBalance(storedUserId);
            fetchReservations(storedUserId);
            fetchSpaces();
        } else {
            console.error('ไม่พบรหัสผู้ใช้ใน localStorage กำลังเปลี่ยนเส้นทางไปที่หน้าเข้าสู่ระบบ...');
            navigate('/login');
        }
    }, [navigate]);

    const openSpaceModal = (space) => {
        setSelectedSpace(space);
        setSelectedReservation(null);
        setIsModalOpen(true);
    };

    const openReservationModal = (reservation) => {
        setSelectedReservation(reservation);
        setSelectedSpace(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedSpace(null);
        setSelectedReservation(null);
        setReservationStartDate('');
        setReservationEndDate('');
        setReservationStartTime('');
        setReservationEndTime('');
        setIsModalOpen(false);
        setExpandedImage(null);
    };

    const calculateTotalPrice = () => {
        if (!reservationStartDate || !reservationEndDate || !reservationStartTime || !reservationEndTime) return 0;
        const startDateTime = new Date(`${reservationStartDate}T${reservationStartTime}`);
        const endDateTime = new Date(`${reservationEndDate}T${reservationEndTime}`);
        if (startDateTime >= endDateTime) return 0;
        const hoursUsed = Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60));
        return hoursUsed * (selectedSpace?.pricePerHour || 0);
    };

    const calculateRemainingTime = (reservation) => {
        const now = new Date();
        const endDateTime = new Date(`${reservation.endDate}T${reservation.endTime}`);
        const diffMs = endDateTime - now;
        if (diffMs <= 0) return language === 'EN' ? "Expired" : "หมดอายุ";
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days} ${language === 'EN' ? 'days' : 'วัน'}, ${hours} ${language === 'EN' ? 'hours' : 'ชั่วโมง'}`;
    };

    const checkOverlap = async (spaceId, startDate, endDate, startTime, endTime) => {
        try {
            const response = await axios.post('http://localhost:5000/api/check-availability', {
                spaceId,
                startDate,
                endDate,
                startTime,
                endTime,
            });
            return response.data.available;
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการตรวจสอบความพร้อมใช้งาน:', error);
            return false;
        }
    };

    const handleReserve = async () => {
        if (isReserving) {
            console.log('การจองถูกเรียกซ้ำ ข้ามการดำเนินการ');
            return;
        }
    
        if (!userId || !selectedSpace || !selectedSpace._id || !reservationStartDate || !reservationEndDate || !reservationStartTime || !reservationEndTime) {
            alert(language === 'EN' ? 'Please complete all required fields.' : 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
    
        const totalPrice = calculateTotalPrice();
        if (totalPrice === 0) {
            alert(language === 'EN' ? 'Invalid time range.' : 'ช่วงเวลาไม่ถูกต้อง');
            return;
        }
        if (walletBalance < totalPrice) {
            alert(language === 'EN' ? 'Insufficient wallet balance.' : 'ยอดเงินในกระเป๋าไม่เพียงพอ');
            return;
        }
    
        const isAvailable = await checkOverlap(selectedSpace._id, reservationStartDate, reservationEndDate, reservationStartTime, reservationEndTime);
        if (!isAvailable) {
            alert(language === 'EN' ? 'This time slot is already booked.' : 'ช่วงเวลานี้ถูกจองแล้ว');
            return;
        }
    
        setIsReserving(true);
        console.log('เริ่มการจอง:', { userId, spaceId: selectedSpace._id, totalPrice, timestamp: new Date().toISOString() });
    
        try {
            // สร้าง request ID ที่ไม่ซ้ำกันอย่างสมบูรณ์
            const requestId = `${Date.now().toString()}-${Math.random().toString(36).substr(2, 9)}-${userId}-${selectedSpace._id}`;
            const reservationResponse = await axios.post('http://localhost:5000/api/reserve', {
                spaceId: selectedSpace._id,
                userId: userId,
                startDate: reservationStartDate,
                endDate: reservationEndDate,
                startTime: reservationStartTime,
                endTime: reservationEndTime,
                totalPrice: totalPrice,
            }, {
                headers: { 'X-Request-Id': requestId } // ส่ง requestId ไปยัง backend
            });
    
            if (reservationResponse.data.success) {
                // หักเงินจากผู้จองเพียงครั้งเดียว
                console.log('หักเงินจากผู้จอง (Booking payment):', { userId, amount: -totalPrice, requestId });
                await axios.put(`http://localhost:5000/api/wallet/${userId}`, { amount: -totalPrice }, {
                    headers: { 'X-Request-Id': requestId }
                });
    
                // เพิ่มเงินให้เจ้าของพื้นที่
                const ownerId = selectedSpace.userId;
                if (ownerId && ownerId.toString()) {
                    console.log('เพิ่มเงินให้เจ้าของ:', { ownerId, amount: totalPrice, requestId });
                    await axios.put(`http://localhost:5000/api/wallet/${ownerId}`, { amount: totalPrice }, {
                        headers: { 'X-Request-Id': requestId }
                    });
                } else {
                    console.error('ไม่พบรหัสเจ้าของพื้นที่ (userId) หรือค่าไม่ถูกต้อง:', selectedSpace);
                    toast.error(language === 'EN' ? 'Failed to credit owner wallet. Owner ID not found.' : 'ไม่สามารถเพิ่มเงินให้เจ้าของพื้นที่ได้ รหัสเจ้าของไม่ถูกต้อง', { position: "top-center", autoClose: 2000 });
                }
    
                // อัปเดตข้อมูล
                fetchWalletBalance(userId);
                fetchReservations(userId);
                toast.success(language === 'EN' ? `Successfully reserved ${selectedSpace.name}!` : `จอง ${selectedSpace.name} สำเร็จ!`, { position: "top-center", autoClose: 2000 });
                navigate('/Home');
                closeModal();
            } else {
                alert(reservationResponse.data.message || (language === 'EN' ? 'Successfully reserved' : 'จองสำเร็จ!'));
                navigate('/Home');
            }
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการจอง:', error);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            } else {
                alert(language === 'EN' ? 'Successfully reserved' : 'ไจองสำเร็จ!');
                navigate('/Home');
            }
        } finally {
            setIsReserving(false);
            console.log('สิ้นสุดการจอง');
        }
    };
    

    // สร้างฟังก์ชัน debouncedHandleReserve
    const debouncedHandleReserve = debounce(() => {
        handleReserve();
    }, 300); 


    const handleDeleteReservation = async (reservationId) => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/reservations/${reservationId}`);
            if (response.data.success) {
                fetchReservations(userId);
                toast.success(language === 'EN' ? 'Reservation deleted successfully!' : 'ลบการจองสำเร็จ!', { position: "top-center", autoClose: 2000 });
            } else {
                alert(response.data.message || (language === 'EN' ? 'Failed to delete reservation.' : 'ไม่สามารถลบการจองได้'));
            }
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการลบการจอง:', error);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            } else {
                alert(language === 'EN' ? 'Failed to delete reservation.' : 'ไม่สามารถลบการจองได้');
            }
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
        setCurrentPage(1);
    };

    const filterSpacesByDate = (space) => {
        if (!filterStartDate || !filterEndDate) return true;
        const filterStart = new Date(filterStartDate);
        const filterEnd = new Date(filterEndDate);
        return reservations.every(res => {
            if (res.spaceId === space._id) {
                const resStart = new Date(`${res.startDate}T${res.startTime}`);
                const resEnd = new Date(`${res.endDate}T${res.endTime}`);
                return (filterEnd < resStart || filterStart > resEnd);
            }
            return true;
        });
    };

    const filteredSpaces = spaces.filter(space => 
        (space.name.toLowerCase().includes(searchQuery) || 
         space.advertisingWords.toLowerCase().includes(searchQuery) ||
         space.address.toLowerCase().includes(searchQuery)) &&
        filterSpacesByDate(space)
    );

    const indexOfLastSpace = currentPage * spacesPerPage;
    const indexOfFirstSpace = indexOfLastSpace - spacesPerPage;
    const currentSpaces = filteredSpaces.slice(indexOfFirstSpace, indexOfLastSpace);

    const nextPage = () => {
        if (currentPage < Math.ceil(filteredSpaces.length / spacesPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleSwitchRole = () => {
        navigate('/Service_provider/home');
    };

    const expandImage = (image) => {
        setExpandedImage(image);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <ToastContainer />
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm">
                <div className="container">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item"><a className="nav-link" href="/Home"><FaHome className="me-2" /> {language === 'EN' ? 'Home' : 'หน้าหลัก'}</a></li>
                            <li className="nav-item"><button className="nav-link btn btn-link" onClick={handleSwitchRole}><FaUsers className="me-2" /> {language === 'EN' ? 'Switch Role' : 'เปลี่ยนบทบาท'}</button></li>
                            <li className="nav-item"><a className="nav-link" href="/Settings"><FaCog className="me-2" /> {language === 'EN' ? 'Settings' : 'ตั้งค่า'}</a></li>
                        </ul>
                        <div className="d-flex align-items-center gap-3">
                            <a href="/Profile" className="text-decoration-none text-light">{username || 'User'}</a>
                            <a href="/Wallet" className="btn btn-outline-light btn-sm"><FaBell className="me-2" /> {language === 'EN' ? 'Wallet' : 'กระเป๋าเงิน'}: {walletBalance} THB</a>
                            <button onClick={handleLogout} className="btn btn-danger btn-sm"><FaSignOutAlt className="me-2" /> {language === 'EN' ? 'Logout' : 'ออกจากระบบ'}</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Header */}
            <div className="container mt-5 pt-5">
                <div className="header-image position-relative mb-4">
                    <img
                        src="https://images.unsplash.com/photo-1531973576160-7125cd663d86?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                        alt="Header"
                        className="img-fluid w-100 shadow"
                        style={{ height: '250px', objectFit: 'cover', borderRadius: '10px' }}
                    />
                    <div className="header-content position-absolute top-50 start-50 translate-middle text-center text-white">
                        <h1 className="fw-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)', fontSize: '2rem' }}>{language === 'EN' ? 'Welcome to Our Space Rental Service' : 'ยินดีต้อนรับสู่บริการเช่าพื้นที่'}</h1>
                        <p className="lead" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{language === 'EN' ? 'Find the perfect space for your needs' : 'ค้นหาพื้นที่ที่เหมาะกับความต้องการของคุณ'}</p>
                        <div className="input-group mt-3" style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <input
                                type="text"
                                className="form-control shadow-sm"
                                placeholder={language === 'EN' ? 'Search Here' : 'ค้นหาที่นี่'}
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                            <button className="btn btn-primary shadow-sm" type="button"><FaSearch /></button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <header className="mb-4 text-center">
                    <h1 className="fw-bold text-dark" style={{ fontSize: '2rem' }}>{language === 'EN' ? 'Service User' : 'ผู้ใช้บริการ'}</h1>
                </header>

                {/* Reservations Section */}
                <section className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2 className="fw-bold text-dark">{language === 'EN' ? 'My Reservations' : 'การจองของฉัน'}</h2>
                        <button className="btn btn-link" onClick={() => setIsReservationsCollapsed(!isReservationsCollapsed)}>
                            {isReservationsCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                        </button>
                    </div>
                    {!isReservationsCollapsed && (
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
                            {reservations.length > 0 ? (
                                reservations.map((reservation) => (
                                    <div key={reservation._id} className="col">
                                        <div className="card shadow-sm" style={{ height: '250px' }}>
                                            <img
                                                src={reservation.image ? `http://localhost:5000/uploads/${reservation.image}` : 'https://via.placeholder.com/100'}
                                                className="card-img-top"
                                                alt={reservation.spaceName || 'No Image'}
                                                style={{ height: '100px', objectFit: 'cover' }}
                                                onError={(e) => (e.target.src = 'https://via.placeholder.com/100')}
                                            />
                                            <div className="card-body p-2">
                                                <h6 className="card-title fw-bold mb-1" style={{ fontSize: '0.9rem' }}>{reservation.spaceName || 'ไม่ทราบชื่อพื้นที่'}</h6>
                                                <p className="card-text mb-1" style={{ fontSize: '0.8rem' }}>{language === 'EN' ? 'From:' : 'ตั้งแต่:'} {reservation.startDate} {reservation.startTime}</p>
                                                <p className="card-text mb-1" style={{ fontSize: '0.8rem' }}>{language === 'EN' ? 'To:' : 'ถึง:'} {reservation.endDate} {reservation.endTime}</p>
                                                <p className="card-text mb-1" style={{ fontSize: '0.8rem' }}>{language === 'EN' ? 'Price:' : 'ราคา:'} {reservation.totalPrice || 0} THB</p>
                                                <div className="d-flex justify-content-between">
                                                    <button
                                                        onClick={() => openReservationModal(reservation)}
                                                        className="btn btn-secondary btn-sm"
                                                        style={{ fontSize: '0.8rem' }}
                                                    >
                                                        {language === 'EN' ? 'Details' : 'รายละเอียด'}
                                                    </button>
                                                    {calculateRemainingTime(reservation) === (language === 'EN' ? "Expired" : "หมดอายุ") && (
                                                        <button
                                                            onClick={() => handleDeleteReservation(reservation._id)}
                                                            className="btn btn-danger btn-sm"
                                                            style={{ fontSize: '0.8rem' }}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">{language === 'EN' ? 'No reservations available at the moment.' : 'ไม่มีข้อมูลการจองในขณะนี้'}</p>
                            )}
                        </div>
                    )}
                </section>

                {/* Spaces Section */}
                <section>
                    <h2 className="fw-bold text-dark mb-3">{language === 'EN' ? 'Ready to Reserve' : 'พร้อมให้จอง'}</h2>
                    <div className="row mb-3">
                        <div className="col-md-6 col-12 mb-2">
                            <label className="form-label">{language === 'EN' ? 'Start Date:' : 'วันที่เริ่มต้น:'}</label>
                            <input
                                type="date"
                                className="form-control shadow-sm"
                                value={filterStartDate}
                                onChange={(e) => { setFilterStartDate(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <div className="col-md-6 col-12 mb-2">
                            <label className="form-label">{language === 'EN' ? 'End Date:' : 'วันที่สิ้นสุด:'}</label>
                            <input
                                type="date"
                                className="form-control shadow-sm"
                                value={filterEndDate}
                                onChange={(e) => { setFilterEndDate(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
                        {currentSpaces.length > 0 ? (
                            currentSpaces.map((space) => (
                                <div key={space._id} className="col">
                                    <div className="card h-100 shadow-sm">
                                        <img src={`http://localhost:5000/uploads/${space.images[0]}`} className="card-img-top" alt={space.name} style={{ height: '150px', objectFit: 'cover' }} />
                                        <div className="card-body">
                                            <h5 className="card-title fw-bold">{space.name}</h5>
                                            <p className="card-text text-muted">{space.advertisingWords}</p>
                                            <p className="card-text"><small className="text-muted">{language === 'EN' ? 'Address:' : 'ที่อยู่:'} {space.address}</small></p>
                                            <p className="card-text"><small className="text-muted">{language === 'EN' ? 'Type:' : 'ประเภท:'} {space.types}</small></p>
                                            <p className="card-text"><small className="text-muted">{language === 'EN' ? 'Size:' : 'ขนาด:'} {space.size}</small></p>
                                            <p className="card-text fw-bold">{language === 'EN' ? 'Price per Hour:' : 'ราคาต่อชั่วโมง:'} {space.pricePerHour || 'N/A'} THB</p>
                                            <button onClick={() => openSpaceModal(space)} className="btn btn-primary w-100">{language === 'EN' ? 'View Details' : 'ดูรายละเอียด'}</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">{language === 'EN' ? 'No spaces available at the moment.' : 'ไม่มีพื้นที่ว่างในขณะนี้'}</p>
                        )}
                    </div>
                    <div className="d-flex justify-content-center mt-4 gap-3">
                        <button onClick={prevPage} className="btn btn-dark" disabled={currentPage === 1}>
                            <FaArrowLeft className="me-2" /> {language === 'EN' ? 'Previous' : 'ก่อนหน้า'}
                        </button>
                        <button onClick={nextPage} className="btn btn-dark" disabled={currentPage >= Math.ceil(filteredSpaces.length / spacesPerPage)}>
                            {language === 'EN' ? 'Next' : 'ถัดไป'} <FaArrowRight className="ms-2" />
                        </button>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="bg-dark text-light py-4 mt-5">
                <div className="container text-center">
                    <img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/refs/heads/main/Screenshot%20202024-07-26%2020013811.png" alt="Logo" width="100" />
                    <p className="mt-3">© 2023 {language === 'EN' ? 'All rights reserved.' : 'สงวนลิขสิทธิ์'}</p>
                    <div className="mt-2">
                        <button onClick={() => toggleLanguage('EN')} className="btn btn-link text-light">🇺🇸</button>
                        <button onClick={() => toggleLanguage('TH')} className="btn btn-link text-light">🇹🇭</button>
                    </div>
                </div>
            </footer>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '800px' }}>
                        <div className="modal-content">
                            {selectedSpace && !selectedReservation ? (
                                <>
                                    <div className="modal-header bg-primary text-white">
                                        <h5 className="modal-title fw-bold">{selectedSpace.name}</h5>
                                        <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                                    </div>
                                    <div className="modal-body p-4">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="d-flex flex-wrap gap-2 mb-3">
                                                    {selectedSpace.images.map((image, index) => (
                                                        <div key={index} className="position-relative">
                                                            <img
                                                                src={`http://localhost:5000/uploads/${image}`}
                                                                className="img-thumbnail"
                                                                alt={`${selectedSpace.name} ${index}`}
                                                                style={{ width: '120px', height: '120px', objectFit: 'cover', cursor: 'pointer' }}
                                                                onClick={() => expandImage(`http://localhost:5000/uploads/${image}`)}
                                                            />
                                                            <button
                                                                className="btn btn-sm btn-light position-absolute top-0 end-0"
                                                                onClick={() => expandImage(`http://localhost:5000/uploads/${image}`)}
                                                            >
                                                                <FaExpand />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                {expandedImage && (
                                                    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000 }}>
                                                        <img src={expandedImage} alt="Expanded" style={{ maxWidth: '90%', maxHeight: '90%' }} />
                                                        <button className="btn btn-light position-absolute top-0 end-0 m-3" onClick={() => setExpandedImage(null)}>{language === 'EN' ? 'Close' : 'ปิด'}</button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-md-6">
                                                <p className="mb-2"><strong>{language === 'EN' ? 'Description:' : 'คำโฆษณา:'}</strong> {selectedSpace.advertisingWords}</p>
                                                <p className="mb-2"><strong>{language === 'EN' ? 'Address:' : 'ที่อยู่:'}</strong> <FaCalendar className="me-2" /> {selectedSpace.address}</p>
                                                <p className="mb-2"><strong>{language === 'EN' ? 'Type:' : 'ประเภท:'}</strong> {selectedSpace.types}</p>
                                                <p className="mb-2"><strong>{language === 'EN' ? 'Size:' : 'ขนาด:'}</strong> {selectedSpace.size}</p>
                                                <p className="mb-2"><strong>{language === 'EN' ? 'Price per Hour:' : 'ราคาต่อชั่วโมง:'}</strong> {selectedSpace.pricePerHour || 'N/A'} THB</p>
                                                <hr />
                                                <h6 className="fw-bold mb-3">{language === 'EN' ? 'Reservation Details' : 'รายละเอียดการจอง'}</h6>
                                                <div className="row mb-3">
                                                    <div className="col-6">
                                                        <label className="form-label">{language === 'EN' ? 'Start Date:' : 'วันที่เริ่มต้น:'}</label>
                                                        <input type="date" className="form-control" value={reservationStartDate} onChange={(e) => setReservationStartDate(e.target.value)} />
                                                    </div>
                                                    <div className="col-6">
                                                        <label className="form-label">{language === 'EN' ? 'Start Time:' : 'เวลาเริ่มต้น:'}</label>
                                                        <input type="time" className="form-control" value={reservationStartTime} onChange={(e) => setReservationStartTime(e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="row mb-3">
                                                    <div className="col-6">
                                                        <label className="form-label">{language === 'EN' ? 'End Date:' : 'วันที่สิ้นสุด:'}</label>
                                                        <input type="date" className="form-control" value={reservationEndDate} onChange={(e) => setReservationEndDate(e.target.value)} />
                                                    </div>
                                                    <div className="col-6">
                                                        <label className="form-label">{language === 'EN' ? 'End Time:' : 'เวลาสิ้นสุด:'}</label>
                                                        <input type="time" className="form-control" value={reservationEndTime} onChange={(e) => setReservationEndTime(e.target.value)} />
                                                    </div>
                                                </div>
                                                <p className="fw-bold">{language === 'EN' ? 'Total Price:' : 'ราคารรวม:'} {calculateTotalPrice()} THB</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={closeModal}>{language === 'EN' ? 'Close' : 'ปิด'}</button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={debouncedHandleReserve}
                                            disabled={isReserving}
                                        >
                                            {isReserving ? (language === 'EN' ? 'Reserving...' : 'กำลังจอง...') : (language === 'EN' ? 'Reserve' : 'จอง')}
                                        </button>
                                    </div>
                                </>
                            ) : selectedReservation ? (
                                <>
                                    <div className="modal-header bg-info text-white">
                                        <h5 className="modal-title fw-bold">{selectedReservation.spaceName}</h5>
                                        <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                                    </div>
                                    <div className="modal-body p-4">
                                        <div className="row align-items-start">
                                            <div className="col-md-5">
                                                <img
                                                    src={selectedReservation.image ? `http://localhost:5000/uploads/${selectedReservation.image}` : 'https://via.placeholder.com/250'}
                                                    className="img-fluid rounded shadow-sm"
                                                    alt={selectedReservation.spaceName || 'ไม่มีรูปภาพ'}
                                                    style={{ maxHeight: '250px', objectFit: 'cover' }}
                                                    onError={(e) => (e.target.src = 'https://via.placeholder.com/250')}
                                                />
                                            </div>
                                            <div className="col-md-7">
                                                <div className="mb-3">
                                                    <p className="mb-2"><strong>{language === 'EN' ? 'Address:' : 'ที่อยู่:'}</strong> {selectedReservation.address}</p>
                                                    <p className="mb-2"><strong>{language === 'EN' ? 'Type:' : 'ประเภท:'}</strong> {selectedReservation.types}</p>
                                                    <p className="mb-2"><strong>{language === 'EN' ? 'Size:' : 'ขนาด:'}</strong> {selectedReservation.size}</p>
                                                    <p className="mb-2"><strong>{language === 'EN' ? 'Start:' : 'เริ่ม:'}</strong> {selectedReservation.startDate} {selectedReservation.startTime}</p>
                                                    <p className="mb-2"><strong>{language === 'EN' ? 'End:' : 'สิ้นสุด:'}</strong> {selectedReservation.endDate} {selectedReservation.endTime}</p>
                                                    <p className="mb-2"><strong>{language === 'EN' ? 'Remaining Time:' : 'ระยะเวลาคงเหลือ:'}</strong> {calculateRemainingTime(selectedReservation)}</p>
                                                    <p className="mb-2"><strong>{language === 'EN' ? 'Total Price:' : 'ราคารรวม:'}</strong> {selectedReservation.totalPrice} THB</p>
                                                    <p className="mb-2"><strong>{language === 'EN' ? 'Booking ID:' : 'รหัสการจอง:'}</strong> {selectedReservation._id}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={closeModal}>{language === 'EN' ? 'Close' : 'ปิด'}</button>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;