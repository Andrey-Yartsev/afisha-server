const mongoose = require('mongoose');

const schema = mongoose.Schema({
  hash: {
    type: String
  },
  dtUpdate: {
    type: Date,
  },
  author: {
    type: String,
  },
  text: {
    type: String,
  },
  eventDt: {
    type: Array,
    default: [],
  },
  eventTime: {
    type: Array,
    default: [],
  },
  images: {
    type: Array,
    default: [],
  },
  userImages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EventUserImage' }],
});

// schema.virtual('ddd').get(function() {
//   return "sss";
//   return this.userImages.forEach(v => {
//     return "upload/" + v._id + ".png";
//   });
// });

module.exports = schema;
