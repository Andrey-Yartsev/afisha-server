const request = require('request');
const iconv = require('iconv-lite');
const parser = require('node-html-parser');
const fs = require('fs');
const moment = require('moment');

const path = require('path');

const appRoot = path.dirname(path.dirname(path.resolve(__dirname)));

const debugTime = (text) => {
  // console.log(text);
};

// https://m.vk.com/afisha_nnov?offset=15&own=1

const months = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const getMonthN = (month) => {
  month = month.toLowerCase();
  if (months.indexOf(month) === -1) {
    throw new Error('Wrong month input: ' + month);
  }
  return months.indexOf(month) + 1;
};

class VkEventsParser {
  constructor({
    vkGroupName,
    datePrefix
  }) {
    this.vkGroupName = vkGroupName;
    this.datePrefix = datePrefix;
  }

  fetchText({
    path,
    method,
    form
  }) {
    const config = {
      url: `https://m.vk.com/${path}`,
      encoding: null,
      method: method || 'GET',
      form,
    };

    // console.log({
    //   path,
    //   form
    // });

    return new Promise((accept) => {
      request(config, (err, response, body) => {
        // const c = iconv.encode(iconv.decode(body, 'cp1251'), 'utf8').toString();
        accept(body.toString());
      });
    });
  }

  parseDayTime(p) {
    let [, day, time] = [...p];

    time = this.parseTime(time);
    day = this.parseDay(day);

    return {
      day,
      time
    };
  }

  parseDayMonthTime(p) {
    const [, day, month, time] = [...p];

    return {
      day,
      month,
      time
    };
  }

  parseDayMonthNTime(p) {
    return {
      time: this.parseTime(p[3]),
      day: p[1],
      month: p[2],
    };
  }

  parseUnusual1(p) {
    return [
      {
        day: p[1],
        month: p[2],
        time: p[3],
      },
      {
        day: p[4],
        month: p[5],
        time: p[6],
      },
    ];
  }

  parseDayTimePeriod(p) {
    let [, day, timeFrom, timeTo] = [...p];
    timeFrom = this.parseTime(timeFrom);
    timeTo = this.parseTime(timeTo);
    day = this.parseDay(day);

    return {
      day,
      timeFrom,
      timeTo
    };
  }

  parseTwoDays(p) {
    let [, day1, day2, month] = [...p];
    day1 = day1.trim();
    day2 = day2.trim();
    month = month.trim();
    return {
      day1,
      day2,
      month,
    };
  }

  parseDayPeriod(p) {
    let [, dayFrom, dayTo, month] = [...p];

    dayFrom = dayFrom.trim();
    dayTo = dayTo.trim();
    month = month.trim();

    month = getMonthN(month);

    return {
      dayFrom,
      dayTo,
      month,
    };
  }

  rangeToDates(dateFrom, dateTo) {
    const days = [];
    let nextDay = dateFrom.clone();
    while (true) {
      nextDay = nextDay.add(1, 'day');
      if (nextDay > dateTo || nextDay === dateTo) {
        break;
      }
      days.push(nextDay.clone());
    }
    return [dateFrom, ...days];
  }

  // [, dd.mm.yy, dd.mm.yy]
  parseDatePeriod(p) {
    let [, dateFrom, dateTo] = [...p];

    dateFrom = dateFrom.trim();
    dateTo = dateTo.trim();

    dateFrom = moment(dateFrom, 'DD.MM.YY');
    dateTo = moment(dateTo, 'DD.MM.YY');

    return this.rangeToDates(dateFrom, dateTo);
  }

  parseDatePeriodMonth(p) {
    const days = p[1].split('-');
    const month = getMonthN(p[2]);

    const dateFrom = moment(`${days[0]}.${month}`, 'DD.MM');
    const dateTo = moment(`${days[1]}.${month}`, 'DD.MM');

    return this.rangeToDates(dateFrom, dateTo);
  }

  matchTime(time) {
    time = time.trim();

    let t = time.match(/(\d+) час/);
    if (t) {
      return `${t[1]}:00`;
    }
    t = time.match(/(\d+)-(\d+)/);
    if (t) {
      return `${t[1]}:${t[2]}`;
    }
    t = time.match(/(\d+):(\d+)/);
    if (t) {
      return `${t[1]}:${t[2]}`;
    }
    t = time.match(/(\d+)\.(\d+)/);
    if (t) {
      return `${t[1]}:${t[2]}`;
    }
    return false;
  }

  parseTime(time) {
    const t = this.matchTime(time);
    if (t) {
      return t;
    }
    const err = `Time Error '${time}'`;
    throw new Error(err);
    console.trace(err);
    return err;
  }

  parseDayMonth(text) {
    text = this.stripWeekDays(text);
    text = text.trim();
    const mths = months.join('|');
    const re = `^(\\d+)\\s*(${mths})$`;
    // console.log(text);
    const m = text.match(new RegExp(re, 'i'));
    if (!m) {
      return false;
    }
    return {
      day: m[1],
      month: getMonthN(m[2]),
    };
  }

  parseDaysMonth(text) {
    text = this.stripWeekDays(text);
    text = text.replace(/\|/g, '');

    text = text.trim();
    const mths = months.join('|');
    const re = `([0-9, ]+)\\s+(${mths})\\s+в\\s+(\\d+:\\d+)`;

    const m = text.match(new RegExp(re, 'i'));

    if (!m) {
      return false;
    }
    let days = m[1];
    days = days.split(',')
      .map(v => v.trim(v));
    const firstDay = days[0];
    const lastDay = days[days.length - 1];
    const month = getMonthN(m[2].toLowerCase());
    const time = m[3];

    const dateFrom = moment(`${firstDay}.${month}.YY`, 'DD.MM.YY');
    const dateTo = moment(`${lastDay}.${month}.YY`, 'DD.MM.YY');

    return this.rangeToDates(dateFrom, dateTo);
  }

  parseMonth(text) {
    text = this.stripWeekDays(text);
    const mths = months.join('|');

    const m = text.match(new RegExp(`(${mths})`, 'i'));
    if (!m) {
      return false;
    }

    let month = m[0];
    let day = text.replace(month, '')
      .trim();
    const d = day.match(/(\d+)/);
    if (!d) {
      throw new Error('day not found');
    }
    day = d[1];
    month = getMonthN(month);
    return {
      day,
      month,
    };
  }

  stripWeekDays(s) {
    const weekDays = [
      'понедельник',
      'вторник',
      'среда',
      'четверг',
      'пятница',
      'суббота',
      'воскресенье',
      'воскресение',
      'пн',
      'вт',
      'Ср',
      'чт',
      'пт',
      'сб',
      'вс',
      'суб',
    ];
    weekDays.forEach((weekDay) => {
      s = s.replace(new RegExp(`\\(${weekDay}\\)`, 'i'), '');
      s = s.replace(new RegExp(`${weekDay}`, 'i'), '');
    });
    return s;
  }

  parseDay(day) {
    day = day.trim();
    let month = null;
    const r = this.parseMonth(day);

    if (r) {
      day = r.day;
      month = r.month;
    }

    let weekDayExists = day.match(/(.*),/);
    if (weekDayExists) {
      day = weekDayExists[1];
      return {
        day,
        month
      };
    }

    weekDayExists = day.match(/(\d+)\s*(\(\S\S\))/);

    if (weekDayExists) {
      day = weekDayExists[1];
      return {
        day,
        month
      };
    }

    return {
      day,
      month
    };
  }

  parseDate(text) {
    text = text.replace(new RegExp(`${this.datePrefix}\s*<br\s*\/?>`), this.datePrefix);
    let m = text.match(new RegExp(`${this.datePrefix}([^<]+)<br`, 'm'));
    if (!m) {
      m = text.match(new RegExp(`${this.datePrefix}([^<]+)`, 'm'));
    }
    if (!m) {
      return {
        result: {
          error: `${this.datePrefix} not found (looks like ads)`,
        },
      };
    }
    let date = m[1];
    let m2 = text.match(new RegExp(`начало:? в([^<]+)<br`, 'i'));
    if (m2) {
      date += m2[1];
    }

    return this.parseDateStr(date);
  }

  parseDateStr(s) {
    let p;
    let result = null;

    s = s.replace(/\d{4}/, '');

    // unusual formats
    p = s.match(/(\d+)\/(\d+) \(\S+\),?\s*(\d+:\d+);\s*(\d+)\/(\d+) \(\S+\),?\s*(\d+:\d+)/);
    if (p) {
      result = this.parseUnusual1(p);
      result.format = 'DD/MM (weekday), HH:mm; DD/MM (weekday) HH:mm';
    } else {
      p = s.match(/(\d+).(\d+), (\d+:\d+)/);
      if (p) {
        result = this.parseDayMonthTime(p);
        result.format = 'DD.MM HH:mm';
      } else {
        p = s.match(/(\d+ \S+) в (\d+) час/);
        if (p) {
          p[2] += ':00';
          result = this.parseDayTime(p);
          result.format = 'day month в time';
        } else {
          p = s.match(/(.*),(.*)/);
          if (p) {
            result = this.parseQuotedDate(p, s);
          } else {
            p = this.parseDayMonth(s);
            if (p) {
              result = p;
              result.format = 'day month';
            } else {
              p = s.match(/(.*) в (.*)/);
              if (p) {
                // console.log(p);
                try {
                  result = this.parseDayTime(p);
                  result.format = 'day в time';
                } catch (err) {
                  console.log("Detect as time pattern 'x в x'. But time not parsed. Init string: " + s);
                  result = 'error';
                }
              } else {
                p = s.match(/(.*) с(.*)до(.*)/);
                if (p) {
                  result = this.parseDayTimePeriod(p);
                  result.format = 'day с timeFrom до timeTo';
                } else {
                  p = s.match(/(\d+-\d+)\s+(\S+)$/);
                  if (p) {
                    result = this.parseDatePeriodMonth(p);
                    result.format = 'day1-day2 month';
                  } else {
                    p = s.match(/(\d+ \S+)\D+(\d\d:\d\d)/);
                    if (p) {
                      result = this.parseDayTime(p);
                      result.format = 'day DD:DD';
                    } else {
                      p = s.match(/(\d+ \S+)\D+(\d\d\.\d\d)/);
                      if (p) {
                        result = this.parseDayTime(p);
                        result.format = 'day DD.DD';
                      } else {
                        p = s.match(/с(.*)по(.*)/);
                        if (p) {
                          result = this.parseDatePeriod(p);
                          result.format = 'с DD.MM.YY по DD.MM.YY';
                        } else {
                          p = s.match(/(\d+)-(\d+)\s+(\S+)/);
                          if (p) {
                            result = this.parseDayPeriod(p);
                            result.format = 'day1-day2 month';
                          } else {
                            p = s.match(/(\d+).+(\d+)\s+(\S+)/);
                            if (p) {
                              result = this.parseTwoDays(p);
                              result.format = 'day1 day2 month';
                            } else {
                              p = s.match(/(\d+)\.(\d+)\D+(\d+:\d+)/);
                              if (p) {
                                result = this.parseDayMonthNTime(p);
                                result.format = 'dayN.monthM DD:DD';
                              } else {
                                // process.exit(0);
                                result = 'error';
                                debugTime('error');
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    if (result === 'error') {
      return {
        init: s.trim(),
        result: {
          error: 'Date not parsed',
        },
      };
    }

    if (!result.length) {
      // flattern result
      if (result.day && result.day.day !== undefined) {
        if (!result.day.day) {
          result.error = 'day is empty';
        }
        if (result.day.month) {
          result.month = result.day.month;
        }
        result.day = result.day.day;
      }

      if (result.time && result.time.match(/Error/)) {
        result.error = result.time;
      }

      if (result.month === undefined) {
        result.error = 'Month not recognized (undefined)';
      }
    }

    return {
      init: s.trim(),
      result,
    };
  }

  parseQuotedDate(p, s) {
    let result = null;

    result = this.parseDaysMonth(s);
    if (result) {
      result.format = 'day1[, dayN] month в time';
      return result;
    }

    // check if its a dates list
    const days = s.split(',');

    const isDaysList = days.every((day) => {
      const r = this.parseDayMonth(day);
      return r;
    });

    if (isDaysList) {
      result = days.map((day) => this.parseDayMonth(day));
      result.format = 'day month, day month[, ...]';

      return {
        init: s.trim(),
        result,
      };
    }

    const hasSecondTime = p[1].match(/(.*),(.*)/);
    if (hasSecondTime) {
      if (this.matchTime(hasSecondTime[2])) {
        p = hasSecondTime;
      }
    }

    try {
      result = this.parseDayTime(p);
      result.format = 'day, time';
    } catch (err) {
      console.log('Time parse error', p);
      result = 'error';
    }

    return result;
  }

  stripText(text) {
    text = text.replace(/style="display:none"/, '');
    text = text.replace(/<a href="\/wall-.*Показать полностью.+<\/a>/u, '');
    // console.log(">>>", text);
    return text;
  }

  parsePost(post, i) {
    const author = 'none'; // post.querySelector('.post_author .author').innerHTML;

    const content = post.querySelector('.pi_text');
    if (!content) {
      return null;
    }

    let text = post.querySelector('.pi_text').innerHTML;
    text = text.trim();

    const eventDt = this.parseDate(text);

    const images = [];
    const imageEls = post.querySelectorAll('.thumbs_map div');
    imageEls.forEach((v) => {
      const m = v.outerHTML.match(new RegExp('background-image: url\\((.+?)\\)'));
      images.push(m[1]);
    });

    text = this.stripText(text);

    return {
      eventDt,
      text,
      images,
    };
  }

  parseWall({
    html,
    page,
    useOnlyI
  }) {
    const root = parser.parse(html);
    let postContainers = root.querySelectorAll('.wall_item');

    if (useOnlyI !== undefined && postContainers[useOnlyI]) {
      postContainers = [postContainers[useOnlyI]];
    }

    const posts = [];
    postContainers.forEach((container, i) => {
      const r = this.parsePost(container, i);
      if (!r) {
        return;
      }
      r.page = page;
      r.i = i;
      posts.push(r);
    });
    // console.log(postContainers);
    // const r = this.parsePost(postContainers[9]);
    //
    // console.log(r);
    // console.log("--------------");

    return posts;
  }

  async fetchWall(offset) {
    return await this.fetchText({
      path: this.vkGroupName,
      method: 'POST',
      form: {
        own: 1,
        offset: offset || 0,
      },
    });
  }

  async fetchFirstWall() {
    return await this.fetchText({
      path: this.vkGroupName,
      method: 'GET',
    });
  }

  outputDates(posts) {
    posts.forEach(async (post, i) => {
      if (!post.eventDt) {
        console.log(`${i})` + 'no date');
      } else if (post.eventDt.result.error) {
        console.log(`${i})${post.eventDt.result.error}`);
      } else {
        console.log(`${i})`, post.eventDt.result);
        console.log(`${post.eventDt.init}\n`);
      }
    });
  }

  async parseGroup({
    store,
    fromStore
  }) {
    let wallHtml;
    if (!fromStore) {
      wallHtml = await this.fetchWall(1);
      if (store) {
        fs.writeFileSync(`${appRoot}/cache/wall.html`, wallHtml);
      }
    }

    if (fromStore) {
      wallHtml = fs.readFileSync(`${appRoot}/cache/wall.html`)
        .toString();
    }
    const r = await this.parseWall(wallHtml);
    // this.outputDates(r);
    return r;
  }

  async processPage({
    showDates,
    useOnlyI,
    i
  }) {
    console.log(`Process ${i} page`);
    const html = await this.fetchWall(10 * i + 1);
    const parseResult = await this.parseWall({
      html,
      page: i,
      useOnlyI
    });
    parseResult.page = i;
    if (showDates) {
      this.outputDates(parseResult);
    }
    return parseResult;
  }

  async parseGroupLong({
    pages,
    showDates,
    useOnlyPage,
    useOnlyI,
  }) {
    if (!pages) {
      pages = 1;
    }

    let html;
    let result = [];
    let parseResult;

    if (!useOnlyPage) {
      console.log('Process 1 page');
      html = await this.fetchFirstWall();
      parseResult = await this.parseWall({
        html,
        page: 1,
        useOnlyI
      });
      if (showDates) {
        this.outputDates(parseResult);
      }
      result = [...result, ...parseResult];
    }

    if (useOnlyPage) {
      const parseResult = await this.processPage({
        showDates,
        i: useOnlyPage,
        useOnlyI
      });
      result.concat(parseResult);
      result = [...result, ...parseResult];
    } else {
      if (pages > 1) {
        for (let i = 2; i <= pages; i++) {
          const parseResult = await this.processPage({
            showDates,
            useOnlyI,
            i
          });
          result.concat(parseResult);
          result = [...result, ...parseResult];
        }
      }
    }

    return result;
  }
}

module.exports = VkEventsParser;
