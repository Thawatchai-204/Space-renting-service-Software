import React, { useState } from 'react';

function ReserveForm() {
  // ใช้ useState เพื่อเก็บค่า input ของผู้ใช้
  const [size, setSize] = useState(0); // ขนาดพื้นที่
  const [pricePerUnit, setPricePerUnit] = useState(0); // ราคาต่อตารางเมตร
  const [duration, setDuration] = useState(1); // ระยะเวลาการเช่า (วัน)
  const [totalPrice, setTotalPrice] = useState(0); // ราคารวม

  // ฟังก์ชันคำนวณราคารวม
  const calculateTotal = () => {
    const total = size * pricePerUnit * duration;
    setTotalPrice(total); // อัพเดทค่าราคารวม
  };

  // ฟังก์ชันส่งข้อมูลไปที่ Backend
  const handleSubmit = async (e) => {
    e.preventDefault(); // ป้องกันการ refresh หน้าจอเมื่อส่งฟอร์ม
    const total = size * pricePerUnit * duration;

    try {
      // ส่งข้อมูลไปยัง API ที่ Backend
      const response = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          size: size,
          pricePerUnit: pricePerUnit,
          duration: duration,
          total: total
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert("Reserve Success!"); // แจ้งเตือนเมื่อการจองสำเร็จ
      } else {
        alert("Error: " + data.message); // แจ้งเตือนหากเกิดข้อผิดพลาด
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting form."); // แจ้งเตือนหากเกิดข้อผิดพลาด
    }
  };

  return (
    <div>
      <h1>Reserve Space</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Size (sqm):
          <input
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)} // เก็บค่าขนาดพื้นที่
          />
        </label>

        <label>
          Price per sqm:
          <input
            type="number"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)} // เก็บค่าราคาต่อตารางเมตร
          />
        </label>

        <label>
          Duration (days):
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)} // เก็บค่าระยะเวลาการเช่า
          />
        </label>

        <button type="button" onClick={calculateTotal}>
          Calculate Total
        </button>

        <h3>Total Price: {totalPrice}</h3>

        <button type="submit">Reserve</button>
      </form>
    </div>
  );
}

export default ReserveForm;
