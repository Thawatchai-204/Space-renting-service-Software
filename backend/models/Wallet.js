// models/Wallet.js
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
});

module.exports = mongoose.model('Wallet', walletSchema);

// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: { type: String, required: true }, // เช่น 'topup', 'payment'
    amount: { type: Number, required: true },
    proof: { type: String }, // ที่อยู่ของไฟล์สลิป
    date: { type: String }, // วันที่ทำรายการ
    time: { type: String }, // เวลาทำรายการ
});

module.exports = mongoose.model('Transaction', transactionSchema);