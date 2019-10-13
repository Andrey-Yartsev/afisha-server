const mongoose = require('mongoose')
const objectId = mongoose.Schema.Types.ObjectId

module.exports = mongoose.Schema({
  hash: {
    type: String,
    required: true
  },
  dtUpdate: {
    type: Date,
    default: Date.now
  },
  author: {
    type: String
  },
  text: {
    type: String
  },
  eventDt: {
    type: Array,
    default: []
  },
  eventTime: {
    type: Array,
    default: []
  },
  // image
})
