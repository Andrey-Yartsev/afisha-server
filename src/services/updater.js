const AfishaNnovUpdater = require('../lib/events/AfishaNnovUpdater');
const DvizhEventsUpdater = require("./src/lib/events/DvizhEventsUpdater");

module.exports = async (models) => {
  const afishaNnovUpdater = new AfishaNnovUpdater(models, {
    pages: 4,
    // useOnlyPage: 2,
    // useOnlyI: 4,
    // outputTextOnError: true
  });
  try {
    await afishaNnovUpdater.run();
  } catch (err) {
    console.log(err.toString());
    process.exit(0);
  }
  setInterval(() => {
    afishaNnovUpdater.run();
  }, 1000 * 60 * 10);

  setInterval(() => {
    const updater = new DvizhEventsUpdater(models);
    updater.run();
  }, 1000 * 60 * 60);

};
