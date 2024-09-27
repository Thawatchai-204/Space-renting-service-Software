const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware'); // Middleware ตรวจสอบ token
const User = require('../models/User'); // โมเดลของผู้ใช้

// ดึงข้อมูลโปรไฟล์ผู้ใช้
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId); // ใช้ userId ที่ได้จาก token
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            name: user.name,
            email: user.email,
            phone: user.phone
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
