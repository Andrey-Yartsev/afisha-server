const EventsUpdater = require('./EventsUpdater');
const BorzostParser = require('./BorzostParser');

class BorzostUpdater extends EventsUpdater {
  constructor(models) {
    super('borzost', models, new BorzostParser());
  }
}

module.exports = BorzostUpdater;
