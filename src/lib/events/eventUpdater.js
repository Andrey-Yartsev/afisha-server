const moment = require('moment');
const AfishaNnovParser = require('./AfishaNnovParser');
const hashCode = require('./hashCode');

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const momentFirstMin = (moment) => moment.add(1, 'second') // .utc();
;

const getDate = (d) => {
  if (moment.isMoment(d)) {
    d = momentFirstMin(d);

    return d.toDate();
  }

  if (!d.day) {
    return false;
  }
  if (!isNumeric(d.day)) {
    return false;
  }
  let s = '';

  s += `${moment().format('YYYY')}-${
    (`0${d.month}`).slice(-2)}-${(`0${d.day}`).slice(-2)}`;
  if (d.time) {
    s += ` ${d.time}`;
  }
  // console.log(s + "\n=========================");
  return momentFirstMin(moment(s)).toDate();
};

const updateRecord = async (data) => {
  if (!data.eventDt.result) {
    console.log(`No result in ${data.page}:${data.i}`, data);
    return;
  }
  if (data.eventDt.result.error) {
    console.log(`Ignore record ${data.page}:${data.i} - ${data.eventDt.result.error}`);
    return;
  }
  if (data.eventDt.result === 'error') {
    console.log(`Ignore record ${data.page}:${data.i} - error`);
    return;
  }

  const unic = data.text;
  const hash = hashCode(unic);

  if (data.eventDt.result.length) {
    data.eventDt = data.eventDt.result.map((v) => getDate(v));
    // data.eventDt = [data.eventDt[0]];
  } else {
    data.eventDt = getDate(data.eventDt.result);
    if (!data.eventDt) {
      console.log('Ignore record no day', data);
      return;
    }
    data.eventDt = [data.eventDt];
  }

  // await models.Event.remove({});
  const exists = await models.Event.findOne({ hash });

  if (exists) {
    console.log('Record exists');
    return;
  }

  const r = await models.Event.updateOne(
    { hash },
    {
      $set: {
        hash,
        text: data.text,
        eventDt: data.eventDt,
        dtUpdate: Date.now(),
        images: data.images,
      },
    },
    { upsert: true },
  );
  if (r.ok) {
    console.log(`Updating record success. ${!r.upserted ? 'Record exists' : 'New record'}`);
  }
  // console.log(r);
};

const afishaNnovParser = new AfishaNnovParser();

const updatePosts = async (posts) => posts.forEach(async (post, i) => {
  if (!post) {
    throw new Error(`No post on index ${i}`);
  }
  await updateRecord(post);
});

const run = async () => {
  const posts = await afishaNnovParser.parseGroupLong({
    pages: 1,
    // showDates: true,
    // useOnlyPage: 3
    // useOnlyI: 3
    // store: true,
    // fromStore: true
  });
};

let models;

module.exports = (_models) => {
  models = _models;
  return {
    run,
  };
};