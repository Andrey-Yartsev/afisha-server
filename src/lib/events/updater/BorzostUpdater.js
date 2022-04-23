const EventsUpdater = require('./EventsUpdater');
const BorzostParser = require('../parser/export/BorzostParser');

class BorzostUpdater extends EventsUpdater {
  constructor(models) {
    super('borzost', models, new BorzostParser());
  }
}

module.exports = BorzostUpdater;
