const mongoose = require('mongoose');

module.exports = mongoose.Schema({
  vkId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  displayName: {
    type: String
  }
});
