import React from 'react';
import './Register.css';

function Register() {
  return (
    <div className="register-container">
      <div className="left-section">
        <h2>ลงทะเบียน</h2>
        <form>
          <input type="email" placeholder="อีเมล" required />
          <input type="password" placeholder="รหัสผ่าน" required />
          <input type="password" placeholder="ยืนยันรหัสผ่าน" required />
          <select required>
            <option value=" ">บทบาท</option>
            <option value="user"> ผู้ใช้บริการ</option>
            <option value="admin"> ผู้ให้บริการ</option>
          </select>
            <button type="submit">ลงทะเบียน</button>
            <a href="/login">เข้าสู่ระบบ</a>
        </form>
      </div>
      <div className="right-section">
        <img src="https://d4804za1f1gw.cloudfront.net/wp-content/uploads/sites/60/2023/09/Job-Answers-Lead-Image.png" alt="Space renting service Software" className="logo" />
      </div>
    </div>
  );
}

export default Register;