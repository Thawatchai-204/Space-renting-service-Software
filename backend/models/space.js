// File: models/space.js

const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
});

const Space = mongoose.model('Space', spaceSchema);

module.exports = Space;
