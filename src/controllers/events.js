const moment = require('moment');

module.exports = {
  fetch: async (request) => {
    const eventDt = request.params.date;
    let criteria = {};
    if (eventDt) {
      const today = moment(eventDt, 'DD.MM');
      const from = today.startOf('day').toDate();
      const to = today.endOf('day').toDate();

      criteria = {
        eventDt: {
          $elemMatch: {
            $gte: from,
            $lt: to
          },
        },
      };
      // criteria = {
      //   _id: "5da310797fb9a5f3710dc9e1",
      //   eventDt: {$elemMatch: {$gte: new Date("2019-10-13T20:00:00.000Z")}}
      // }
      console.log(criteria);
    }
    const r = await request.db.Event.find(criteria);
    //console.log(r[0].eventDt);
    return r;
  }
};
