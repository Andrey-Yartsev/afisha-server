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
  source: {
    type: String,
    default: "",
  },
  userImages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EventUserImage' }],
  noPlace: {
    type: Boolean,
    default: false
  },
  vkUser: {
    type: Object,
    default: null
  }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

schema.virtual('userImagePaths').get(function() {
  return this.userImages.map(v => {
    return process.env.STATIC_PATH + "/upload/event/report/" + v._id + ".png";
  });
});



module.exports = schema;
