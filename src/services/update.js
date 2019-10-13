const afishaNn = require('../lib/afisha-nn');
const hashCode = require('../lib/hashCode');
const moment = require('moment');
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const getDate = d => {
  if (moment.isMoment(d)) {
    return d.toDate();
  }

  if (!d.day) {
    return false;
  }
  if (!isNumeric(d.day)) {
    return false;
  }
  let s = '';

  s += moment().format('YYYY') + '-' +
    ('0' + d.month).slice(-2) + '-' + ('0' + d.day).slice(-2);
  if (d.time) {
    s += ' ' + d.time;
  }

  return moment(s).toDate();
};

module.exports = async (server) => {
  const db = server.db;

  const updateRecord = async (data) => {
    if (data.eventDt.result.error) {
      console.log("Ignore record event date error");
      return;
    }

    const unic = data.text;
    const hash = hashCode(unic);

    if (data.eventDt.result.length) {
      data.eventDt = data.eventDt.result.map(v => getDate(v));
    } else {
      data.eventDt = getDate(data.eventDt.result)
      if (!data.eventDt) {
        console.log("Ignore record no day", data);
        return;
      }
    }

    const r = await db.Event.updateOne(
      { hash: hash },
      {
        $set: {
          hash,
          text: data.text,
          eventDt: [data.eventDt]
        }
      },
      { upsert: true }
    );
    // const r2 = await db.EventDate.updateOne(
    //   { eventHash: hash },
    //   {
    //     $set: {
    //       eventHash: hash,
    //       eventDt: data.eventDt
    //     }
    //   },
    //   { upsert: true }
    // );

    console.log(r);
  };

  const run = async () => {
    console.log('Parsing wall...');
    const posts = await afishaNn.parseGroup({ fromStore: true });
    // await updateRecord(posts[1]);
    posts.forEach(async post => {

      await updateRecord(post);
    })
  };

  setTimeout(async () => {
    await run();
  }, 1000);
};
