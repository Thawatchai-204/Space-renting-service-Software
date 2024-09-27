// backend/models/Space.js
const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  advertisingWords: { type: String },
  address: { type: String, required: true },
  types: { type: String },
  size: { type: String },
  price: { type: Number, required: true },
  image: { type: String }, // สำหรับเก็บพาธของรูปภาพที่อัพโหลด
});

const Space = mongoose.model('Space', spaceSchema);

module.exports = Space;
