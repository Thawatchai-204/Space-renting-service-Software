const express = require('express');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// ตรวจสอบและสร้างโฟลเดอร์อัปโหลด
const uploadDir = path.join(__dirname, '../uploads/proofs/');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ตั้งค่า Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ 5MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extName && mimeType) return cb(null, true);
        else return cb(new Error('Only .png, .jpg, and .jpeg formats are allowed!'));
    },
});

// ✅ แสดงยอดเงินในกระเป๋า
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.status(200).json({ success: true, balance: user.walletBalance });
    } catch (err) {
        console.error('Error fetching wallet balance:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ✅ เติมเงินเข้ากระเป๋า
router.put('/topup/:userId', async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.walletBalance += amount;
        await user.save();
        res.status(200).json({ success: true, balance: user.walletBalance });
    } catch (err) {
        console.error('Error topping up wallet:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ✅ หักเงินจากกระเป๋า
router.put('/deduct/:userId', async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.walletBalance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        user.walletBalance -= amount;
        await user.save();
        res.status(200).json({ success: true, balance: user.walletBalance });
    } catch (err) {
        console.error('Error deducting wallet balance:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ✅ อัปโหลดหลักฐานการโอน
router.post('/topup', upload.single('proof'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded or invalid file format.' });
        }

        const { userId, amount } = req.body;
        const proofFilename = req.file.filename;

        let wallet = await Wallet.findOne({ userId });
        if (!wallet) wallet = new Wallet({ userId, balance: 0 });

        wallet.balance += parseFloat(amount);
        await wallet.save();

        const transaction = new Transaction({
            userId,
            type: 'topup',
            amount: parseFloat(amount),
            proof: proofFilename,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
        });
        await transaction.save();

        res.status(200).json({ success: true, balance: wallet.balance });
    } catch (error) {
        console.error('Error processing top-up:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to process top-up' });
    }
});


router.post('/upload-proof', upload.single('proof'), async (req, res) => {
  try {
      const { userId, amount } = req.body;
      const proofPath = `/uploads/proofs/${req.file.filename}`;

      await Transaction.create({
          userId,
          amount,
          proof: proofPath,
          type: 'top-up',
          date: new Date(),
      });

      const wallet = await Wallet.findOne({ userId });
      if (wallet) {
          wallet.balance += parseFloat(amount);
          await wallet.save();
      }

      res.status(200).json({ message: 'Proof uploaded successfully', proofPath });
  } catch (error) {
      console.error('Error uploading proof:', error);
      res.status(500).json({ message: 'Error uploading proof' });
  }
});


module.exports = router;
