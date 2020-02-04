const AfishaNnovParser = require('./AfishaNnovParser');
const hashCode = require('./hashCode');
const moment = require('moment');

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const momentFirstMin = moment => {
  return moment.add(1, "second"); // .utc();
};

const getDate = d => {
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

  s += moment().format('YYYY') + '-' +
    ('0' + d.month).slice(-2) + '-' + ('0' + d.day).slice(-2);
  if (d.time) {
    s += ' ' + d.time;
  }
  // console.log(s + "\n=========================");
  return momentFirstMin(moment(s)).toDate();
};

class EventsUpdater {
  constructor(name, models, parser, parseGroupOptions) {
    this.name = name;
    this.models = models;
    this.parser = parser;
    this.parseGroupOptions = parseGroupOptions || {};
  }
  async updateRecord(data) {
    if (!data.eventDt.result) {
      console.log(`No result in ${data.page}:${data.i}`, data);
      return;
    }
    if (data.eventDt.result.error) {
      console.log(`Ignore record ${data.page}:${data.i} - ` + data.eventDt.result.error);
      return;
    }
    if (data.eventDt.result === "error") {
      console.log(`Ignore record ${data.page}:${data.i} - error`);
      return;
    }

    const unic = data.text;
    const hash = hashCode(unic);

    if (data.eventDt.result.length) {
      data.eventDt = data.eventDt.result.map(v => getDate(v));
      // data.eventDt = [data.eventDt[0]];
    } else {
      data.eventDt = getDate(data.eventDt.result)
      if (!data.eventDt) {
        console.log("Ignore record no day", data);
        return;
      }
      data.eventDt = [data.eventDt];
    }

    // await models.Event.remove({});
    const exists = await this.models.Event.findOne({ hash });

    if (exists) {
      console.log("Record exists");
      return;
    }

    const r = await this.models.Event.updateOne(
      { hash: hash },
      {
        $set: {
          hash,
          text: data.text,
          eventDt: data.eventDt,
          dtUpdate: Date.now(),
          images: data.images
        }
      },
      { upsert: true }
    );
    if (r.ok) {
      console.log("Updating record success. " + (!r.upserted ? "Record exists" : "New record"));
    }
    // console.log(r);
  }
  async updatePosts(posts) {
    return posts.forEach(async (post, i) => {
      if (!post) {
        throw new Error("No post on index " + i);
      }
      await this.updateRecord(post);
    });
  }
  async run() {
    console.log(`Run ${this.name} updater`);
    let posts = await this.parser.parseGroupLong({...{
      pages: 1,
      // showDates: true,
      // useOnlyPage: 3
      // useOnlyI: 3
      // store: true,
      // fromStore: true
    }, ...this.parseGroupOptions});
    this.updatePosts(posts);
  }
}

module.exports = EventsUpdater;
