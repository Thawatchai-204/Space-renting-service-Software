import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig'; // นำเข้า axiosConfig

const Home = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // เรียกใช้ Axios เพื่อเรียกข้อมูลจาก Backend
    axios.get('/path-to-your-api-endpoint')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div>
      <h1>Home Page</h1>
      {/* แสดงข้อมูลที่ได้จาก API */}
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
