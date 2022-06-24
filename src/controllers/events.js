const moment = require('moment');

module.exports = (app) => {
  app.get('/api/event/:id', async function (req, res) {
    let event = await app.db.Event.findOne({
      _id: req.params.id
    });
    res.send(event);
  });
  app.get('/api/events/last-updated', async function (req, res) {
    const events = await app.db.Event.find()
      .sort({ dtUpdate: -1 })
      .limit(5);
    res.send(events);
  });
  app.get('/api/events/exists/:month', async function (req, res) {
    const { month } = req.params;
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
    const result = await app.db.Event.find(criteria, { eventDt: true });
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
    res.send(days);
  })
  app.get('/api/events/:date?', async function (req, res) {
    const eventDt = req.params.date;
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
    }
    const events = await app.db.Event.find(criteria);
    res.send(events);
  });
  app.get('/api/events/search/:word?', async function (req, res) {
    const word = req.params.word;
    const criteria = { $text: { $search: word } };
    const events = await app.db.Event.find(criteria)
      .sort({ eventDt: -1 })
      .limit(100);
    res.send(events);
  });
};
