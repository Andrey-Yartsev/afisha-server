const moment = require('moment');

module.exports = {
  create: async (request, h) => {
    let events = await request.db.Event.find({}).sort({ dtUpdate: -1 });
    events = events.map((v) => {
      console.log(v.eventDt, v.eventDt.toString()); // write test
      v.eventDt = moment(v.eventDt.toString()).format('DD.MM');
      v._dtUpdate = moment(v.dtUpdate).format('DD.MM H:mm');
      // v._dtUpdate = v.dtUpdate;
      return v;
    });
    return h.view('admin/events', { events });
  },
  remove: async (request, h) => {
    await request.db.Event.remove({ _id: request.params.id });
  }
};
