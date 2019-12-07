const db = require("./src/db/index");
const updater = require("./src/services/updater");

process.on('unhandledRejection', (reason, p) => {
  console.error(reason)
  console.error(p)
});

(async () => {
  const models = await db();
  await updater(models);
})();
