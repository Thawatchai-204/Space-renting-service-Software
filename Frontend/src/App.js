// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LanguageProvider } from './LanguageContext'; // นำเข้า LanguageProvider

// นำเข้า Components ต่าง ๆ
import HomeTH from './pages/TH/Service_users/Home';
import HomeEN from './pages/EN/Service_users/Home';
import ServiceProviderHome from './pages/EN/Service_provider/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LoginTH from './pages/LoginTH';
import RegisterTH from './pages/RegisterTH';
import Reservations from './pages/EN/Service_users/Reservations';
import WalletEN from './pages/EN/Service_users/Wallet';
import WalletTH from './pages/TH/Service_users/Wallet';
import ReserveEN from './pages/EN/Service_users/Reserve';
import ProfileEN from './pages/EN/Service_users/Profile';
import SettingsEN from './pages/EN/Service_users/Settings';
import StatusEN from './pages/EN/Service_users/Status';
import TopupEN from './pages/EN/Service_users/Topup';
import RateitEN from './pages/EN/Service_users/Rateit';
import ManageSpaceEN from './pages/EN/Service_users/Managespace';
import DetailsEN from './pages/EN/Service_users/Details';
import AddspaceEN from './pages/EN/Service_provider/Addspace';
import ReserveFormEN from './pages/EN/Service_users/ReserveForm';
import ReserveTH from './pages/TH/Service_users/Reserve';
import ProfileTH from './pages/TH/Service_users/Profile';
import SettingsTH from './pages/TH/Service_users/Settings';
import StatusTH from './pages/TH/Service_users/Status';
import TopupTH from './pages/TH/Service_users/Topup';
import RateitTH from './pages/TH/Service_users/Rateit';
import ManageSpaceTH from './pages/TH/Service_users/Managespace';
import DetailsTH from './pages/TH/Service_users/Details';
import AdminDashboard from './pages/EN/Administrator/AdminDashboard';
import './App.css';

function App() {
    return (
        <LanguageProvider>
            <Router>
                <Routes>
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
                    <Route path="/AdminDashboard" element={<AdminDashboard />} />
                    <Route path="/Service_provider/home" element={<ServiceProviderHome />} />
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </LanguageProvider>
    );
}

export default App;