const mongoose = require('mongoose');

// Booking schema definition
const bookingSchema = new mongoose.Schema({
  spaceId: String,
  userId: String,
  date: String,
  time: String,
});

// ตรวจสอบว่ามีโมเดล Booking อยู่แล้วหรือยัง
module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
