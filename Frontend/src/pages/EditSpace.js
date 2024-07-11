import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

function EditSpace() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    description: '',
  });

  useEffect(() => {
    api.get(`/spaces/${id}`)
      .then(response => {
        setFormData(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the space data!', error);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.put(`/spaces/${id}`, formData)
      .then(response => {
        console.log('Space updated successfully:', response.data);
      })
      .catch(error => {
        console.error('There was an error updating the space!', error);
      });
  };

  return (
    <div>
      <h1>Edit Space</h1>
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
        <button type="submit">Update Space</button>
      </form>
    </div>
  );
}

export default EditSpace;
