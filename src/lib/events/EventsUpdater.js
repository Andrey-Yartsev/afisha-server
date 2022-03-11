const hashCode = require('./hashCode');
const { getDate } = require('./dateUpdateFormat');

class EventsUpdater {
  constructor(name, models, parser, parseGroupOptions) {
    this.name = name;
    this.models = models;
    this.parser = parser;
    this.parseGroupOptions = parseGroupOptions || {};
  }

  async updateRecord(data) {
    if (!data.eventDt.result) {
      console.log(`${data.page}:${data.i}) No result`, data);
      return;
    }
    if (data.eventDt.result.error) {
      console.log(`${data.page}:${data.i}) Ignore record - ${data.eventDt.result.error}; ` +
        (data.eventDt.result.format ? `used format: ${data.eventDt.result.format}` : ''));
      if (this.parseGroupOptions.outputTextOnError) {
        console.log("\n" + data.text);
      }
      return;
    }
    if (data.eventDt.result === 'error') {
      console.log(`${data.page}:${data.i}) Ignore record ${data.page}:${data.i}`);
      return;
    }

    const unic = data.text;
    const hash = hashCode(unic);

    if (data.eventDt.result.length) {
      data.eventDt = data.eventDt.result.map((v) => getDate(v));
    } else {
      data.eventDt = getDate(data.eventDt.result);
      if (!data.eventDt) {
        console.log(`${data.page}:${data.i}) Ignore record no day` +
          (data ? JSON.stringify(data) : 'NO DATA'));
        return;
      }
      data.eventDt = [data.eventDt];
    }

    const exists = await this.models.Event.findOne({ hash });
    if (exists) {
      console.log(`${data.page}:${data.i}) Record exists`);
      return;
    }

    const r = await this.models.Event.updateOne(
      { hash },
      {
        $set: {
          hash,
          text: data.text,
          eventDt: data.eventDt,
          dtUpdate: Date.now(),
          images: data.images,
          source: 'afisha-nnov'
        },
      },
      { upsert: true },
    );
    if (r.ok) {
      console.log(`${data.page}:${data.i}) Updating record success. ${!r.upserted ? 'Record exists' : 'New record'}`);
    }
  }

  async updatePosts(posts) {
    return posts.forEach(async (post, i) => {
      if (!post) {
        throw new Error(`No post on index ${i}`);
      }
      await this.updateRecord(post);
    });
  }

  async run() {
    console.log(`Run ${this.name} updater`);
    const posts = await this.parser.parseGroupLong({
      ...{
        pages: 1,
      // showDates: true,
      // useOnlyPage: 3,
      // useOnlyI: 1
      // store: true,
      // fromStore: true
      },
      ...this.parseGroupOptions,
    });
    // FOR DEBUG
    // posts.forEach(post => {
    //   console.log(`${post.page}.${post.i}) ${post.text}\n---------\n`);
    // });
    this.updatePosts(posts);
  }
}

module.exports = EventsUpdater;
