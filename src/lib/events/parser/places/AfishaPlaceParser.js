const places = require('./places');
const limit = 10;

class AfishaPlaceParser {
  constructor(models, options) {
    this.models = models;
    this.options = options || {};
  }
  decode(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    for (const [k, v] of Object.entries(map)) {
      text = text.replace(new RegExp(v, 'g'), k);
    }
    // console.log(text);
    return text;
  }
  async parse() {
    const events = await this.models.Event.find({
      noPlace: { $ne: true }
    }).sort({_id: -1}).limit(limit);
    events.forEach(event => {
      this.findPlace(event);
    });
  }
  cutTill(title, word) {
    let cut = title;
    while (true) {
      let m = cut.match(new RegExp(`(.*)?(${word})`));
      if (m) {
        cut = m[1];
      } else {
        break;
      }
    }
    return cut;
  }
  async findPlace(event) {
    const text = event.text;
    let m = text.match(/Где:(.+)<br/i);
    if (m) {
      let title = m[1].replace(/<[^>]*>?/gm, '');
      title = this.decode(title).trim();
      title = this.cutTill(title, '<br');
      const found = this.findExistingPlace(title);
      if (found) {
        // console.log(title + "\n" + found);
      } else {
        console.log(title + "\nnot found");
        if (this.options.clean) {
          await this.markAsNoPlace(event._id);
        }
      }
    }
  }
  findExistingPlace(text) {
    const placeNames = places.map(v => v.name);
    for (let name of placeNames) {
      if (text.match(RegExp(name, 'i'))) {
        return name;
      }
    }
    return false;
  }
  async markAsNoPlace(_id) {
    await this.models.Event.updateOne({ _id }, { noPlace: true });
    console.log('updated');
  }
}

module.exports = AfishaPlaceParser;
