const Updater = require("./src/lib/events/DvizhEventsUpdater");
const db = require("./src/db/index");

process.on('unhandledRejection', (reason, p) => {
  console.error(reason);
  console.error(p);
});

(async () => {
  const models = await db();
  const updater = new Updater(models);
  await updater.run();
})();
