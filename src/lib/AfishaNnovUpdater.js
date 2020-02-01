const EventsUpdater = require("./EventsUpdater");
const AfishaNnovParser = require("./AfishaNnovParser");

class AfishaNnovUpdater extends EventsUpdater {
  constructor(models) {
    super("afisha_nnov", models, new AfishaNnovParser);
  }
}

module.exports = AfishaNnovUpdater;
