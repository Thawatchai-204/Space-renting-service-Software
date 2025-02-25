const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Secret key สำหรับ JWT
const JWT_SECRET = process.env.JWT_SECRET || 's3cr3tK3y@12345^&*';

//API ดึงประวัติธุรกรรมทั้งหมด
router.get('/wallet/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ balance: user.balance, transactions: user.transactions });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

//API สำหรับ Top-up เงิน
router.put('/wallet/:userId', async (req, res) => {
    const { amount } = req.body;
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.balance += amount;
        user.transactions.push({
            type: 'Top-up',
            amount,
            description: `Top-up ${amount} THB`
        });

        await user.save();
        res.json({ balance: user.balance, transactions: user.transactions });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

//API บันทึกธุรกรรมการจอง
router.post('/wallet/booking/:userId', async (req, res) => {
    const { spaceName, price } = req.body;
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.balance < price) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        user.balance -= price;
        user.transactions.push({
            type: 'Booking',
            amount: price,
            description: `Booked ${spaceName} for ${price} THB`
        });

        await user.save();
        res.json({ balance: user.balance, transactions: user.transactions });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


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
