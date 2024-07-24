
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // URL ของ backend
});

export const getSpaces = () => api.get('/spaces');
export const createSpace = (spaceData) => api.post('/spaces', spaceData);
export const updateSpace = (id, spaceData) => api.patch(`/spaces/${id}`, spaceData);
export const deleteSpace = (id) => api.delete(`/spaces/${id}`);
export const registerUser = (userData) => api.post('/users/register', userData);
export const loginUser = (userData) => api.post('/users/login', userData);


// ฟังก์ชันสำหรับค้นหาพื้นที่
export const searchSpaces = async (query) => {
  // เขียนโค้ดสำหรับการค้นหาพื้นที่ที่นี่
  const response = await fetch(`/api/spaces?search=${query}`);
  if (!response.ok) {
      throw new Error('Network response was not ok');
  }
  return response.json();
};

export default api;
