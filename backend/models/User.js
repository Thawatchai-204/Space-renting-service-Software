const mongoose = require('mongoose');

// User schema definition
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    phone: String,
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    paymentProof: { type: String }, // เก็บ URL ของหลักฐานการเติมเงิน
    role: { type: String, required: true, default: 'user' }, // เพิ่มค่าเริ่มต้นสำหรับ role
    walletBalance: { type: Number, default: 0 },
    username: { type: String, required: true }, // เพิ่ม username
    transactions: [
        {
            date: { type: String, required: true },
            time: { type: String, required: true },
            description: { type: String, required: true },
            amount: { type: Number, required: true },
        },
    ],
});

// Transaction schema
const transactionSchema = new mongoose.Schema({
    type: { type: String, enum: ['Top-up', 'Booking', 'Proof Upload'], required: true },
    amount: { type: Number, required: false }, // สำหรับ Top-up และ Booking
    date: { type: Date, default: Date.now },
    description: { type: String, required: true },
    proofImage: { type: String, required: false } // สำหรับหลักฐานการโอนเงิน
});

// ตรวจสอบว่ามีโมเดล User และ Transaction อยู่แล้วหรือยัง
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

module.exports = { User, Transaction };