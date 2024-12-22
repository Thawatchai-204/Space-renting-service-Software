const mongoose = require('mongoose');

// User schema definition
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user', required: true }, // กำหนดค่าเริ่มต้นเป็น 'user'
  walletBalance: { type: Number, default: 0 }, // กระเป๋าเงินเริ่มต้นเป็น 0
});

// ตรวจสอบว่ามีโมเดล User อยู่แล้วหรือยัง
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
