const mongoose = require('mongoose');

module.exports = mongoose.Schema({
  eventHash: {
    type: String,
    required: true,
  },
  eventDt: {
    type: Date,
  },
});
