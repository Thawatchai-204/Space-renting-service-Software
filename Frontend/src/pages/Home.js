import React, { useEffect, useState } from 'react';
import { getAllSpaces } from '../services/api';

const Home = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllSpaces();
        setData(response);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Data from Backend</h1>
      {data.length > 0 ? (
        <ul>
          {data.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default Home;
