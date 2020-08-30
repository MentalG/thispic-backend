const mongoose = require('mongoose');

const ImageSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dominant: {
    type: String,
    required: true,
  },
  secondary: {
    type: Array,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Images', ImageSchema);
