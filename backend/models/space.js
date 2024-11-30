const mongoose = require('mongoose');

// Space schema definition
const spaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  advertisingWords: { type: String, required: true },
  address: { type: String, required: true },
  types: { type: String, required: true },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

// ตรวจสอบว่ามีโมเดล Space อยู่แล้วหรือยัง
module.exports = mongoose.models.Space || mongoose.model('Space', spaceSchema);
