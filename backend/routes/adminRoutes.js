const express = require('express');
const multer = require('multer');
const path = require('path');
const QRCode = require('../models/QRCode');

const router = express.Router();

// ตั้งค่า multer สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `qr-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// 📌 API สำหรับอัปโหลด QR Code
router.post('/upload-qr', upload.single('qrCode'), async (req, res) => {
    try {
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        await QRCode.deleteMany(); // ลบ QR Code เก่าออกก่อน
        const newQRCode = new QRCode({ imageUrl });
        await newQRCode.save();
        res.json({ success: true, imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to upload QR Code' });
    }
});

// 📌 API ดึง QR Code ล่าสุด
router.get('/latest-qr', async (req, res) => {
    try {
        const qrCode = await QRCode.findOne().sort({ uploadedAt: -1 });
        if (qrCode) {
            res.json({ success: true, imageUrl: qrCode.imageUrl });
        } else {
            res.json({ success: false, message: 'No QR Code found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch QR Code' });
    }
});

module.exports = router;
