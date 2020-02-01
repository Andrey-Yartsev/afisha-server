const AfishaNnovUpdater = require("../lib/AfishaNnovUpdater");
const BorzostUpdater = require("../lib/BorzostUpdater");

module.exports = async (models) => {
  const afishaNnovUpdater = new AfishaNnovUpdater(models);
  await afishaNnovUpdater.run();
  setInterval(afishaNnovUpdater.run, 1000 * 60 * 10);

  const borzostUpdater = new BorzostUpdater(models);
  await borzostUpdater.run();
  setInterval(borzostUpdater.run, 1000 * 60 * 60 * 3);
};
