import React, { useState } from 'react';
import './Addspace.css';
import { FaHome, FaCalendarAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

function Reserve() {
  const [formData, setFormData] = useState({
    name: '',
    advertisingWords: '',
    address: '',
    types: '',
    otherType: '',
    size: '',
    pricePerHour: '',
    pricePerDay: '',
    pricePerWeek: '',
    pricePerMonth: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('advertisingWords', formData.advertisingWords);
    data.append('address', formData.address);
    data.append('types', formData.types === 'Other' ? formData.otherType : formData.types);
    data.append('size', formData.size);
    data.append('pricePerHour', formData.pricePerHour || 0);
    data.append('pricePerDay', formData.pricePerDay || 0);
    data.append('pricePerWeek', formData.pricePerWeek || 0);
    data.append('pricePerMonth', formData.pricePerMonth || 0);
    data.append('image', formData.image);

    try {
        const response = await fetch('http://localhost:5000/api/manage-space', {
            method: 'POST',
            body: data,
        });

        const result = await response.json();

        if (result.success) {
            alert('Space saved successfully!');
        } else {
            alert(`Error saving space: ${result.message}`);
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
          <li>
            <a href="/Home">
              <img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/refs/heads/main/Screenshot%20202024-07-26%2020013811.png" alt="Logo" />
            </a>
          </li>
        </div>
        <nav>
          <ul>
            <li><a href="/Home"><FaHome /> Home</a></li>
            <li className="active"><a href="/Addspace"><FaCalendarAlt /> Add space</a></li>
            <li><a href="/Managespace"><FaCalendarAlt /> Manage space</a></li>
            <li><a href="/Profile"><FaUser /> Profile</a></li>
            <li><a href="/Settings"><FaCog /> Settings</a></li>
            <li className="logout"><a href="/login"><FaSignOutAlt /> Log out</a></li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <header>
          <h1>Add space</h1>
        </header>
        <section className="content">
          <form className="reserve-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="form-group">
                <label>Name area:</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Advertising words:</label>
                <input type="text" name="advertisingWords" value={formData.advertisingWords} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label>Address:</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Types:</label>
                <select name="types" value={formData.types} onChange={handleChange} required>
                  <option value="">Select Type</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Office">Office</option>
                  <option value="Retail">Retail</option>
                  <option value="Other">Other</option>
                </select>
                {formData.types === 'Other' && (
                  <input
                    type="text"
                    name="otherType"
                    value={formData.otherType}
                    onChange={handleChange}
                    placeholder="Specify type"
                    required
                  />
                )}
              </div>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label>Size:</label>
                <input type="text" name="size" value={formData.size} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Price per Hour (THB):</label>
                <input type="number" name="pricePerHour" value={formData.pricePerHour} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Price per Day (THB):</label>
                <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Price per Week (THB):</label>
                <input type="number" name="pricePerWeek" value={formData.pricePerWeek} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Price per Month (THB):</label>
                <input type="number" name="pricePerMonth" value={formData.pricePerMonth} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Image:</label>
              <input type="file" name="image" onChange={handleChange} required />
            </div>

            <div className="form-actions">
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
