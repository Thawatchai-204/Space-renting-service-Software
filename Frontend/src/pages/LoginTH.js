import React from 'react';
import './Login.css';

function Login() {
    return (
        <div className="login-container">
            <div className="login-left">
                <h1>Space renting service Software</h1>
                <img src="https://i0.wp.com/storage.googleapis.com/fplswordpressblog/2024/04/4-10.png?resize=1024%2C1024&ssl=1" alt="Space renting" />
            </div>
            <div className="login-right">
            <a href="/Home">Skip</a>
                <h1>เข้าสู่ระบบ</h1>
                <form>
                    <div className="input-group">
                        <label htmlFor="email">อีเมล</label>
                        <input type="email" id="email" required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">รหัสผ่าน</label>
                        <input type="password" id="password" required />
                    </div>
                    <div className="social-login">
                        <button type="button" className="social-button facebook">Facebook</button>
                        <button type="button" className="social-button google">Gmail</button>
                        <button type="button" className="social-button apple">Apple</button>
                        <button type="button" className="social-button line">LINE</button>
                    </div>
                    <div className="remember-me">
                        <input type="checkbox" id="remember-me" />
                        <label htmlFor="remember-me">จดจำการเข้าใช้งาน</label>
                    </div>
                    <div className="forgot-password">
                        <a href="/forgot-password">ลืมรหัสผ่าน</a>
                    </div>
                    <button type="submit" className="login-button">เข้าสู่ระบบ</button>
                </form>
                <div className="create-account">
                    <a href="/register">สร้างบัญชีผู้ใช้ใหม่</a>
                </div>
            </div>
        </div>
    );
}

export default Login;
