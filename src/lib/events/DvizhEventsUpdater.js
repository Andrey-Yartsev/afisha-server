const parser = require('./VkDvizhParser');
const hashCode = require('./hashCode');

class DvizhEventsUpdater {
  constructor(models) {
    this.models = models;
    this.parser = new parser();
  }
  async updateRecord(data, i) {
    const unic = data.text;
    const hash = hashCode(unic);
    const exists = await this.models.Event.findOne({ hash });
    if (exists) {
      console.log(`Record ${hash} exists`);
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
        },
      },
      { upsert: true },
    );
    console.log(`${data.page}:${data.i}) Updating record success. ${!r.upserted ? 'Record exists' : 'New record'}`);
  }
  async run() {
    const records = await this.parser.getData();
    for (let record of records) {
      await this.updateRecord(record, 666);
    }
  }
}
module.exports = DvizhEventsUpdater;
