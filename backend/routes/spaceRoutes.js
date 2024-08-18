const express = require('express');
const Space = require('./models/space'); 


const router = express.Router();

router.get('/spaces', async (req, res) => {
  try {
    const spaces = await Space.find();
    res.json(spaces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
