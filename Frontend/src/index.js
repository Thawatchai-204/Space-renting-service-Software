import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// ชี้ไปยัง element หลักที่ id="root"
const container = document.getElementById('root');
const root = createRoot(container);

// Render App
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
