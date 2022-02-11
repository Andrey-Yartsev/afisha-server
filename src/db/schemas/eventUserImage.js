const mongoose = require('mongoose');

module.exports = mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  title: {
    type: String
  }
});
