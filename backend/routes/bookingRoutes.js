// bookingRoutes.js

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Space = require('../models/Space');
const authMiddleware = require('../middleware/authMiddleware');

// Create booking
router.post('/', authMiddleware, async (req, res) => {
    const { spaceId, startDate, endDate } = req.body;
    const userId = req.user.id; // ดึง ID ผู้ใช้จาก token

    try {
        const space = await Space.findById(spaceId);
        if (!space) {
            return res.status(404).json({ message: 'Space not found' });
        }

        const newBooking = new Booking({
            user: userId,
            space: spaceId,
            startDate,
            endDate,
            price: space.price
        });

        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking', error });
    }
});

module.exports = router;
