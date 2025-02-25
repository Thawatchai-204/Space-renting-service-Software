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

const TransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['Top-up', 'Booking', 'Proof Upload'], required: true },
  amount: { type: Number, required: false }, // สำหรับ Top-up และ Booking
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  proofImage: { type: String, required: false } // สำหรับหลักฐานการโอนเงิน
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  balance: { type: Number, default: 0 },
  transactions: [TransactionSchema] // เก็บรายการธุรกรรม
});

const User = mongoose.model('User', UserSchema);
module.exports = User;