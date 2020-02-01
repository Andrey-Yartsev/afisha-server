const VkEventsParser = require("./VkEventsParser");

class AfishaNnovParser extends VkEventsParser {
  constructor() {
    super({
      vkGroupName: "afisha_nnov",
      datePrefix: "Когда:"
    });
  }
}

module.exports = AfishaNnovParser;
