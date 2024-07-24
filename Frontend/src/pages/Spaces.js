import React, { useEffect, useState } from 'react';
import { getSpaces, createSpace, updateSpace, deleteSpace } from '../services/api';

function Spaces() {
  const [spaces, setSpaces] = useState([]);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const response = await getSpaces();
      setSpaces(response.data);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    }
  };

  const handleCreateSpace = async (spaceData) => {
    try {
      await createSpace(spaceData);
      fetchSpaces();
    } catch (error) {
      console.error('Error creating space:', error);
    }
  };

  const handleUpdateSpace = async (id, spaceData) => {
    try {
      await updateSpace(id, spaceData);
      fetchSpaces();
    } catch (error) {
      console.error('Error updating space:', error);
    }
  };

  const handleDeleteSpace = async (id) => {
    try {
      await deleteSpace(id);
      fetchSpaces();
    } catch (error) {
      console.error('Error deleting space:', error);
    }
  };

  return (
    <div>
      <h1>Spaces</h1>
      {/* แสดงข้อมูลพื้นที่เช่า */}
      {spaces.map((space) => (
        <div key={space._id}>
          <h2>{space.name}</h2>
          <p>{space.description}</p>
          <button onClick={() => handleUpdateSpace(space._id, { name: 'Updated Space' })}>Update</button>
          <button onClick={() => handleDeleteSpace(space._id)}>Delete</button>
        </div>
      ))}
      {/* เพิ่มพื้นที่เช่าใหม่ */}
      <button onClick={() => handleCreateSpace({ name: 'New Space', description: 'Description' })}>Add Space</button>
    </div>
  );
}

export default Spaces;
