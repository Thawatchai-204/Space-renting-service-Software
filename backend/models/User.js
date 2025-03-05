const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String },
    role: { type: String, default: 'user' },
    walletBalance: { type: Number, default: 0 },
    profileImage: { type: String },
    idCardImage: { type: String },
    idCardStatus: { type: String, default: 'pending' },
    phone: { type: String },
    address: { type: String },
    facebook: { type: String },
    line: { type: String }
});

const User = mongoose.model('User', userSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { 
        type: String, 
        enum: ['deposit', 'withdrawal'], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'rejected'], // เพิ่ม 'rejected' ตามที่แนะนำก่อนหน้านี้
        default: 'pending' 
    },
    paymentProof: { type: String },
    rejectReason: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Export หลังจากกำหนดทั้งสอง model
module.exports = { User, Transaction };