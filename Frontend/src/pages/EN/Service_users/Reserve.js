import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Reserve() {
  const { spaceId } = useParams();
  const [space, setSpace] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // ดึงข้อมูลพื้นที่เฉพาะอันที่ผู้ใช้เลือก
  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/spaces/${spaceId}`);
        setSpace(response.data);
      } catch (error) {
        console.error('Error fetching space:', error);
      }
    };

    fetchSpace();
  }, [spaceId]);

  const handleReserve = async () => {
    try {
      const bookingData = {
        spaceId,
        userId: 'user-id', // สมมติว่า userId ถูกเก็บจากระบบ authentication
        date,
        time,
      };
      await axios.post('http://localhost:5000/api/reserve', bookingData);
      alert('Reservation successful!');
    } catch (error) {
      console.error('Error reserving space:', error);
      alert('Failed to reserve space.');
    }
  };

  if (!space) return <p>Loading...</p>;

  return (
    <div className="reserve-container">
      <h1>Reserve {space.name}</h1>
      <p>{space.advertisingWords}</p>
      <p>{space.address}</p>
      <p>Price: {space.price} THB</p>
      <img src={`http://localhost:5000/uploads/${space.image}`} alt={space.name} />

      <div className="reservation-form">
        <label>Select Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label>Select Time:</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

        <button onClick={handleReserve}>Reserve</button>
      </div>
    </div>
  );
}

export default Reserve;