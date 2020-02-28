const VkEventsParser = require('./VkEventsParser');

class BorzostParser extends VkEventsParser {
  constructor() {
    super({
      vkGroupName: 'borzostlab',
      datePrefix: 'Старт:',
    });
  }

  stripText(text) {
    text = super.stripText(text);
    text = text.replace(/Завтра,?\s?/, '');
    console.log(text);
    return text;
  }
}

module.exports = BorzostParser;
