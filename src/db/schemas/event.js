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
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

schema.virtual('userImagePaths').get(function() {
  return this.userImages.map(v => {
    return process.env + "/upload/" + v._id + ".png";
  });
});

module.exports = schema;
