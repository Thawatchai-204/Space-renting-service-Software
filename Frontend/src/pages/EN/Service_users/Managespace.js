import React, { useEffect, useState } from 'react';
import './Home.css';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';

function ManageSpace() {
    const [spaces, setSpaces] = useState([]);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        advertisingWords: '',
        address: '',
        types: '',
        size: '',
        pricePerHour: '',
        pricePerDay: '',
        pricePerWeek: '',
        pricePerMonth: '',
    });

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
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

    const openModal = (space) => {
        setSelectedSpace(space);
        setFormData({
            name: space.name,
            advertisingWords: space.advertisingWords,
            address: space.address,
            types: space.types,
            size: space.size,
            pricePerHour: space.pricePerHour || '',
            pricePerDay: space.pricePerDay || '',
            pricePerWeek: space.pricePerWeek || '',
            pricePerMonth: space.pricePerMonth || '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedSpace(null);
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        setNewImage(e.target.files[0]);
    };

    const handleSaveChanges = async () => {
        const updatedData = new FormData();

        Object.keys(formData).forEach((key) => {
            updatedData.append(key, formData[key]);
        });

        if (newImage) {
            updatedData.append('image', newImage);
        }

        try {
            await axios.put(`http://localhost:5000/api/spaces/${selectedSpace._id}`, updatedData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const response = await axios.get('http://localhost:5000/api/spaces');
            setSpaces(response.data);
            closeModal();
            alert('Space updated successfully!');
        } catch (error) {
            console.error('Error updating space:', error);
            alert('Failed to update space.');
        }
    };

    const handleDeleteSpace = async (spaceId) => {
        try {
            await axios.delete(`http://localhost:5000/api/spaces/${spaceId}`);
            setSpaces(spaces.filter((space) => space._id !== spaceId)); // Update UI after deletion
            alert('Space deleted successfully!');
        } catch (error) {
            console.error('Error deleting space:', error);
            alert('Failed to delete space.');
        }
    };

    return (
        <div className="home-container">
            <aside className="sidebar">
                <div className="logo">
                    <li>
                        <a href="/Home">
                            <img
                                src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/refs/heads/main/Screenshot%20202024-07-26%2020013811.png"
                                alt="Logo"
                            />
                        </a>
                    </li>
                </div>
                <nav>
                    <ul>
                        <li>
                            <a href="/Home">
                                <FaHome /> Home
                            </a>
                        </li>
                        <li>
                            <a href="/Addspace">
                                <FaCalendarAlt /> Add space
                            </a>
                        </li>
                        <li className="active">
                            <a href="/Managespace">
                                <FaCalendarAlt /> Manage space
                            </a>
                        </li>
                        <li>
                            <a href="/Profile">
                                <FaUser /> Profile
                            </a>
                        </li>
                        <li>
                            <a href="/Settings">
                                <FaCog /> Settings
                            </a>
                        </li>
                        <li className="logout">
                            <a href="/login">
                                <FaSignOutAlt /> Log out
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>

            <main className="main-content">
                <header>
                    <h1>Manage Spaces</h1>
                    <div className="search-bar">
                        <input type="text" placeholder="Search Here" />
                    </div>
                    <div className="user-info">
                        <span className="notification-icon">🔔</span>
                        <li>
                            <a href="/Profile">
                                <span className="user-name">{username ? username : 'User'}</span>
                            </a>
                        </li>
                        <li>
                            <a href="/Wallet">
                                <span className="user-balance">Wallet</span>
                            </a>
                        </li>
                    </div>
                </header>

                <section className="content">
                    <div className="main-content-section">
                        <h2>Your Spaces</h2>
                        <div className="spaces-list">
                            {spaces.length > 0 ? (
                                spaces.map((space) => (
                                    <div key={space._id} className="space-item">
                                        <img
                                            src={`http://localhost:5000/uploads/${space.image}`}
                                            alt={space.name}
                                        />
                                        <h3>{space.name}</h3>
                                        <p>{space.advertisingWords}</p>
                                        <p>{space.address}</p>
                                        <p>Types: {space.types}</p>
                                        <p>Size: {space.size}</p>
                                        <p>Price Per Hour: {space.pricePerHour || 'N/A'} THB</p>
                                        <p>Price Per Day: {space.pricePerDay || 'N/A'} THB</p>
                                        <p>Price Per Week: {space.pricePerWeek || 'N/A'} THB</p>
                                        <p>Price Per Month: {space.pricePerMonth || 'N/A'} THB</p>
                                        <button
                                            onClick={() => openModal(space)}
                                            className="details-link"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSpace(space._id)}
                                            className="delete-button"
                                        >
                                            Delete
                                        </button>
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
                        <button onClick={closeModal} className="close-modal">
                            ✖
                        </button>
                        <h2>Edit {selectedSpace.name}</h2>
                        <input type="file" onChange={handleImageChange} accept="image/*" />
                        <div>
                            <label>Name area:</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Advertising words:</label>
                            <input
                                type="text"
                                name="advertisingWords"
                                value={formData.advertisingWords}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Address:</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Types:</label>
                            <input
                                type="text"
                                name="types"
                                value={formData.types}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Size:</label>
                            <input
                                type="text"
                                name="size"
                                value={formData.size}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Price Per Hour:</label>
                            <input
                                type="number"
                                name="pricePerHour"
                                value={formData.pricePerHour}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Price Per Day:</label>
                            <input
                                type="number"
                                name="pricePerDay"
                                value={formData.pricePerDay}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Price Per Week:</label>
                            <input
                                type="number"
                                name="pricePerWeek"
                                value={formData.pricePerWeek}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Price Per Month:</label>
                            <input
                                type="number"
                                name="pricePerMonth"
                                value={formData.pricePerMonth}
                                onChange={handleInputChange}
                            />
                        </div>
                        <button onClick={handleSaveChanges} className="save-button">
                            Save Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageSpace;
