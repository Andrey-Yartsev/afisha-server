const request = require('request');
const parser = require('node-html-parser');
const fs = require('fs');
const { parseDayMonth } = require('./parseMonth');


class VkDvizhParser {
  constructor() {
  }
  fetchText(url) {
    const config = {
      url,
      encoding: null,
      method: 'GET'
    };
    return new Promise((accept) => {
      request(config, (err, response, body) => {
        if (body === undefined) {
          throw new Error('No internet connection for ' + url);
        }
        accept(body.toString());
      });
    });
  }
  async fetchTextDvizh() {
    return await this.fetchText('https://dvizh.app/api/frame/schedule/actual?vk_access_token_settings=&vk_app_id=6819359&vk_are_notifications_enabled=0&vk_group_id=203940015&vk_is_app_user=0&vk_is_favorite=0&vk_language=ru&vk_platform=desktop_web&vk_ref=group&vk_ts=1646820706&vk_user_id=2288363&vk_viewer_group_role=member&sign=VvUAuDkBn8zPjoLHuLA-8INaOuJUcSWWKhJr-MJ5qlo');
  }
  async parseGroupPageDate(link) {
    const html = await this.fetchText(link);
    const root = parser.parse(html);
    let cont = root.querySelectorAll('.profile_info');
    let date = '';
    const infoRows = cont[0].querySelectorAll('.pinfo_row');

    infoRows.forEach(row => {
      if (row.innerHTML.match(/Начало:/)) {
        // console.log(row.innerHTML);
        // console.log("\n\n");
        let value = row.querySelectorAll('dd');
        date = this.parseDateTime(value[0].innerText);
      }
    });
    return date;
  }
  parseDateTime(s) {
    const p = s.match(/(.*) в (.*)/);
    if (p) {
      const result = parseDayMonth(p[1]);
      if (!result) {
        throw new Error('Date parse error');
      }
      result.format = 'day month в hh:mm'
      result.time = p[2];
      return {
        init: s,
        result
      }
    }
    throw new Error('Error date parse');
  }
  async getData() {
    console.log('Getting data from TagoMago');
    let data = await this.fetchTextDvizh();
    data = JSON.parse(data);
    let events = data.data;

    // events = [events[4]]; // for debug errors

    const records = [];
    let i = -1;
    for (let event of events) {
      i++;
      let record = {};
      try {
        record.eventDt = await this.parseGroupPageDate(event.buttons[0].link);
      } catch (err) {
        console.log(err.message + ' on Index ' + i + ', title: ' + event.title);
        continue;
      }
      if (!record.eventDt) {
        continue;
      }
      if (event.image) {
        record.images = [event.image];
      }
      record.text = `<b>${event.title}</b><br><br>`;
      if (event.description) {
        record.text += event.description.replace(/\n/g, '<br>');
      }
      records.push(record);
    }
    return records;
  }
}

module.exports = VkDvizhParser;
