const moment = require('moment');
const handleFileUpload = require('../../lib/handleFileUpload');
const fs = require('fs');

module.exports = {
  create: async (request, h) => {
    let events = await request.db.Event.find({
      '$expr': {
        '$and': [
          { '$eq': ['$name', 'development'] },
          { '$gte': [{ '$size': '$followers' }, 100] }
        ]
      }
    })
      .sort({ dtUpdate: -1 });
    events = events.map((v) => {
      console.log(v.eventDt, v.eventDt.toString()); // write test
      v.eventDt = moment(v.eventDt.toString())
        .format('DD.MM');
      v._dtUpdate = moment(v.dtUpdate)
        .format('DD.MM H:mm');
      // v._dtUpdate = v.dtUpdate;
      return v;
    });
    return h.view('admin/events', { events });
  },
  remove: async (request, h) => {
    await request.db.Event.remove({ _id: request.params.id });
  },
  upload: async (request, h) => {
    const event = await request.db.Event.findOne({ _id: request.params.id });
    const data = request.payload;
    let path;
    if (data.file) {
      path = data.file.path;
    } else if (data.path) {
      path = data.path;
    } else {
      throw new Error('Upload error. data: ' + JSON.stringify(data));
    }
    const record = await request.db.EventUserImage.create({
      event: request.params.id
    });
    event.userImages.push(record._id);
    await event.save();
    const name = record._id + '.png';
    const newPath = global.appRoot + '/upload/' + name;
    fs.renameSync(path, newPath);
    return {
      name
    };
  }
};
