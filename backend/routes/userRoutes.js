const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Route to get wallet balance
router.get('/wallet/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send('User not found');
    res.json({ balance: user.walletBalance });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Route to update wallet balance
router.put('/wallet/:userId', async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send('User not found');

    // Update wallet balance
    user.walletBalance += amount;
    await user.save();
    res.json({ balance: user.walletBalance });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;

