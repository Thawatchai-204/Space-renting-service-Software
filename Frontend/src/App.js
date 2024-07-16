import React, { useEffect, useState } from 'react';
import api from './api';

const App = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Data from Backend</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default App;
