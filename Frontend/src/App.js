
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomeEN from './pages/EN/Service_users/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LoginTH from './pages/LoginTH';
import RegisterTH from './pages/RegisterTH';
import HomeTH from './pages/TH/Service_users/Home';
import Reservations from './pages/EN/Service_users/Reservations';

/*Start Service users*/
import ReserveEN from './pages/EN/Service_users/Reserve';
import ProfileEN from './pages/EN/Service_users/Profile';
import SettingsEN from './pages/EN/Service_users/Settings';
import WalletEN from './pages/EN/Service_users/Wallet';
import StatusEN from './pages/EN/Service_users/Status';
import TopupEN from './pages/EN/Service_users/Topup';
import RateitEN from './pages/EN/Service_users/Rateit';
import ManageSpaceEN from './pages/EN/Service_users/Managespace';
import DetailsEN from './pages/EN/Service_users/Details';
import AddspaceEN from './pages/EN/Service_users/Addspace';
import ReserveFormEN from './pages/EN/Service_users/ReserveForm'; 



import ReserveTH from './pages/TH/Service_users/Reserve';
import ProfileTH from './pages/TH/Service_users/Profile';
import SettingsTH from './pages/TH/Service_users/Settings';
import WalletTH from './pages/TH/Service_users/Wallet';
import StatusTH from './pages/TH/Service_users/Status';
import TopupTH from './pages/TH/Service_users/Topup';
import RateitTH from './pages/TH/Service_users/Rateit';
import ManageSpaceTH from './pages/TH/Service_users/Managespace';
import DetailsTH from './pages/TH/Service_users/Details';
import AddspaceTH from './pages/TH/Service_users/Addspace';

/*End Service users*/

/*Start Admin*/

/*End Admin*/

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
            <Route path="/status" element={<StatusEN />} />
            <Route path="/topup" element={<TopupEN />} />
            <Route path="/rateit" element={<RateitEN />} />
            <Route path="/details" element={<DetailsEN />} />
            <Route path="/manageSpace" element={<ManageSpaceEN />} />
            <Route path="/addspace" element={<AddspaceEN />} />
            <Route path="/reserveform" element={<ReserveFormEN />} />
            <Route path="/reservations" element={<Reservations />} />
            
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
            <Route path="/status" element={<StatusTH />} />
            <Route path="/topup" element={<TopupTH />} />
            <Route path="/rateit" element={<RateitTH />} />
            <Route path="/details" element={<DetailsTH />} />
            <Route path="/manageSpace" element={<ManageSpaceTH />} />
            <Route path="/addspace" element={<AddspaceTH />} />
          </>
        )}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
