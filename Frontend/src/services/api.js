// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // URL ของ backend
});

// ฟังก์ชันที่ใช้สำหรับการจัดการข้อมูลพื้นที่
export const getSpaces = () => api.get('/spaces'); // ดึงข้อมูลพื้นที่
export const createSpace = (spaceData) => api.post('/spaces', spaceData); // สร้างพื้นที่ใหม่
export const updateSpace = (id, spaceData) => api.patch(`/spaces/${id}`, spaceData); // อัปเดตข้อมูลพื้นที่
export const deleteSpace = (id) => api.delete(`/spaces/${id}`); // ลบพื้นที่
export const registerUser = (userData) => api.post('/users/register', userData); // ลงทะเบียนผู้ใช้
export const loginUser = (userData) => api.post('/users/login', userData); // เข้าสู่ระบบผู้ใช้

// ฟังก์ชันสำหรับค้นหาพื้นที่
export const searchSpaces = async (query) => {
  const response = await fetch(`/api/spaces?search=${query}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export default api;

