const EventsUpdater = require('./EventsUpdater');
const AfishaNnovParser = require('../parser/export/AfishaNnovParser');

class AfishaNnovUpdater extends EventsUpdater {
  constructor(models, parseGroupOptions) {
    super('afisha_nnov', models, new AfishaNnovParser(), parseGroupOptions);
  }
}

module.exports = AfishaNnovUpdater;
