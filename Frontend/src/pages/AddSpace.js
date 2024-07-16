import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const AddSpace = () => {
  const history = useHistory();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      history.push('/login');
    }
  }, [history]);

  return (
    <div>
      <h1>Add Space</h1>
      {/* ฟอร์มสำหรับเพิ่มพื้นที่ */}
    </div>
  );
};

export default AddSpace;
