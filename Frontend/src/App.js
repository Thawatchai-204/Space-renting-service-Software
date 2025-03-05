import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LanguageProvider } from './LanguageContext';

// นำเข้า Components
import HomeEN from './pages/EN/Service_users/Home';
import ServiceProviderHome from './pages/EN/Service_provider/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LoginTH from './pages/LoginTH';
import RegisterTH from './pages/RegisterTH';
import Reservations from './pages/EN/Service_users/Reservations';
import WalletEN from './pages/EN/Service_users/Wallet';
import ReserveEN from './pages/EN/Service_users/Reserve';
import ProfileEN from './pages/EN/Service_users/Profile';
import SettingsEN from './pages/EN/Service_users/Settings';
import RateitEN from './pages/EN/Service_users/Rateit';
import DetailsEN from './pages/EN/Service_users/Details';
import AddspaceEN from './pages/EN/Service_provider/Addspace';
import ReserveFormEN from './pages/EN/Service_users/ReserveForm';
import AdminDashboard from './pages/EN/Administrator/AdminDashboard';
import AdminWallet from './pages/EN/Administrator/AdminWallet';
import AdminProfile from './pages/EN/Administrator/AdminProfile';
import AdminSettings from './pages/EN/Administrator/AdminSettings';
import AdminManageSpace from './pages/EN/Administrator/AdminManageSpace';
import Managespace from './pages/EN/Service_provider/ManageSpace';
import Users from './pages/EN/Administrator/Users';
import Request from './pages/EN/Administrator/Request';
import AdminTransactions from './pages/EN/Administrator/AdminTransactions';
import './App.css';

// ProtectedRoute Component
const ProtectedRoute = ({ element: Component, requireAdmin = false, ...rest }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    const userRole = localStorage.getItem('role') || 'user';

    console.log(`ProtectedRoute: isAuthenticated=${isAuthenticated}, userRole=${userRole}, requireAdmin=${requireAdmin}`);

    if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to /login');
        return <Navigate to="/login" />;
    }

    if (requireAdmin && userRole !== 'admin') {
        console.log('Not an admin, redirecting to /Home');
        return <Navigate to="/Home" />;
    }

    // เรนเดอร์คอมโพเนนต์ที่ส่งเข้ามา
    return <Component {...rest} />;
};

function App() {
    return (
        <LanguageProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/loginTH" element={<LoginTH />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/registerTH" element={<RegisterTH />} />
                    <Route path="/" element={<Navigate to="/login" />} />

                    {/* Protected Routes for Regular Users */}
                    <Route path="/Home" element={<ProtectedRoute element={HomeEN} />} />
                    <Route path="/reserve" element={<ProtectedRoute element={ReserveEN} />} />
                    <Route path="/profile" element={<ProtectedRoute element={ProfileEN} />} />
                    <Route path="/settings" element={<ProtectedRoute element={SettingsEN} />} />
                    <Route path="/wallet" element={<ProtectedRoute element={WalletEN} />} />
                    <Route path="/rateit" element={<ProtectedRoute element={RateitEN} />} />
                    <Route path="/details" element={<ProtectedRoute element={DetailsEN} />} />
                    <Route path="/addspace" element={<ProtectedRoute element={AddspaceEN} />} />
                    <Route path="/reserveform" element={<ProtectedRoute element={ReserveFormEN} />} />
                    <Route path="/reservations" element={<ProtectedRoute element={Reservations} />} />
                    <Route path="/Service_provider/home" element={<ProtectedRoute element={ServiceProviderHome} />} />
                    <Route path="/Managespace/:spaceId" element={<ProtectedRoute element={Managespace} />} />

                    {/* Protected Routes for Admins Only */}
                    <Route 
                        path="/AdminDashboard" 
                        element={<ProtectedRoute element={AdminDashboard} requireAdmin={true} />} 
                    />
                    <Route 
                        path="/AdminWallet" 
                        element={<ProtectedRoute element={AdminWallet} requireAdmin={true} />} 
                    />
                    <Route 
                        path="/AdminProfile" 
                        element={<ProtectedRoute element={AdminProfile} requireAdmin={true} />} 
                    />
                    <Route 
                        path="/AdminSettings" 
                        element={<ProtectedRoute element={AdminSettings} requireAdmin={true} />} 
                    />
                    <Route 
                        path="/AdminManageSpace" 
                        element={<ProtectedRoute element={AdminManageSpace} requireAdmin={true} />} 
                    />
                    <Route 
                        path="/AdminUsers" 
                        element={<ProtectedRoute element={Users} requireAdmin={true} />} 
                    />
                    <Route 
                        path="/AdminRequests" 
                        element={<ProtectedRoute element={Request} requireAdmin={true} />} 
                    />
                    <Route 
                        path="/AdminTransactions" 
                        element={<ProtectedRoute element={AdminTransactions} requireAdmin={true} />} 
                    />

                    {/* Fallback Route */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </LanguageProvider>
    );
}

export default App;