import React, { useEffect, useState } from 'react';
import api from '../api';

function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/your-endpoint')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, []);

  return (
    <div>
      <h1>Welcome to Space Renting Service</h1>
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
