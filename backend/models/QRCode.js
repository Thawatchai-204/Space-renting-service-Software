const mongoose = require('mongoose');

const QRCodeSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QRCode', QRCodeSchema);
