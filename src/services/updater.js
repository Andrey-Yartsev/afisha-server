const AfishaNnovUpdater = require('../lib/events/AfishaNnovUpdater');
const DvizhEventsUpdater = require("../lib/events/DvizhEventsUpdater");

module.exports = async (models) => {
  const afishaNnovUpdater = new AfishaNnovUpdater(models, {
    pages: 4,
    // useOnlyPage: 2,
    // useOnlyI: 4,
    // outputTextOnError: true
  });
  afishaNnovUpdater.run();
  setInterval(() => {
     afishaNnovUpdater.run();
  }, 1000 * 60 * 10);

  const dvizhUpdater = new DvizhEventsUpdater(models);
  dvizhUpdater.run();
  setInterval(() => {
    dvizhUpdater.run();
  }, 1000 * 60 * 60);
};
