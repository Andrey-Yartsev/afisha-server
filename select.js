const db = require("./src/db/index");
const Updater = require("./src/lib/eventUpdater");
const moment = require('moment');

(async () => {
  process.on('unhandledRejection', (reason, p) => {
    console.error(reason)
    console.error(p)
  })

  const models = await db();

  const eventDt = '21.10';
  const today = moment(eventDt, 'DD.MM');
  const from = today.startOf('day').toDate();

  let criteria = {
    eventDt: {
      $elemMatch: {
        $gte: from
      }
    }
  }
  console.log(criteria);
  const r = await models.Event.find(criteria);
  console.log(r);

  process.exit(1);
})();
