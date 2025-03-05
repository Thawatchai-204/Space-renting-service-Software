import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // เพิ่ม useNavigate
import './Addspace.css';
import { FaHome, FaPlus, FaList, FaUsers, FaCog, FaSignOutAlt, FaBell } from 'react-icons/fa';

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
    imagePreview: null,
  });

  const [username, setUsername] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const navigate = useNavigate(); // เพิ่มสำหรับการ redirect

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');

    if (storedUserId) {
      setUsername(storedUsername || 'User');
      fetchWalletBalance(storedUserId);
    } else {
      console.error('User ID not found in localStorage. Redirecting to login...');
      navigate('/login'); // ถ้าไม่มี userId ให้ redirect
    }
  }, [navigate]);

  const fetchWalletBalance = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/wallet/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Wallet balance:', data); // log เพื่อ debug
      setWalletBalance(data.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error.message);
      setWalletBalance(0);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: files[0],
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User ID not found. Please log in again.');
      navigate('/login');
      return;
    }

    const data = new FormData();
    data.append('userId', userId); // เพิ่ม userId เพื่อระบุเจ้าของพื้นที่
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

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Server response:', result); // log เพื่อ debug

      if (result.success) {
        alert('Space saved successfully!');
        navigate('/Managespace'); // redirect ไปหน้า Manage Space หลังสำเร็จ
      } else {
        alert(`Error saving space: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving space:', error.message);
      alert('Error saving space. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/Managespace'); // กลับไปหน้า Manage Space เมื่อกด Cancel
  };

  return (
    <div className="container-fluid d-flex flex-column vh-100 p-0">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm">
        <div className="container-fluid">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="/Home"><FaHome className="me-2" /> Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" href="/Addspace"><FaPlus className="me-2" /> Add Space</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/Managespace"><FaList className="me-2" /> Manage Space</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/Profile"><FaUsers className="me-2" /> Profile</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/Settings"><FaCog className="me-2" /> Settings</a>
              </li>
            </ul>
            <div className="d-flex align-items-center gap-3">
              <a href="/Profile" className="text-decoration-none text-light">{username}</a>
              <a href="/Wallet" className="btn btn-outline-light btn-sm"><FaBell className="me-2" /> Wallet: {walletBalance} THB</a>
              <a href="/login" className="btn btn-danger btn-sm"><FaSignOutAlt className="me-2" /> Logout</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="d-flex flex-grow-1 align-items-center justify-content-center p-0">
        <div className="reserve-form-container">
          <header className="text-center mb-4">
            <h1 className="fw-bold">Add Space</h1>
          </header>
          <form className="reserve-form" onSubmit={handleSubmit}>
            <div className="row">
              {/* Column 1: Image */}
              <div className="col-md-3">
                <div className="form-group">
                  <label>Image:</label>
                  <input type="file" name="image" onChange={handleChange} className="form-control" accept="image/*" required />
                </div>
                {formData.imagePreview && (
                  <div className="image-preview mt-2">
                    <img src={formData.imagePreview} alt="Preview" className="img-fluid rounded" style={{ maxHeight: '200px' }} />
                  </div>
                )}
              </div>

              {/* Column 2: Name area, Address, Advertising words, Types, Size */}
              <div className="col-md-5">
                <div className="form-group">
                  <label>Name area:</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" required />
                </div>
                <div className="form-group">
                  <label>Address:</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-control" required />
                </div>
                <div className="form-group">
                  <label>Advertising words:</label>
                  <input type="text" name="advertisingWords" value={formData.advertisingWords} onChange={handleChange} className="form-control" required />
                </div>
                <div className="form-group">
                  <label>Types:</label>
                  <select name="types" value={formData.types} onChange={handleChange} className="form-control" required>
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
                      className="form-control mt-2"
                      required
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>Size (sqm):</label>
                  <input type="text" name="size" value={formData.size} onChange={handleChange} className="form-control" required />
                </div>
              </div>

              {/* Column 3: Price per Hour, Day, Week, Month */}
              <div className="col-md-4">
                <div className="form-group">
                  <label>Price per Hour (THB):</label>
                  <input type="number" name="pricePerHour" value={formData.pricePerHour} onChange={handleChange} className="form-control" min="0" required />
                </div>
                <div className="form-group">
                  <label>Price per Day (THB):</label>
                  <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} className="form-control" min="0" required />
                </div>
                <div className="form-group">
                  <label>Price per Week (THB):</label>
                  <input type="number" name="pricePerWeek" value={formData.pricePerWeek} onChange={handleChange} className="form-control" min="0" required />
                </div>
                <div className="form-group">
                  <label>Price per Month (THB):</label>
                  <input type="number" name="pricePerMonth" value={formData.pricePerMonth} onChange={handleChange} className="form-control" min="0" required />
                </div>
              </div>
            </div>

            {/* Cancel and Save Buttons */}
            <div className="form-actions mt-4">
              <button className="btn btn-secondary me-2" type="button" onClick={handleCancel}>Cancel</button>
              <button className="btn btn-primary" type="submit">Save</button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-light py-4 mt-5">
        <div className="container text-center">
          <img src="https://raw.githubusercontent.com/Thawatchai-204/Space-renting-service-Software/refs/heads/main/Screenshot%20202024-07-26%2020013811.png" alt="Logo" width="100" />
          <p className="mt-3">© 2023 All rights reserved.</p>
          <div className="mt-2">
            <button className="btn btn-link text-light">🇺🇸</button>
            <button className="btn btn-link text-light">🇹🇭</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Reserve;