const AfishaNnovUpdater = require('../lib/events/AfishaNnovUpdater');
// const BorzostUpdater = require('../lib/events/BorzostUpdater');
const moment = require('moment');
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

  // const borzostUpdater = new BorzostUpdater(models);
  // await borzostUpdater.run();
  // setInterval(() => {
  //   borzostUpdater.run();
  // }, 1000 * 60 * 60 * 3);
};
