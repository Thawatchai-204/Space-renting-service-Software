import React, { useState } from 'react';

const ManageSpace = () => {
  const [spaceData, setSpaceData] = useState({
    name: '',
    type: '',
    size: '',
    available: true,
    price: '',
  });

  const handleChange = (e) => {
    setSpaceData({
      ...spaceData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/manage-space', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spaceData),
      });
      const data = await response.json();
      if (data.success) {
        alert('บันทึกข้อมูลพื้นที่สำเร็จ!');
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
    }
  };

  return (
    <div className="manage-space">
      <h2>จัดการพื้นที่</h2>
      <form onSubmit={handleSubmit}>
        <label>
          ชื่อพื้นที่:
          <input
            type="text"
            name="name"
            value={spaceData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          ประเภท:
          <input
            type="text"
            name="type"
            value={spaceData.type}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          ขนาด:
          <input
            type="text"
            name="size"
            value={spaceData.size}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          สถานะการใช้งาน:
          <select
            name="available"
            value={spaceData.available}
            onChange={handleChange}
            required
          >
            <option value={true}>ใช้งานได้</option>
            <option value={false}>ไม่สามารถใช้งานได้</option>
          </select>
        </label>
        <label>
          ราคา:
          <input
            type="number"
            name="price"
            value={spaceData.price}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">บันทึกพื้นที่</button>
      </form>
    </div>
  );
};

export default ManageSpace;
