const moment = require('moment');

module.exports = {
  fetch: async (request) => {
    const eventDt = request.params.date;
    let criteria = {};
    if (eventDt) {
      const today = moment(eventDt, 'DD.MM');
      const from = today.startOf('day')
        .toDate();
      const to = today.endOf('day')
        .toDate();

      criteria = {
        eventDt: {
          $elemMatch: {
            $gte: from,
            $lt: to,
          },
        },
      };
      // console.log(criteria);
    }
    const r = await request.db.Event.find(criteria);
    return r;
  },
  fetchLastUpdated: async (request) => {
    let events = await request.db.Event.find()
      .sort({ dtUpdate: -1 })
      .populate(['userImages'])
      .limit(5);
    events = events.map(event => {
      event = event.toObject();
      event.userImagePaths = event.userImages.map(image => {
        return "/upload/" + image._id + ".png";
      });
      return event;
    });
    return events;
  },
  exists: async (request) => {
    const { month } = request.params;
    const dt = moment(month, 'M');
    const from = dt.clone()
      .subtract(2, 'month')
      .startOf('month')
      .toDate();
    const to = dt.clone()
      .add(1, 'month')
      .endOf('month')
      .toDate();
    const criteria = {
      eventDt: {
        $elemMatch: {
          $gte: from,
          $lt: to,
        },
      },
    };
    const result = await request.db.Event.find(criteria, { eventDt: true });
    const days = [];

    result.forEach((r) => {
      r.eventDt.forEach((date) => {
        const mDate = moment(date)
          .utcOffset('+03:00');
        const day = mDate.format('DD.MM');
        if (days.indexOf(day) === -1) {
          days.push(day);
        }
      });
    });

    return days;
  },
};
