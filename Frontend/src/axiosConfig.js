// src/axiosConfig.js
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL // จาก environment variable
});

export default instance;
