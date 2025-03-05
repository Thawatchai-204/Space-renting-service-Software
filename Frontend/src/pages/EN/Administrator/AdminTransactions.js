import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaHome, FaUsers, FaFileAlt, FaCog, FaSignOutAlt, FaHistory, FaDollarSign, FaBuilding, FaChartBar } from 'react-icons/fa';
import axios from 'axios';
import { LanguageContext } from '../../../LanguageContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminTransactions() {
    const { language, toggleLanguage } = useContext(LanguageContext);
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState(null);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalMoney, setTotalMoney] = useState(0);
    const [totalBookings, setTotalBookings] = useState(0);
    const [totalSpaces, setTotalSpaces] = useState(0);
    const [pendingBookings, setPendingBookings] = useState(0);
    const [completedBookings, setCompletedBookings] = useState(0);
    const [cancelledBookings, setCancelledBookings] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [avgBookingValue, setAvgBookingValue] = useState(0);
    const [topUsers, setTopUsers] = useState([]);
    const [topSpaces, setTopSpaces] = useState([]);
    const navigate = useNavigate();

    const API_BASE_URL = 'http://localhost:5000';

    const setupAxiosAuth = () => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
                setUsername(storedUsername || 'Admin');
                fetchStatistics();
            } else {
                console.error('ไม่พบรหัสผู้ใช้ใน localStorage');
                toast.error(language === 'EN' ? 'User ID not found. Please log in again.' : 'ไม่พบรหัสผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
                navigate('/login');
            }
        }
    }, [navigate, language]);

    const fetchStatistics = async () => {
        try {
            const endpoints = [
                { url: `${API_BASE_URL}/api/users/count`, setter: setTotalUsers, key: 'totalUsers' },
                { url: `${API_BASE_URL}/api/transactions/total-money`, setter: setTotalMoney, key: 'totalMoney' },
                { url: `${API_BASE_URL}/api/bookings/stats`, setter: null, key: null },
                { url: `${API_BASE_URL}/api/spaces/count`, setter: setTotalSpaces, key: 'totalSpaces' },
                { url: `${API_BASE_URL}/api/users/top`, setter: setTopUsers, key: null },
                { url: `${API_BASE_URL}/api/spaces/top`, setter: setTopSpaces, key: null },
            ];

            const responses = await Promise.all(
                endpoints.map(endpoint => 
                    axios.get(endpoint.url).catch(err => {
                        console.error(`ไม่สามารถดึงข้อมูลจาก ${endpoint.url}: ${err.message}`);
                        if (err.response && err.response.status === 404) {
                            toast.warn(`${language === 'EN' ? 'Endpoint not found:' : 'ไม่พบ endpoint:'} ${endpoint.url}`);
                        } else {
                            toast.error(`${language === 'EN' ? 'Error fetching data from' : 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก'} ${endpoint.url}: ${err.message}`);
                        }
                        return { error: err };
                    })
                )
            );

            responses.forEach((res, index) => {
                if (res.error) return; // ข้ามไปถ้ามีข้อผิดพลาด

                const data = res.data;
                if (index === 2) { // จัดการ /api/bookings/stats
                    setTotalBookings(data.totalBookings || 0);
                    setPendingBookings(data.pendingBookings || 0);
                    setCompletedBookings(data.completedBookings || 0);
                    setCancelledBookings(data.cancelledBookings || 0);
                    setTotalRevenue(data.totalRevenue || 0);
                    setAvgBookingValue(data.avgBookingValue || 0);
                } else if (endpoints[index].setter && endpoints[index].key) {
                    endpoints[index].setter(data[endpoints[index].key] || 0);
                } else if (endpoints[index].setter) {
                    endpoints[index].setter(data || []);
                }
            });
        } catch (error) {
            console.error('เกิดข้อผิดพลาดที่ไม่คาดคิดใน fetchStatistics:', error.message);
            toast.error(language === 'EN' ? 'An unexpected error occurred while fetching statistics.' : 'เกิดข้อผิดพลาดที่ไม่คาดคิดขณะดึงข้อมูลสถิติ');
        }
    };

    const handleUsers = () => navigate('/AdminUsers');
    const handleRequest = () => navigate('/AdminRequests');
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
                                <a className="nav-link" href="/AdminDashboard"><FaHome className="me-2" /> {language === 'EN' ? 'Home' : 'หน้าหลัก'}</a>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link btn btn-link" onClick={handleUsers}><FaUsers className="me-2" /> {language === 'EN' ? 'Users' : 'ผู้ใช้'}</button>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link btn btn-link" onClick={handleRequest}><FaFileAlt className="me-2" /> {language === 'EN' ? 'Request' : 'คำขอ'}</button>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/AdminSettings"><FaCog className="me-2" /> {language === 'EN' ? 'Settings' : 'ตั้งค่า'}</a>
                            </li>
                        </ul>
                        <div className="d-flex align-items-center gap-3">
                            <a href="/AdminProfile" className="text-decoration-none text-light">{username || 'Admin'}</a>
                            <a href="/AdminTransactions" className="btn btn-outline-light btn-sm active">
                                <FaHistory className="me-2" /> {language === 'EN' ? 'Transaction' : 'ธุรกรรม'}
                            </a>
                            <button onClick={handleLogout} className="btn btn-danger btn-sm"><FaSignOutAlt className="me-2" /> {language === 'EN' ? 'Logout' : 'ออกจากระบบ'}</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mt-5 pt-5">
                <header className="mb-4 text-center">
                    <h1 className="fw-bold text-dark" style={{ fontSize: '2rem' }}>{language === 'EN' ? 'Transactions Dashboard' : 'แดชบอร์ดธุรกรรม'}</h1>
                </header>

                <section className="mb-5">
                    <h2 className="fw-bold text-dark mb-4">{language === 'EN' ? 'System Statistics' : 'สถิติระบบ'}</h2>
                    <div className="row">
                        {/* Total Users */}
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body text-center">
                                    <FaUsers size={40} className="text-primary mb-3" />
                                    <h5>{language === 'EN' ? 'Total Users' : 'ผู้ใช้ทั้งหมด'}</h5>
                                    <p className="display-6">{totalUsers}</p>
                                </div>
                            </div>
                        </div>
                        {/* Total Money */}
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body text-center">
                                    <FaDollarSign size={40} className="text-success mb-3" />
                                    <h5>{language === 'EN' ? 'Total Money in System' : 'เงินในระบบทั้งหมด'}</h5>
                                    <p className="display-6">{totalMoney.toLocaleString()} THB</p>
                                </div>
                            </div>
                        </div>
                        {/* Total Bookings */}
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body text-center">
                                    <FaChartBar size={40} className="text-info mb-3" />
                                    <h5>{language === 'EN' ? 'Total Bookings' : 'การจองทั้งหมด'}</h5>
                                    <p className="display-6">{totalBookings}</p>
                                </div>
                            </div>
                        </div>
                        {/* Total Spaces */}
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body text-center">
                                    <FaBuilding size={40} className="text-warning mb-3" />
                                    <h5>{language === 'EN' ? 'Total Spaces' : 'จำนวนพื้นที่ทั้งหมด'}</h5>
                                    <p className="display-6">{totalSpaces}</p>
                                </div>
                            </div>
                        </div>
                        {/* Pending Bookings */}
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body text-center">
                                    <FaChartBar size={40} className="text-secondary mb-3" />
                                    <h5>{language === 'EN' ? 'Pending Bookings' : 'การจองที่รอดำเนินการ'}</h5>
                                    <p className="display-6">{pendingBookings}</p>
                                </div>
                            </div>
                        </div>
                        {/* Completed Bookings */}
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body text-center">
                                    <FaChartBar size={40} className="text-success mb-3" />
                                    <h5>{language === 'EN' ? 'Completed Bookings' : 'การจองที่เสร็จสิ้น'}</h5>
                                    <p className="display-6">{completedBookings}</p>
                                </div>
                            </div>
                        </div>
                        {/* Cancelled Bookings */}
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body text-center">
                                    <FaChartBar size={40} className="text-danger mb-3" />
                                    <h5>{language === 'EN' ? 'Cancelled Bookings' : 'การจองที่ถูกยกเลิก'}</h5>
                                    <p className="display-6">{cancelledBookings}</p>
                                </div>
                            </div>
                        </div>
                        {/* Total Revenue */}
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body text-center">
                                    <FaDollarSign size={40} className="text-primary mb-3" />
                                    <h5>{language === 'EN' ? 'Total Revenue' : 'รายได้ทั้งหมด'}</h5>
                                    <p className="display-6">{totalRevenue.toLocaleString()} THB</p>
                                </div>
                            </div>
                        </div>
                        {/* Average Booking Value */}
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body text-center">
                                    <FaDollarSign size={40} className="text-info mb-3" />
                                    <h5>{language === 'EN' ? 'Average Booking Value' : 'มูลค่าเฉลี่ยต่อการจอง'}</h5>
                                    <p className="display-6">{avgBookingValue.toLocaleString()} THB</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Users and Top Spaces */}
                    <div className="row mt-5">
                        <div className="col-md-6">
                            <h3 className="fw-bold mb-3">{language === 'EN' ? 'Top Users by Bookings' : 'ผู้ใช้ที่มีการจองสูงสุด'}</h3>
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th className="text-center">{language === 'EN' ? 'Username' : 'ชื่อผู้ใช้'}</th>
                                            <th className="text-center">{language === 'EN' ? 'Bookings' : 'จำนวนการจอง'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topUsers.length > 0 ? (
                                            topUsers.map((user) => (
                                                <tr key={user._id}>
                                                    <td className="text-center">{user.username}</td>
                                                    <td className="text-center">{user.bookingCount}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="text-center text-muted">
                                                    {language === 'EN' ? 'No data available' : 'ไม่มีข้อมูล'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <h3 className="fw-bold mb-3">{language === 'EN' ? 'Top Spaces by Bookings' : 'พื้นที่ที่มีการจองสูงสุด'}</h3>
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th className="text-center">{language === 'EN' ? 'Space Name' : 'ชื่อพื้นที่'}</th>
                                            <th className="text-center">{language === 'EN' ? 'Bookings' : 'จำนวนการจอง'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topSpaces.length > 0 ? (
                                            topSpaces.map((space) => (
                                                <tr key={space._id}>
                                                    <td className="text-center">{space.name}</td>
                                                    <td className="text-center">{space.bookingCount}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="text-center text-muted">
                                                    {language === 'EN' ? 'No data available' : 'ไม่มีข้อมูล'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
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
        </div>
    );
}

export default AdminTransactions;