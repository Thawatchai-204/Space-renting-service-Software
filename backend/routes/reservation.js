const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

// API สำหรับสร้างการจอง
router.post('/reserve', async (req, res) => {
    const { user, spaceId, date, time } = req.body;

    // ตรวจสอบว่ามีการจองพื้นที่ในช่วงวันเวลานี้แล้วหรือไม่
    const existingReservation = await Reservation.findOne({ spaceId, date, time });
    if (existingReservation) {
        return res.status(400).json({ success: false, message: 'This space is already reserved for this time.' });
    }

    // สร้างการจองใหม่
    const newReservation = new Reservation({
        user,
        spaceId,
        date,
        time
    });

    try {
        await newReservation.save();
        res.json({ success: true, message: 'Reservation successful!', reservation: newReservation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving reservation', error });
    }
});

module.exports = router;