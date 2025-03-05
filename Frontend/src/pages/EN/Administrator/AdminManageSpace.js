import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminManageSpace.css';
import { FaHome, FaPlus, FaUsers, FaCog, FaSignOutAlt, FaBell, FaTrash, FaInfoCircle, FaEdit, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import { LanguageContext } from '../../../LanguageContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Home() {
    const { language, toggleLanguage } = useContext(LanguageContext);
    const [ownedSpaces, setOwnedSpaces] = useState([]);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [spacesPerPage] = useState(20);
    const [spaceBookings, setSpaceBookings] = useState([]);
    const navigate = useNavigate();

    const API_BASE_URL = 'http://localhost:5000';

    const setupAxiosAuth = () => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log('ตั้งค่าโทเค็นในส่วนหัวของ Axios:', token);
            return true;
        } else {
            delete axios.defaults.headers.common['Authorization'];
            toast.error(language === 'EN' ? 'Please log in to continue.' : 'กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ');
            navigate('/login');
            return false;
        }
    };

    useEffect(() => {
        if (setupAxiosAuth()) {
            const storedUserId = localStorage.getItem('userId');
            const storedUsername = localStorage.getItem('username');
            if (storedUserId) {
                setUserId(storedUserId);
                setUsername(storedUsername || 'User');
                fetchWalletBalance(storedUserId);
                fetchOwnedSpaces(storedUserId);
            } else {
                console.error('User ID not found in localStorage');
                toast.error(language === 'EN' ? 'User ID not found. Please log in again.' : 'ไม่พบรหัสผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
                navigate('/login');
            }
        }
    }, [navigate]);

    const fetchWalletBalance = async (userId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/wallet/${userId}`);
            setWalletBalance(response.data.balance || 0);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        }
    };

    const fetchOwnedSpaces = async (userId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/spaces`);
            const userSpaces = response.data.filter(space => space.userId === userId).map(space => ({
                ...space,
                _id: space._id.toString() // แปลง _id เป็น string
            }));
            setOwnedSpaces(userSpaces);
            console.log('Owned Spaces:', userSpaces);
        } catch (error) {
            console.error('Error fetching owned spaces:', error);
            setOwnedSpaces([]);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        }
    };

    const fetchSpaceBookings = async (spaceId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/reservations/${userId}`);
            const bookings = response.data.filter(booking => booking.spaceId === spaceId);
            setSpaceBookings(bookings);
            console.log('Space Bookings:', bookings);
        } catch (error) {
            console.error('Error fetching space bookings:', error);
            setSpaceBookings([]);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        }
    };

    const openModal = (space) => {
        setSelectedSpace(space);
        fetchSpaceBookings(space._id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedSpace(null);
        setIsModalOpen(false);
        setSpaceBookings([]);
    };

    const handleDeleteSpace = async (spaceId) => {
        if (window.confirm(language === 'EN' ? 'Are you sure you want to delete this space?' : 'คุณแน่ใจหรือไม่ว่าต้องการลบพื้นที่นี้?')) {
            try {
                await axios.delete(`${API_BASE_URL}/api/spaces/${spaceId}`);
                setOwnedSpaces(prevSpaces => prevSpaces.filter(space => space._id !== spaceId));
                toast.success(language === 'EN' ? 'Space deleted successfully!' : 'ลบพื้นที่สำเร็จ!', { position: "top-center", autoClose: 2000 });
            } catch (error) {
                console.error('Error deleting space:', error);
                toast.error(language === 'EN' ? 'Failed to delete space.' : 'ไม่สามารถลบพื้นที่ได้', { position: "top-center", autoClose: 2000 });
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            }
        }
    };

    const handleEditSpace = (spaceId) => {
        console.log('กำลังนำทางไปแก้ไข Space ID:', spaceId); // Debug การนำทาง
        if (setupAxiosAuth()) {
            navigate(`/AdminManageSpace/${spaceId}`, { state: { spaceId } }); // เปลี่ยนจาก Managespace เป็น AdminManageSpace
            toast.info(language === 'EN' ? 'Navigating to edit space...' : 'กำลังนำทางไปแก้ไขพื้นที่...', { autoClose: 2000 });
        } else {
            console.error('Authentication failed, cannot navigate to edit page');
            toast.error(language === 'EN' ? 'Authentication failed. Please log in again.' : 'การยืนยันตัวตนล้มเหลว กรุณาเข้าสู่ระบบใหม่');
        }
    };

    const indexOfLastSpace = currentPage * spacesPerPage;
    const indexOfFirstSpace = indexOfLastSpace - spacesPerPage;
    const currentSpaces = ownedSpaces.slice(indexOfFirstSpace, indexOfLastSpace);

    const nextPage = () => {
        if (currentPage < Math.ceil(ownedSpaces.length / spacesPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleSwitchRole = () => {
        navigate('/Home');
    };

    const handleLogout = () => {
        localStorage.clear();
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
                            <li className="nav-item">
                                <a className="nav-link active" href="/Service_provider/home"><FaHome className="me-2" /> {language === 'EN' ? 'Home' : 'หน้าหลัก'}</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/Addspace"><FaPlus className="me-2" /> {language === 'EN' ? 'Add Space' : 'เพิ่มพื้นที่'}</a>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link btn btn-link" onClick={handleSwitchRole}><FaUsers className="me-2" /> {language === 'EN' ? 'Switch Role' : 'เปลี่ยนบทบาท'}</button>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/Settings"><FaCog className="me-2" /> {language === 'EN' ? 'Settings' : 'ตั้งค่า'}</a>
                            </li>
                        </ul>
                        <div className="d-flex align-items-center gap-3">
                            <a href="/Profile" className="text-decoration-none text-light">{username || 'User'}</a>
                            <a href="/Wallet" className="btn btn-outline-light btn-sm">
                                <FaBell className="me-2" /> {language === 'EN' ? 'Wallet' : 'กระเป๋าเงิน'}: {walletBalance} THB
                            </a>
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
                        <h1 className="fw-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)', fontSize: '2rem' }}>{language === 'EN' ? 'Welcome to Service Provider Dashboard' : 'ยินดีต้อนรับสู่แดชบอร์ดผู้ให้บริการ'}</h1>
                        <p className="lead" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{language === 'EN' ? 'Manage your spaces efficiently' : 'จัดการพื้นที่ของคุณอย่างมีประสิทธิภาพ'}</p>
                    </div>
                </div>

                {/* Main Content */}
                <header className="mb-4 text-center">
                    <h1 className="fw-bold text-dark" style={{ fontSize: '2rem' }}>{language === 'EN' ? 'Service Provider Dashboard' : 'แดชบอร์ดผู้ให้บริการ'}</h1>
                </header>

                {/* Your Spaces Section */}
                <section className="mb-5">
                    <h2 className="fw-bold text-dark mb-3">{language === 'EN' ? 'Your Spaces' : 'พื้นที่ของคุณ'}</h2>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
                        {currentSpaces.length > 0 ? (
                            currentSpaces.map((space) => (
                                <div key={space._id} className="col">
                                    <div className="card h-100 shadow-sm">
                                        <img 
                                            src={space.images && space.images.length > 0 ? `${API_BASE_URL}/uploads/${space.images[0]}` : 'https://via.placeholder.com/150'} 
                                            className="card-img-top" 
                                            alt={space.name} 
                                            style={{ height: '150px', objectFit: 'cover' }} 
                                        />
                                        <div className="card-body">
                                            <h5 className="card-title fw-bold">{space.name}</h5>
                                            <p className="card-text text-muted">{space.advertisingWords}</p>
                                            <p className="card-text"><small className="text-muted">{space.address}</small></p>
                                            <p className="card-text fw-bold">{language === 'EN' ? 'Price per Hour:' : 'ราคาต่อชั่วโมง:'} {space.pricePerHour || 'N/A'} THB</p>
                                            <div className="d-flex justify-content-between">
                                                <button onClick={() => openModal(space)} className="btn btn-info btn-sm">
                                                    <FaInfoCircle className="me-2" /> {language === 'EN' ? 'Details' : 'รายละเอียด'}
                                                </button>
                                                <button onClick={() => handleDeleteSpace(space._id)} className="btn btn-danger btn-sm">
                                                    <FaTrash className="me-2" /> {language === 'EN' ? 'Delete' : 'ลบ'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center">
                                <p className="text-muted">{language === 'EN' ? 'You have not added any spaces yet.' : 'คุณยังไม่ได้เพิ่มพื้นที่ใด ๆ'}</p>
                                <a href="/Addspace" className="btn btn-primary mt-2">
                                    <FaPlus className="me-2" /> {language === 'EN' ? 'Add Your First Space' : 'เพิ่มพื้นที่แรกของคุณ'}
                                </a>
                            </div>
                        )}
                    </div>
                    {currentSpaces.length > 0 && (
                        <div className="d-flex justify-content-center mt-4 gap-3">
                            <button onClick={prevPage} className="btn btn-dark" disabled={currentPage === 1}>
                                <FaArrowLeft className="me-2" /> {language === 'EN' ? 'Previous' : 'ก่อนหน้า'}
                            </button>
                            <button onClick={nextPage} className="btn btn-dark" disabled={currentPage >= Math.ceil(ownedSpaces.length / spacesPerPage)}>
                                {language === 'EN' ? 'Next' : 'ถัดไป'} <FaArrowRight className="ms-2" />
                            </button>
                        </div>
                    )}
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
            {isModalOpen && selectedSpace && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    <div 
                        className="modal-dialog" 
                        style={{ 
                            width: '80%', 
                            maxWidth: '80%', 
                            height: '80vh', 
                            margin: 'auto', 
                            position: 'absolute', 
                            top: '50%', 
                            left: '50%', 
                            transform: 'translate(-50%, -50%)' 
                        }}
                    >
                        <div className="modal-content" style={{ borderRadius: '10px', overflow: 'hidden', height: '100%' }}>
                            <div className="modal-header bg-primary text-white" style={{ padding: '1.5rem', borderBottom: 'none' }}>
                                <h3 className="modal-title fw-bold">{selectedSpace.name}</h3>
                                <button type="button" className="btn-close btn-close-white" onClick={closeModal} style={{ fontSize: '1.5rem' }}></button>
                            </div>
                            <div className="modal-body p-5" style={{ backgroundColor: '#fff', overflowY: 'auto' }}>
                                <div className="container">
                                    <div className="row g-4">
                                        <div className="col-12">
                                            <div className="card shadow-sm">
                                                <div className="card-body p-4">
                                                    <h5 className="fw-bold mb-3">{language === 'EN' ? 'Images' : 'รูปภาพ'}</h5>
                                                    <div className="d-flex flex-wrap gap-3 mb-4">
                                                        {selectedSpace.images && selectedSpace.images.length > 0 ? (
                                                            selectedSpace.images.map((image, index) => (
                                                                <img
                                                                    key={index}
                                                                    src={`${API_BASE_URL}/uploads/${image}`}
                                                                    alt={`${selectedSpace.name} ${index + 1}`}
                                                                    className="img-fluid rounded shadow-sm"
                                                                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                                                                />
                                                            ))
                                                        ) : (
                                                            <p className="text-muted">{language === 'EN' ? 'No images available' : 'ไม่มีรูปภาพ'}</p>
                                                        )}
                                                    </div>

                                                    <h5 className="fw-bold mb-4">{language === 'EN' ? 'Space Details' : 'รายละเอียดพื้นที่'}</h5>
                                                    <p className="mb-3"><strong>{language === 'EN' ? 'Name:' : 'ชื่อ:'}</strong> {selectedSpace.name}</p>
                                                    <p className="mb-3"><strong>{language === 'EN' ? 'Description:' : 'คำโฆษณา:'}</strong> {selectedSpace.advertisingWords}</p>
                                                    <p className="mb-3"><strong>{language === 'EN' ? 'Address:' : 'ที่อยู่:'}</strong> {selectedSpace.address}</p>
                                                    <p className="mb-3"><strong>{language === 'EN' ? 'Type:' : 'ประเภท:'}</strong> {selectedSpace.types}</p>
                                                    <p className="mb-3"><strong>{language === 'EN' ? 'Size:' : 'ขนาด:'}</strong> {selectedSpace.size}</p>
                                                    <p className="mb-3"><strong>{language === 'EN' ? 'Price per Hour:' : 'ราคาต่อชั่วโมง:'}</strong> {selectedSpace.pricePerHour || 'N/A'} THB</p>
                                                    <p className="mb-3"><strong>{language === 'EN' ? 'Price per Day:' : 'ราคาต่อวัน:'}</strong> {selectedSpace.pricePerDay || 'N/A'} THB</p>
                                                    <p className="mb-3"><strong>{language === 'EN' ? 'Price per Week:' : 'ราคาต่อสัปดาห์:'}</strong> {selectedSpace.pricePerWeek || 'N/A'} THB</p>
                                                    <p className="mb-3"><strong>{language === 'EN' ? 'Price per Month:' : 'ราคาต่อเดือน:'}</strong> {selectedSpace.pricePerMonth || 'N/A'} THB</p>

                                                    <h5 className="fw-bold mt-5 mb-4">{language === 'EN' ? 'Booking History' : 'ประวัติการเช่า'}</h5>
                                                    {spaceBookings.length > 0 ? (
                                                        <div className="table-responsive">
                                                            <table className="table table-striped table-hover">
                                                                <thead>
                                                                    <tr>
                                                                        <th>{language === 'EN' ? 'Start Date' : 'วันที่เริ่ม'}</th>
                                                                        <th>{language === 'EN' ? 'End Date' : 'วันที่สิ้นสุด'}</th>
                                                                        <th>{language === 'EN' ? 'Start Time' : 'เวลาเริ่ม'}</th>
                                                                        <th>{language === 'EN' ? 'End Time' : 'เวลาสิ้นสุด'}</th>
                                                                        <th>{language === 'EN' ? 'Total Price' : 'ราคารวม'}</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {spaceBookings.map((booking) => (
                                                                        <tr key={booking._id}>
                                                                            <td>{booking.startDate}</td>
                                                                            <td>{booking.endDate}</td>
                                                                            <td>{booking.startTime}</td>
                                                                            <td>{booking.endTime}</td>
                                                                            <td>{booking.totalPrice} THB</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted">{language === 'EN' ? 'No bookings yet.' : 'ยังไม่มีการจอง'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer p-3" style={{ backgroundColor: '#fff', borderTop: 'none' }}>
                                <button type="button" className="btn btn-secondary btn-lg" onClick={closeModal}>
                                    {language === 'EN' ? 'Close' : 'ปิด'}
                                </button>
                                <button type="button" className="btn btn-primary btn-lg" onClick={() => handleEditSpace(selectedSpace._id)}>
                                    <FaEdit className="me-2" /> {language === 'EN' ? 'Edit' : 'แก้ไข'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;