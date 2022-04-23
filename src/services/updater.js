const AfishaNnovUpdater = require('../lib/events/updater/AfishaNnovUpdater');
const DvizhEventsUpdater = require("../lib/events/updater/DvizhEventsUpdater");
const EventsUpdater = require("../lib/events/updater/EventsUpdater");

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

  //
  // new EventsUpdater('nenavist_club', models, new VkEventsParser({
  //   vkGroupName: 'nenavist_club'
  // }));


};
