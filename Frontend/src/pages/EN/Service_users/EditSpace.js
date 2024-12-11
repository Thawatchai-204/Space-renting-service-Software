import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function EditSpace() {
  const { id } = useParams(); // ดึง spaceId จาก URL
  const [space, setSpace] = useState(null);

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/spaces/${id}`);
        setSpace(response.data);
      } catch (error) {
        console.error('Error fetching space:', error);
      }
    };

    fetchSpace();
  }, [id]);

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/spaces/${id}`, {
        ...space,
        userId: localStorage.getItem('userId'), // ส่ง userId เพื่อยืนยันความเป็นเจ้าของ
      });
      alert('Space updated successfully');
      window.location.href = '/manage-space';
    } catch (error) {
      console.error('Error updating space:', error);
      alert('Failed to update space');
    }
  };

  if (!space) return <p>Loading...</p>;

  return (
    <div className="edit-space-container">
      <h1>Edit Space</h1>
      <label>
        Name:
        <input
          type="text"
          value={space.name}
          onChange={(e) => setSpace({ ...space, name: e.target.value })}
        />
      </label>
      <label>
        Address:
        <input
          type="text"
          value={space.address}
          onChange={(e) => setSpace({ ...space, address: e.target.value })}
        />
      </label>
      <label>
        Price:
        <input
          type="number"
          value={space.price}
          onChange={(e) => setSpace({ ...space, price: e.target.value })}
        />
      </label>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

export default EditSpace;
