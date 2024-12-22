const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Secret key สำหรับ JWT
const JWT_SECRET = process.env.JWT_SECRET || 's3cr3tK3y@12345^&*';

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // สร้าง JWT Token
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // ส่ง role กลับไปใน Response
        res.status(200).json({
            token,
            userId: user._id,
            username: user.email,
            role: user.role, // ต้องมี role
        });
    } catch (error) {
        console.error('Error in /login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});





module.exports = router;
