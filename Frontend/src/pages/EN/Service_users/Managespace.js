import React, { useEffect, useState } from 'react';
import './Home.css';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';

function Home() {
    const [spaces, setSpaces] = useState([]);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [editedName, setEditedName] = useState('');
    const [editedAdvertisingWords, setEditedAdvertisingWords] = useState('');
    const [editedAddress, setEditedAddress] = useState('');
    const [editedTypes, setEditedTypes] = useState('');
    const [editedSize, setEditedSize] = useState('');
    const [editedPrice, setEditedPrice] = useState('');

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
        setEditedName(space.name);
        setEditedAdvertisingWords(space.advertisingWords);
        setEditedAddress(space.address);
        setEditedTypes(space.types);
        setEditedSize(space.size);
        setEditedPrice(space.price);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedSpace(null);
        setIsModalOpen(false);
    };

    const handleImageChange = (e) => {
        setNewImage(e.target.files[0]);
    };

    const handleSaveChanges = async () => {
        const formData = new FormData();
        
        // Append edited values
        if (newImage) {
            formData.append('image', newImage);
        }
        formData.append('name', editedName);
        formData.append('advertisingWords', editedAdvertisingWords);
        formData.append('address', editedAddress);
        formData.append('types', editedTypes);
        formData.append('size', editedSize);
        formData.append('price', editedPrice);

        try {
            await axios.put(`http://localhost:5000/api/spaces/${selectedSpace._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const response = await axios.get('http://localhost:5000/api/spaces');
            setSpaces(response.data);
            closeModal();
        } catch (error) {
            console.error('Error updating space:', error);
        }
    };

    return (
        <div className="home-container">
            {/* Sidebar */}
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
                        <li className="active"><a href="/Managespace"><FaCalendarAlt /> Manage space</a></li>
                        <li><a href="/Profile"><FaUser /> Profile</a></li>
                        <li><a href="/Settings"><FaCog /> Settings</a></li>
                        <li className="logout"><a href="/login"><FaSignOutAlt /> Log out</a></li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header>
                    <h1>Home</h1>
                    <div className="search-bar">
                        <input type="text" placeholder="Search Here" />
                    </div>
                    <div className="user-info">
                        <span className="notification-icon">🔔</span>
                        <li><a href="/Profile"><span className="user-name">{username ? username : 'User'}</span></a></li>
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
                                        <p>Types: {space.types}</p>
                                        <p>Size: {space.size}</p>
                                        <p>Price: {space.price} THB</p>
                                        <button onClick={() => openModal(space)} className="details-link">Edit</button>
                                    </div>
                                ))
                            ) : (
                                <p>No spaces available at the moment.</p>
                            )}
                        </div>
                    </div>

                    <aside className={`filter-section ${isCollapsed ? 'collapsed' : ''}`}>
                        <button className="toggle-filter" onClick={() => setIsCollapsed(!isCollapsed)}>
                            {isCollapsed ? 'Show Filters' : 'Hide Filters'}
                        </button>
                        <div className={`filter-content ${isCollapsed ? 'hidden' : ''}`}>
                            <h2>Filter</h2>
                            {/* Your filter code here */}
                        </div>
                    </aside>
                </section>
            </main>

            {/* Modal สำหรับแก้ไขข้อมูล */}
            {isModalOpen && selectedSpace && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button onClick={closeModal} className="close-modal">✖</button>
                        <h2>Edit {selectedSpace.name}</h2>
                        <img src={`http://localhost:5000/uploads/${selectedSpace.image}`} alt={selectedSpace.name} />
                        <input type="file" onChange={handleImageChange} accept="image/*" />
                        <div>
                            <label>Name area:</label>
                            <input 
                                type="text" 
                                value={editedName} 
                                onChange={(e) => setEditedName(e.target.value)} 
                                placeholder="Edit Name" 
                            />
                        </div>
                        <div>
                            <label>Advertising words:</label>
                            <input 
                                type="text" 
                                value={editedAdvertisingWords} 
                                onChange={(e) => setEditedAdvertisingWords(e.target.value)} 
                                placeholder="Edit Advertising Words" 
                            />
                        </div>
                        <div>
                            <label>Address:</label>
                            <input 
                                type="text" 
                                value={editedAddress} 
                                onChange={(e) => setEditedAddress(e.target.value)} 
                                placeholder="Edit Address" 
                            />
                        </div>
                        <div>
                            <label>Types:</label>
                            <input 
                                type="text" 
                                value={editedTypes} 
                                onChange={(e) => setEditedTypes(e.target.value)} 
                                placeholder="Edit Types" 
                            />
                        </div>
                        <div>
                            <label>Size:</label>
                            <input 
                                type="text" 
                                value={editedSize} 
                                onChange={(e) => setEditedSize(e.target.value)} 
                                placeholder="Edit Size" 
                            />
                        </div>
                        <div>
                            <label>Price:</label>
                            <input 
                                type="number" 
                                value={editedPrice} 
                                onChange={(e) => setEditedPrice(e.target.value)} 
                                placeholder="Edit Price" 
                            />
                        </div>
                        <button onClick={handleSaveChanges} className="save-button">Save Changes</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
