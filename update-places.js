const db = require("./src/db/index");
const Parser = require("./src/lib/events/parser/places/AfishaPlaceParser");

process.on('unhandledRejection', (reason, p) => {
  console.error(reason);
  console.error(p);
});

(async () => {
  const models = await db();
  const options = {};
  if (process.argv[2] && process.argv[2] === 'clean') {
    options.clean = true;
  }
  const parser = new Parser(models, options);
  await parser.parse();
  process.exit(0);
})();
