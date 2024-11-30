const mongoose = require('mongoose');

// User schema definition
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  walletBalance: { type: Number, default: 0 }, // เพิ่มฟิลด์ walletBalance
});

// ตรวจสอบว่ามีโมเดล User อยู่แล้วหรือยัง
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
