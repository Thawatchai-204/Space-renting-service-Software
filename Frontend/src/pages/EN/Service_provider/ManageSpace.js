import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ManageSpace.css';
import { FaHome, FaPlus, FaList, FaUsers, FaCog, FaSignOutAlt, FaBell } from 'react-icons/fa';
import axios from 'axios';
import { LanguageContext } from '../../../LanguageContext';


function Managespace() {
    const { language, toggleLanguage } = useContext(LanguageContext);
    const { spaceId } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        advertisingWords: '',
        address: '',
        types: '',
        otherType: '',
        size: '',
        sizeUnit: 'm²',
        pricePerHour: '',
        pricePerDay: '',
        pricePerWeek: '',
        pricePerMonth: '',
        images: [],
        imagePreviews: [],
    });
    const [username, setUsername] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);
    const [focusedField, setFocusedField] = useState(null);
    const navigate = useNavigate();

    // Setup Axios Authentication
    const setupAxiosAuth = () => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
            navigate('/login');
        }
    };

    useEffect(() => {
        setupAxiosAuth();

        const storedUsername = localStorage.getItem('username');
        const storedUserId = localStorage.getItem('userId');

        if (storedUserId) {
            setUsername(storedUsername || 'User');
            fetchWalletBalance(storedUserId);
            fetchSpaceData(storedUserId, spaceId);
        } else {
            console.error('User ID not found in localStorage');
            navigate('/login');
        }
    }, [navigate, spaceId]);

    const fetchWalletBalance = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/wallet/${userId}`);
            setWalletBalance(response.data.balance || 0);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        }
    };

    const fetchSpaceData = async (userId, spaceId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/spaces`);
            const space = response.data.find(s => s._id === spaceId && s.userId.toString() === userId);
            if (space) {
                const [sizeValue, sizeUnit] = space.size.split(' ');
                setFormData({
                    name: space.name,
                    advertisingWords: space.advertisingWords,
                    address: space.address,
                    types: spaceTypes.includes(space.types) ? space.types : 'Other',
                    otherType: spaceTypes.includes(space.types) ? '' : space.types,
                    size: sizeValue,
                    sizeUnit: sizeUnit || 'm²',
                    pricePerHour: space.pricePerHour || '',
                    pricePerDay: space.pricePerDay || '',
                    pricePerWeek: space.pricePerWeek || '',
                    pricePerMonth: space.pricePerMonth || '',
                    images: [],
                    imagePreviews: space.images.map(img => `http://localhost:5000/uploads/${img}`),
                });
            } else {
                alert(language === 'EN' ? 'Space not found or you are not authorized.' : 'ไม่พบพื้นที่หรือคุณไม่มีสิทธิ์');
                navigate('/Service_provider/home');
            }
        } catch (error) {
            console.error('Error fetching space data:', error);
            navigate('/Service_provider/home');
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'images' && files) {
            const newImages = Array.from(files).slice(0, 5 - formData.images.length);
            const newPreviews = newImages.map(file => URL.createObjectURL(file));
            setFormData({
                ...formData,
                images: [...formData.images, ...newImages],
                imagePreviews: [...formData.imagePreviews, ...newPreviews],
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleFocus = (field) => setFocusedField(field);
    const handleBlur = () => setFocusedField(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('User ID not found. Please log in again.');
            navigate('/login');
            return;
        }

        const data = new FormData();
        data.append('userId', userId);
        data.append('name', formData.name);
        data.append('advertisingWords', formData.advertisingWords);
        data.append('address', formData.address);
        data.append('types', formData.types === 'Other' ? formData.otherType : formData.types);
        data.append('size', `${formData.size} ${formData.sizeUnit}`);
        data.append('pricePerHour', formData.pricePerHour || 0);
        data.append('pricePerDay', formData.pricePerDay || 0);
        data.append('pricePerWeek', formData.pricePerWeek || 0);
        data.append('pricePerMonth', formData.pricePerMonth || 0);
        formData.images.forEach(image => data.append('images', image));

        try {
            // API endpoint for updating space (ต้องเพิ่มใน server.js)
            const response = await axios.put(`http://localhost:5000/api/spaces/${spaceId}`, data);
            if (response.data.success) {
                alert(language === 'EN' ? 'Space updated successfully!' : 'อัปเดตพื้นที่สำเร็จ!');
                navigate('/Service_provider/home');
            } else {
                alert(response.data.message || (language === 'EN' ? 'Failed to update space.' : 'ไม่สามารถอัปเดตพื้นที่ได้'));
            }
        } catch (error) {
            console.error('Error updating space:', error);
            alert(language === 'EN' ? 'Failed to update space.' : 'ไม่สามารถอัปเดตพื้นที่ได้');
        }
    };

    const handleCancel = () => {
        navigate('/Service_provider/home');
    };

    const handleClear = () => {
        setFormData({
            name: '',
            advertisingWords: '',
            address: '',
            types: '',
            otherType: '',
            size: '',
            sizeUnit: 'm²',
            pricePerHour: '',
            pricePerDay: '',
            pricePerWeek: '',
            pricePerMonth: '',
            images: [],
            imagePreviews: [],
        });
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const spaceTypes = [
        'Warehouse',
        'Garage',
        'Basement',
        'Attic',
        'Storage Room',
        'Container',
        'Shed',
        'Locker',
        'Parking Space',
        'Open Area',
        'Other',
    ];

    const sizeUnits = ['m²', 'ft²', 'm³', 'ft³'];

    return (
        <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm">
                <div className="container">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link" href="/Service_provider/home"><FaHome className="me-2" /> {language === 'EN' ? 'Home' : 'หน้าหลัก'}</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/Addspace"><FaPlus className="me-2" /> {language === 'EN' ? 'Add Space' : 'เพิ่มพื้นที่'}</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link active" href="/Managespace"><FaList className="me-2" /> {language === 'EN' ? 'Manage Space' : 'จัดการพื้นที่'}</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/Profile"><FaUsers className="me-2" /> {language === 'EN' ? 'Profile' : 'โปรไฟล์'}</a>
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

            {/* Main Content */}
            <main className="container mt-5 pt-5">
                <h1 className="fw-bold mb-4">{language === 'EN' ? 'Edit Space' : 'แก้ไขพื้นที่'}</h1>
                <div className="row g-4 align-items-start">
                    {/* Column 1: Image */}
                    <div className="col-md-4">
                        <div className="form-group mb-3">
                            <label className="form-label fw-bold">{language === 'EN' ? 'Images (max 5):' : 'รูปภาพ (สูงสุด 5 รูป):'}</label>
                            <input
                                type="file"
                                name="images"
                                multiple
                                accept="image/*"
                                onChange={handleChange}
                                className="form-control"
                                disabled={formData.imagePreviews.length >= 5}
                            />
                            <div className="mt-2 d-flex flex-wrap gap-2">
                                {formData.imagePreviews.map((preview, index) => (
                                    <img
                                        key={index}
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="img-thumbnail"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                ))}
                            </div>
                            {formData.imagePreviews.length >= 5 && (
                                <p className="text-muted mt-2">{language === 'EN' ? 'Maximum 5 images reached' : 'ถึงขีดจำกัด 5 รูปแล้ว'}</p>
                            )}
                        </div>
                    </div>

                    {/* Column 2: Details */}
                    <div className="col-md-4">
                        <div className="form-group mb-3">
                            <label className="form-label fw-bold">{language === 'EN' ? 'Name:' : 'ชื่อพื้นที่:'}</label>
                            <textarea
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onFocus={() => handleFocus('name')}
                                onBlur={handleBlur}
                                className={`form-control ${focusedField === 'name' ? 'expanded' : ''}`}
                                rows={focusedField === 'name' ? 5 : 1}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label fw-bold">{language === 'EN' ? 'Advertising Words:' : 'คำโฆษณา:'}</label>
                            <textarea
                                name="advertisingWords"
                                value={formData.advertisingWords}
                                onChange={handleChange}
                                onFocus={() => handleFocus('advertisingWords')}
                                onBlur={handleBlur}
                                className={`form-control ${focusedField === 'advertisingWords' ? 'expanded' : ''}`}
                                rows={focusedField === 'advertisingWords' ? 5 : 1}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label fw-bold">{language === 'EN' ? 'Address:' : 'ที่อยู่:'}</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                onFocus={() => handleFocus('address')}
                                onBlur={handleBlur}
                                className={`form-control ${focusedField === 'address' ? 'expanded' : ''}`}
                                rows={focusedField === 'address' ? 5 : 1}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label fw-bold">{language === 'EN' ? 'Types:' : 'ประเภท:'}</label>
                            <select
                                name="types"
                                value={formData.types}
                                onChange={handleChange}
                                className="form-control"
                                required
                            >
                                <option value="">{language === 'EN' ? 'Select Type' : 'เลือกประเภท'}</option>
                                {spaceTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                            {formData.types === 'Other' && (
                                <input
                                    type="text"
                                    name="otherType"
                                    value={formData.otherType}
                                    onChange={handleChange}
                                    className="form-control mt-2"
                                    placeholder={language === 'EN' ? 'Specify other type' : 'ระบุประเภทอื่นๆ'}
                                    required
                                />
                            )}
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label fw-bold">{language === 'EN' ? 'Size:' : 'ขนาด:'}</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="size"
                                    value={formData.size}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder={language === 'EN' ? 'Enter size' : 'กรอกขนาด'}
                                    required
                                />
                                <select
                                    name="sizeUnit"
                                    value={formData.sizeUnit}
                                    onChange={handleChange}
                                    className="form-select"
                                    style={{ maxWidth: '100px' }}
                                >
                                    {sizeUnits.map((unit) => (
                                        <option key={unit} value={unit}>
                                            {unit}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Prices */}
                    <div className="col-md-4">
                        <div className="form-group mb-3">
                            <label className="form-label fw-bold">{language === 'EN' ? 'Price per Hour (THB):' : 'ราคาต่อชั่วโมง (บาท):'}</label>
                            <input
                                type="number"
                                name="pricePerHour"
                                value={formData.pricePerHour}
                                onChange={handleChange}
                                className="form-control"
                                min="0"
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label fw-bold">{language === 'EN' ? 'Price per Day (THB):' : 'ราคาต่อวัน (บาท):'}</label>
                            <input
                                type="number"
                                name="pricePerDay"
                                value={formData.pricePerDay}
                                onChange={handleChange}
                                className="form-control"
                                min="0"
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label fw-bold">{language === 'EN' ? 'Price per Week (THB):' : 'ราคาต่อสัปดาห์ (บาท):'}</label>
                            <input
                                type="number"
                                name="pricePerWeek"
                                value={formData.pricePerWeek}
                                onChange={handleChange}
                                className="form-control"
                                min="0"
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label fw-bold">{language === 'EN' ? 'Price per Month (THB):' : 'ราคาต่อเดือน (บาท):'}</label>
                            <input
                                type="number"
                                name="pricePerMonth"
                                value={formData.pricePerMonth}
                                onChange={handleChange}
                                className="form-control"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="col-12 d-flex justify-content-end gap-2 mt-4">
                        <button type="button" className="btn btn-warning" onClick={handleClear}>
                            {language === 'EN' ? 'Clear' : 'ล้างข้อมูล'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                            {language === 'EN' ? 'Cancel' : 'ยกเลิก'}
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                            {language === 'EN' ? 'Save' : 'บันทึก'}
                        </button>
                    </div>
                </div>
            </main>

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

export default Managespace;