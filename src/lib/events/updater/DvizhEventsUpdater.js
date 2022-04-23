const parser = require('../parser/export/VkDvizhParser');
const hashCode = require('../utils/hashCode');

class DvizhEventsUpdater {
  constructor(models) {
    this.models = models;
    this.parser = new parser();
  }
  async updateRecord(data, i) {
    const unic = data.text + JSON.stringify(data.eventDt);
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
          source: 'tago'
        },
      },
      { upsert: true },
    );
    console.log(`${i}) Updating dvizh-record success`);
  }
  async run() {
    console.log('Running parser TagoMago');
    const records = await this.parser.getData();
    for (let record of records) {
      await this.updateRecord(record, 666);
    }
  }
}
module.exports = DvizhEventsUpdater;
