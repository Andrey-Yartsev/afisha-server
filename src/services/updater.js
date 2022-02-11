const AfishaNnovUpdater = require('../lib/events/AfishaNnovUpdater');
// const BorzostUpdater = require('../lib/events/BorzostUpdater');
const moment = require('moment');
module.exports = async (models) => {
  //console.log(moment("30 января", "DD.MM.YY").toString());
  // console.log(moment("25 января", "DD.MM.YY").toString());
  // return;
  const afishaNnovUpdater = new AfishaNnovUpdater(models, {
    pages: 1,
    // useOnlyPage: 5,
    // useOnlyI: 5
  });
  try {
    await afishaNnovUpdater.run();
  } catch (err) {
    console.log(err.toString());
    process.exit(0);
  }
  return null;
  // setInterval(() => {
  //   afishaNnovUpdater.run();
  // }, 1000 * 60 * 10);

  // const borzostUpdater = new BorzostUpdater(models);
  // await borzostUpdater.run();
  // setInterval(() => {
  //   borzostUpdater.run();
  // }, 1000 * 60 * 60 * 3);
};
