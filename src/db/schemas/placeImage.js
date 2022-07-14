const mongoose = require('mongoose');

module.exports = mongoose.Schema({
  placeId: {
    type: Number,
    required: true
  },
  dtUpdate: {
    type: Date,
  }
});
