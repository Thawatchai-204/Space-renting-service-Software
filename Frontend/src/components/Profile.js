import React, { useState, useEffect } from 'react';
import './Profile.css';

function Profile() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // ใช้ useEffect เพื่อดึงข้อมูลโปรไฟล์หลังจากที่ผู้ใช้ล็อกอิน
    useEffect(() => {
        const token = localStorage.getItem('token'); // ดึง token ที่เก็บใน localStorage
        if (token) {
            fetchProfile(token);
        }
    }, []);

    // ฟังก์ชันดึงข้อมูลโปรไฟล์จาก backend
    const fetchProfile = async (token) => {
        try {
            const response = await fetch('/api/profile', {
                headers: { 'Authorization': `Bearer ${token}` }, // ส่ง token ไปกับ request
            });
            if (response.ok) {
                const data = await response.json();
                setName(data.name);
                setEmail(data.email);
                setPhone(data.phone);
            } else {
                console.log('Error fetching profile');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="profile-container">
            <h1>Profile</h1>
            <div>
                <label>Name: </label>
                <input type="text" value={name} readOnly />
            </div>
            <div>
                <label>Email: </label>
                <input type="text" value={email} readOnly />
            </div>
            <div>
                <label>Phone: </label>
                <input type="text" value={phone} readOnly />
            </div>
        </div>
    );
}

export default Profile;
