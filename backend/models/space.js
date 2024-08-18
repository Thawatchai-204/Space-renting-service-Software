const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema({
  name: String,
  advertisingWords: String,
  address: String,
  types: String,
  size: String,
  price: String,
  image: String 
}, { collection: 'spaces' });

const Space = mongoose.model('Space', spaceSchema);

module.exports = Space;
