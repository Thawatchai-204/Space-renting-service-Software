const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Transaction } = require('../models/User'); // ใช้ User และ Transaction จากโมเดล
const authenticateUser = require('../middleware/authMiddleware'); // ใช้ middleware สำหรับ JWT
const router = express.Router();
const multer = require('multer');
const path = require('path');
const JWT_SECRET = process.env.JWT_SECRET || 's3cr3tK3y@12345^&*';

// กำหนด storage สำหรับ multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // บันทึกไฟล์ในโฟลเดอร์ uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์ใหม่เพื่อป้องกันการซ้ำกัน
    }
});

// สร้าง instance ของ multer
const upload = multer({ storage });

// ลงทะเบียนผู้ใช้ใหม่
router.post('/register', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('username').notEmpty().withMessage('Username is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, username } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hashedPassword,
            username,
            role: 'user' // กำหนด role เริ่มต้น
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
    } catch (error) {
        console.error('Error in /register:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// ล็อกอินผู้ใช้
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

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
        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            token,
            userId: user._id,
            username: user.username,
            role: user.role,
        });
    } catch (error) {
        console.error('Error in /login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// API ดึงข้อมูลประวัติธุรกรรมทั้งหมดของผู้ใช้
router.get('/wallet/:userId', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ balance: user.balance, transactions: user.transactions });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// API สำหรับ Top-up เงิน
router.put('/wallet/:userId', authenticateUser, [
    body('amount').isNumeric().withMessage('Amount must be a number and greater than 0')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { amount } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }

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

// API บันทึกธุรกรรมการจอง
router.post('/wallet/booking/:userId', authenticateUser, async (req, res) => {
    const { spaceName, price } = req.body;

    if (!spaceName || !price || price <= 0) {
        return res.status(400).json({ message: 'Invalid space name or price' });
    }

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

// API สำหรับอัปโหลดหลักฐานการเติมเงิน
router.post('/upload-proof', authenticateUser, upload.single('proofImage'), async (req, res) => {
    try {
        const userId = req.user.userId; // ใช้ userId จาก JWT Token
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // บันทึก URL ของไฟล์ลงใน MongoDB
        user.paymentProof = `/uploads/proofs/${req.file.filename}`;
        await user.save();

        res.json({ message: 'Proof uploaded successfully', proofUrl: user.paymentProof });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;