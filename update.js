const db = require("./src/db/index");
const Updater = require("./src/lib/eventUpdater");

(async () => {
  process.on('unhandledRejection', (reason, p) => {
    console.error(reason)
    console.error(p)
  })

  const models = await db();

  const updater = Updater(models);

  updater.run();

  setInterval(() => {
    updater.run();
  }, 1000 * 60 * 60);

})();
