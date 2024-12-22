const express = require('express');
const User = require('../models/User'); // เรียกใช้โมเดล User
const router = express.Router();

// แสดงยอดเงินในกระเป๋า
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, balance: user.walletBalance });
  } catch (err) {
    console.error('Error fetching wallet balance:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// เติมเงินเข้ากระเป๋า
router.put('/topup/:userId', async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.walletBalance += amount; // เพิ่มเงิน
    await user.save();
    res.status(200).json({ success: true, balance: user.walletBalance });
  } catch (err) {
    console.error('Error topping up wallet:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// หักเงินจากกระเป๋า
router.put('/deduct/:userId', async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    user.walletBalance -= amount; // หักเงิน
    await user.save();
    res.status(200).json({ success: true, balance: user.walletBalance });
  } catch (err) {
    console.error('Error deducting wallet balance:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
