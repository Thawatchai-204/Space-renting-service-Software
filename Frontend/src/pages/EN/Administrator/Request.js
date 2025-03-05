import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaHome, FaUsers, FaFileAlt, FaCog, FaSignOutAlt, FaHistory, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { LanguageContext } from '../../../LanguageContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function Request() {
    const { language, toggleLanguage } = useContext(LanguageContext);
    const [requests, setRequests] = useState([]);
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState(null);
    const [role, setRole] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState({});
    const [showImageModal, setShowImageModal] = useState(false); // State สำหรับ modal รูปภาพ
    const [selectedImage, setSelectedImage] = useState(null); // State สำหรับรูปที่เลือก
    const navigate = useNavigate();

    const API_BASE_URL = 'http://localhost:5000';

    const setupAxiosAuth = () => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log('ตั้งค่าโทเค็นในส่วนหัวของ Axios:', token);
            return true;
        }
        console.log('ไม่พบโทเค็นใน localStorage');
        return false;
    };

    useEffect(() => {
        const isAuthenticated = setupAxiosAuth();
        const storedUserId = localStorage.getItem('userId');
        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('role');

        console.log('ค่าที่เก็บไว้:', { isAuthenticated, storedUserId, storedUsername, storedRole });

        if (!isAuthenticated || !storedUserId) {
            console.log('การยืนยันตัวตนล้มเหลว, เปลี่ยนเส้นทางไป /login');
            toast.error(language === 'EN' ? 'Please log in to continue.' : 'กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ');
            navigate('/login');
            return;
        }

        if (storedRole?.toLowerCase() !== 'admin') {
            console.log('ผู้ใช้ไม่ใช่แอดมิน, เปลี่ยนเส้นทางไป /Home');
            toast.error(language === 'EN' ? 'Access denied. Admins only.' : 'การเข้าถึงถูกปฏิเสธ เฉพาะผู้ดูแลระบบเท่านั้น');
            navigate('/Home');
            return;
        }

        setUserId(storedUserId);
        setUsername(storedUsername || 'Admin');
        setRole(storedRole);
        fetchPendingRequests();
    }, [navigate, language]);

    useEffect(() => {
        console.log('Requests state อัปเดต:', requests); // Debug state เมื่อเปลี่ยน
    }, [requests]);

    const fetchPendingRequests = async () => {
        try {
            console.log('กำลังดึงคำขอที่รอดำเนินการ...');
            const response = await axios.get(`${API_BASE_URL}/api/requests/pending`);
            console.log('ผลลัพธ์คำขอที่รอดำเนินการ:', response.data);
            // แปลง _id เป็น string ทันทีที่รับข้อมูล
            const formattedRequests = response.data.map(request => ({
                ...request,
                _id: request._id.toString()
            }));
            setRequests(formattedRequests);
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงคำขอ:', error.response || error.message);
            toast.error(language === 'EN' ? 'Failed to fetch requests.' : 'ไม่สามารถดึงรายการคำขอได้');
            setRequests([]);
        }
    };

    const handleApprove = async (requestId) => {
        const idToApprove = requestId.toString();
        setIsProcessing(prev => ({ ...prev, [idToApprove]: true }));
        try {
            console.log('กำลังอนุมัติคำขอ ID:', idToApprove);
            const response = await axios.put(`${API_BASE_URL}/api/request/${idToApprove}/approve`);
            
            console.log('Response จาก Approve:', response);
            
            if (response.status === 200 && response.data.success === true) {
                console.log('อนุมัติสำเร็จ, อัปเดต state...');
                setRequests(prevRequests => {
                    const updatedRequests = prevRequests.filter(request => request._id !== idToApprove);
                    console.log('Requests หลังอนุมัติ:', updatedRequests);
                    return [...updatedRequests]; // สร้าง array ใหม่
                });
                toast.success(language === 'EN' ? 'Request approved successfully!' : 'อนุมัติคำขอสำเร็จ!');
            } else {
                console.log('Response ไม่สำเร็จ:', response.data);
                throw new Error(response.data.message || 'Unknown error from server');
            }
        } catch (error) {
            console.error('ข้อผิดพลาดในการอนุมัติคำขอ:', error.response || error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            toast.error(language === 'EN' ? `${errorMessage}` : `${errorMessage}`);
        } finally {
            setIsProcessing(prev => ({ ...prev, [idToApprove]: false }));
        }
    };

    const handleReject = async () => {
        if (!selectedRequestId || !rejectReason.trim()) {
            toast.error(language === 'EN' ? 'Please provide a rejection reason' : 'กรุณาระบุเหตุผลในการปฏิเสธ');
            return;
        }

        const idToReject = selectedRequestId.toString();
        setIsProcessing(prev => ({ ...prev, [idToReject]: true }));
        try {
            console.log('กำลังปฏิเสธคำขอ ID:', idToReject);
            const response = await axios.put(`${API_BASE_URL}/api/request/${idToReject}/reject`, { 
                rejectReason: rejectReason.trim()
            });
            
            console.log('Response จาก Reject:', response);
            
            if (response.status === 200 && response.data.success === true) {
                console.log('ปฏิเสธสำเร็จ, อัปเดต state...');
                setRequests(prevRequests => {
                    const updatedRequests = prevRequests.filter(request => request._id !== idToReject);
                    console.log('Requests หลังปฏิเสธ:', updatedRequests);
                    return [...updatedRequests]; // สร้าง array ใหม่
                });
                toast.success(language === 'EN' ? 'Request rejected successfully!' : 'ปฏิเสธคำขอสำเร็จ!');
                setShowRejectModal(false);
                setRejectReason('');
                setSelectedRequestId(null);
            } else {
                console.log('Response ไม่สำเร็จ:', response.data);
                throw new Error(response.data.message || 'Unknown error from server');
            }
        } catch (error) {
            console.error('ข้อผิดพลาดในการปฏิเสธคำขอ:', error.response || error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            toast.error(language === 'EN' ? `${errorMessage}` : `${errorMessage}`);
        } finally {
            setIsProcessing(prev => ({ ...prev, [idToReject]: false }));
        }
    };

    const openRejectModal = (requestId) => {
        console.log('เปิด modal สำหรับ ID:', requestId);
        setSelectedRequestId(requestId.toString());
        setShowRejectModal(true);
    };

    const handleCloseRejectModal = () => {
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedRequestId(null);
    };

    // ฟังก์ชันสำหรับขยายรูปภาพ
    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    const handleCloseImageModal = () => {
        setShowImageModal(false);
        setSelectedImage(null);
    };

    const handleUsers = () => {
        navigate('/AdminUsers');
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <ToastContainer />
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
                            <li className="nav-item position-relative">
                                <a className="nav-link active" href="/AdminRequests">
                                    <FaFileAlt className="me-2" /> {language === 'EN' ? 'Request' : 'คำขอ'}
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/AdminSettings"><FaCog className="me-2" /> {language === 'EN' ? 'Settings' : 'ตั้งค่า'}</a>
                            </li>
                        </ul>
                        <div className="d-flex align-items-center gap-3">
                            <a href="/AdminProfile" className="text-decoration-none text-light">{username || 'Admin'}</a>
                            <a href="/AdminTransactions" className="btn btn-outline-light btn-sm">
                                <FaHistory className="me-2" /> {language === 'EN' ? 'Transaction' : 'ธุรกรรม'}
                            </a>
                            <button onClick={handleLogout} className="btn btn-danger btn-sm"><FaSignOutAlt className="me-2" /> {language === 'EN' ? 'Logout' : 'ออกจากระบบ'}</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mt-5 pt-5">
                <header className="mb-4 text-center">
                    <h1 className="fw-bold text-dark" style={{ fontSize: '2rem' }}>{language === 'EN' ? 'Request Management' : 'การจัดการคำขอ'}</h1>
                </header>

                <section className="mb-5">
                    <h2 className="fw-bold text-dark mb-3">{language === 'EN' ? 'Pending Top-Up Requests' : 'คำขอเติมเงินที่รอดำเนินการ'}</h2>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th className="text-center">{language === 'EN' ? 'User Name' : 'ชื่อผู้ใช้'}</th>
                                    <th className="text-center">{language === 'EN' ? 'E-mail' : 'อีเมล'}</th>
                                    <th className="text-center">{language === 'EN' ? 'Transaction ID' : 'รหัสธุรกรรม'}</th>
                                    <th className="text-center">{language === 'EN' ? 'Time' : 'เวลา'}</th>
                                    <th className="text-center">{language === 'EN' ? 'Amount' : 'จำนวนเงิน'}</th>
                                    <th className="text-center">{language === 'EN' ? 'Proof of Transfer' : 'หลักฐานการโอน'}</th>
                                    <th className="text-center">{language === 'EN' ? 'Actions' : 'การดำเนินการ'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length > 0 ? (
                                    requests.map((request) => (
                                        <tr key={request._id}>
                                            <td className="text-center">{request.username || 'N/A'}</td>
                                            <td className="text-center">{request.email}</td>
                                            <td className="text-center">{request.transactionId || 'N/A'}</td>
                                            <td className="text-center">
                                                {new Date(request.createdAt).toLocaleString(language === 'EN' ? 'en-US' : 'th-TH')}
                                            </td>
                                            <td className="text-center">{request.amount ? `${request.amount} THB` : 'N/A'}</td>
                                            <td className="text-center">
                                                {request.proofPic ? (
                                                    <img
                                                        src={`${API_BASE_URL}${request.proofPic}`}
                                                        alt="หลักฐานการโอน"
                                                        style={{ width: '100px', height: 'auto', border: '1px solid #ddd', cursor: 'pointer' }}
                                                        onClick={() => openImageModal(`${API_BASE_URL}${request.proofPic}`)}
                                                    />
                                                ) : (
                                                    language === 'EN' ? 'No Proof' : 'ไม่มีหลักฐาน'
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleApprove(request._id)}
                                                        disabled={isProcessing[request._id]}
                                                    >
                                                        <FaCheck /> {isProcessing[request._id] ? '...' : ''}
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => openRejectModal(request._id)}
                                                        disabled={isProcessing[request._id]}
                                                    >
                                                        <FaTimes /> {isProcessing[request._id] ? '...' : ''}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted">
                                            {language === 'EN' ? 'No pending requests available.' : 'ไม่มีคำขอที่รอดำเนินการ'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* Modal สำหรับ reject */}
            <Modal show={showRejectModal} onHide={handleCloseRejectModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{language === 'EN' ? 'Reject Request' : 'ปฏิเสธคำขอ'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId={`rejectReason-${selectedRequestId}`}>
                            <Form.Label>{language === 'EN' ? 'Reason for Rejection' : 'เหตุผลในการปฏิเสธ'}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={language === 'EN' ? 'Enter reason...' : 'กรอกเหตุผล...'}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseRejectModal}>
                        {language === 'EN' ? 'Cancel' : 'ยกเลิก'}
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={handleReject} 
                        disabled={!rejectReason.trim() || isProcessing[selectedRequestId]}
                    >
                        {isProcessing[selectedRequestId] ? '...' : (language === 'EN' ? 'Reject' : 'ปฏิเสธ')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal สำหรับขยายรูปภาพ */}
            <Modal show={showImageModal} onHide={handleCloseImageModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{language === 'EN' ? 'Proof of Transfer' : 'หลักฐานการโอน'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="หลักฐานการโอนขยาย"
                            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                        />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseImageModal}>
                        {language === 'EN' ? 'Close' : 'ปิด'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <footer className="bg-dark text-light py-4 mt-5">
                <div className="container text-center">
                    <img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/refs/heads/main/Screenshot%20202024-07-26%2020013811.png" alt="โลโก้" width="100" />
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

export default Request;