const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: { type: String, required: true }, // ID หรือชื่อของผู้ใช้ที่ทำการจอง
  spaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true }, // อ้างอิงถึงพื้นที่ที่จอง
  date: { type: String, required: true }, // วันที่จอง
  time: { type: String, required: true }, // เวลาที่จอง
  createdAt: { type: Date, default: Date.now } // เวลาที่บันทึกการจอง
});

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;