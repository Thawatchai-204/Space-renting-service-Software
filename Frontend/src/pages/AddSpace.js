import React, { useState } from 'react';
import api from '../api';

function AddSpace() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    description: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('/spaces', formData)
      .then(response => {
        console.log('Space added successfully:', response.data);
      })
      .catch(error => {
        console.error('There was an error adding the space!', error);
      });
  };

  return (
    <div>
      <h1>Add New Space</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
        </label>
        <br />
        <label>
          Location:
          <input type="text" name="location" value={formData.location} onChange={handleChange} />
        </label>
        <br />
        <label>
          Price:
          <input type="text" name="price" value={formData.price} onChange={handleChange} />
        </label>
        <br />
        <label>
          Description:
          <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
        </label>
        <br />
        <button type="submit">Add Space</button>
      </form>
    </div>
  );
}

export default AddSpace;
