// I want when I press save the data will be saved to mongodb.
import React, { useState } from 'react';
import './Addspace.css';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

function Reserve() {
    const [formData, setFormData] = useState({
        name: '',
        advertisingWords: '',
        address: '',
        types: '',
        size: '',
        price: '',
        image: null
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('advertisingWords', formData.advertisingWords);
        data.append('address', formData.address);
        data.append('types', formData.types);
        data.append('size', formData.size);
        data.append('price', formData.price);
        data.append('image', formData.image);

        try {
            const response = await fetch('http://localhost:5000/api/manage-space', {
                method: 'POST',
                body: data
            });

            const result = await response.json();

            if (result.success) {
                alert('Space saved successfully!');
            } else {
                alert('Error saving space');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error saving space');
        }
    };

    return (
        <div className="reserve-container">
            <aside className="sidebar">
                <div className="logo">
                    <li><a href="/Home"><img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/main/Screenshot%202024-07-26%20013811.png" alt="Logo" /></a></li>
                </div>
                <nav>
                    <ul>
                        <li><a href="/Home"><FaHome /> Home</a></li>
                        <li className="active"><a href="/Reserve"><FaCalendarAlt /> Reserve</a></li>
                        <li><a href="/Profile"><FaUser /> Profile</a></li>
                        <li><a href="/Settings"><FaCog /> Settings</a></li>
                        <li className="logout"><a href="/login"><FaSignOutAlt /> Log out</a></li>
                    </ul>
                </nav>
            </aside>
            <main className="main-content">
                <header>
                    <h1>Reserve</h1>
                    <div className="user-info">
                        <span className="notification-icon">🔔</span>
                        <li><a href="/Profile"><span className="user-name">hazeijz jaz</span></a></li>
                    </div>
                </header>
                <section className="content">
                    <form className="reserve-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name area:</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Advertising words:</label>
                            <input type="text" name="advertisingWords" value={formData.advertisingWords} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Address:</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Types:</label>
                            <input type="text" name="types" value={formData.types} onChange={handleChange} />
                        </div>
                        <div className="form-group-inline">
                            <div className="form-group">
                                <label>Size:</label>
                                <input type="text" name="size" value={formData.size} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Price:</label>
                                <input type="text" name="price" value={formData.price} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Upload Image:</label>
                            <input type="file" name="image" onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <button className="save-button" type="submit">Save</button>
                            <button className="cancel-button" type="button">Cancel</button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default Reserve;
