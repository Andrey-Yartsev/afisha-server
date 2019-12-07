const Updater = require("../lib/eventUpdater");

module.exports = async (models) => {
  const updater = Updater(models);

  updater.run();

  setInterval(() => {
    updater.run();
  }, 1000 * 60 * 10);

};
