import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomeEN from './pages/EN/Service_users/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ReserveEN from './pages/EN/Service_users/Reserve';
import ProfileEN from './pages/EN/Service_users/Profile';
import SettingsEN from './pages/EN/Service_users/Settings';
import WalletEN from './pages/EN/Service_users/Wallet';

import LoginTH from './pages/LoginTH';
import RegisterTH from './pages/RegisterTH';
import HomeTH from './pages/TH/Service_users/Home';
import ReserveTH from './pages/TH/Service_users/Reserve';
import ProfileTH from './pages/TH/Service_users/Profile';
import SettingsTH from './pages/TH/Service_users/Settings';
import WalletTH from './pages/TH/Service_users/Wallet';

import './App.css';

function App() {
  const [language, setLanguage] = useState('EN');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage((prevLang) => {
      const newLang = prevLang === 'EN' ? 'TH' : 'EN';
      localStorage.setItem('language', newLang);
      return newLang;
    });
  };

  return (
    <Router>
      <div className="language-toggle">
        <button onClick={toggleLanguage}>
          {language === 'EN' ? 'Switch to TH' : 'Switch to EN'}
        </button>
      </div>
      <Routes>
        {language === 'EN' ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<HomeEN />} />
            <Route path="/reserve" element={<ReserveEN />} />
            <Route path="/profile" element={<ProfileEN />} />
            <Route path="/settings" element={<SettingsEN />} />
            <Route path="/wallet" element={<WalletEN />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<LoginTH />} />
            <Route path="/register" element={<RegisterTH />} />
            <Route path="/home" element={<HomeTH />} />
            <Route path="/reserve" element={<ReserveTH />} />
            <Route path="/profile" element={<ProfileTH />} />
            <Route path="/settings" element={<SettingsTH />} />
            <Route path="/wallet" element={<WalletTH />} />
          </>
        )}
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default App;
