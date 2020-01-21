const request = require('request');
const iconv = require('iconv-lite');
const parser = require('node-html-parser');
const fs = require('fs');
const moment = require('moment');

const debugTime = text => {
  // console.log(text);
};

// https://m.vk.com/afisha_nnov?offset=15&own=1

const fetchText = ({ path, method, form }) => {
  let config = {
    url: 'https://m.vk.com/' + path,
    encoding: null,
    method: method || "GET",
    form
  };

  // console.log({
  //   path,
  //   form
  // });

  return new Promise((accept) => {
    request(config, (err, response, body) => {
      // const c = iconv.encode(iconv.decode(body, 'cp1251'), 'utf8').toString();
      accept(body.toString());
    })
  });
};

const fetchMeta = async (name) => {
  let c = await fetchText({ path: name });
  // console.log(c);

  const root = parser.parse(c);
  const node = root.querySelector('.post__anchor.anchor');
  const _name = node.attributes.name;

  const [, fixed, owner_id] = _name.match(/post(.+)_(.+)/);
  return { fixed, owner_id };
};

const parseDayTime = p => {
  // console.log("***", p);
  let [, day, time] = [...p];

  // console.log(p);
  time = parseTime(time);
  day = parseDay(day);

  return { day, time };
};

const parseDayMonthTime = p => {
  let [, day, month, time] = [...p];

  return { day, month, time };
};

const parseDayMonthNTime = p => {
  return {
    time: parseTime(p[3]),
    day: p[1],
    month: p[2]
  };
};

const parseUnusual1 = p => {
  return [
    {
      day: p[1],
      month: p[2],
      time: p[3]
    },
    {
      day: p[4],
      month: p[5],
      time: p[6]
    }
  ];
};

const parseDayTimePeriod = p => {
  let [, day, timeFrom, timeTo] = [...p];
  timeFrom = parseTime(timeFrom);
  timeTo = parseTime(timeTo);
  day = parseDay(day);

  return { day, timeFrom, timeTo };
};

const parseTwoDays = p => {
  let [, day1, day2, month] = [...p];
  day1 = day1.trim();
  day2 = day2.trim();
  month = month.trim();
  return {
    day1,
    day2,
    month
  };
};

const parseDayPeriod = p => {
  let [, dayFrom, dayTo, month] = [...p];

  dayFrom = dayFrom.trim();
  dayTo = dayTo.trim();
  month = month.trim();

  month = getMonthN(month);

  return {
    dayFrom,
    dayTo,
    month
  };
};

const rangeToDates = (dateFrom, dateTo) => {
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
};

// [, dd.mm.yy, dd.mm.yy]
const parseDatePeriod = p => {
  let [, dateFrom, dateTo] = [...p];

  dateFrom = dateFrom.trim();
  dateTo = dateTo.trim();

  dateFrom = moment(dateFrom, "DD.MM.YY");
  dateTo = moment(dateTo, "DD.MM.YY");

  return rangeToDates(dateFrom, dateTo);
};

const matchTime = time => {
  // console.log(">>>" + time);
  time = time.trim();

  let t = time.match(/(\d+)-(\d+)/);
  if (t) {
    return t[1] + ":" + t[2];
  }
  t = time.match(/(\d+):(\d+)/);
  if (t) {
    return t[1] + ":" + t[2];
  }
  t = time.match(/(\d+)\.(\d+)/);
  if (t) {
    return t[1] + ":" + t[2];
  }
  return false;
};

const parseTime = time => {
  const t = matchTime(time);
  if (t) {
    return t;
  }
  const err = "Time Error '" + time + "'";
  console.trace(err);
  return err;
};

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
  'декабря'
];

const getMonthN = month => {
  return months.indexOf(month) + 1;
};

const parseMonth = text => {

  const mths = months.join("|");
  const m = text.match(new RegExp(`(${mths})`));
  if (!m) {
    return false;
  }

  let month = m[0];
  let day = text.replace(month, "").trim();
  let d = day.match(/(\d+)/);
  if (!d) {
    throw new Error("day not found");
  }
  day = d[1];
  month = getMonthN(month);

  return {
    day,
    month
  };
};

const stripWeekDays = s => {
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
    'ср',
    'чт',
    'пт',
    'сб',
    'вс',
    'суб'
  ];
  weekDays.forEach(weekDay => {
    s = s.replace(new RegExp(`\\(${weekDay}\\)`), "");
  });
  return s;
};

const parseDayMonth = text => {
  text = stripWeekDays(text);
  text = text.trim();
  const mths = months.join("|");
  const re = `^(\\d+)\\s*(${mths})$`;
  //console.log(text);
  const m = text.match(new RegExp(re));
  if (!m) {
    return false;
  }
  return {
    day: m[1],
    month: getMonthN(m[2])
  };
};

const parseDay = day => {
  day = day.trim();
  // console.log(">>>", day)
  let month = null;
  const r = parseMonth(day);

  if (r) {
    day = r.day;
    month = r.month;
  }

  let weekDayExists = day.match(/(.*),/);
  if (weekDayExists) {
    day = weekDayExists[1];
    return { day, month };
  }

  weekDayExists = day.match(/(\d+)\s*(\(\S\S\))/);

  if (weekDayExists) {
    day = weekDayExists[1];
    return { day, month };
  }

  return { day, month };
};

const parseDate = text => {
  text = text.replace(/Когда:\s*<br\s*\/?>/, 'Когда:')
  const m = text.match(/Когда:([^<]+)<br/m);
  if (!m) {
    // console.log(text);
    return {
      result: {
        error: "Когда: not found (looks like ads)"
      }
    };
  }

  return parseDateStr(m[1]);
};

const parseDateStr = s => {
  let p;
  let result = null;

  s = s.replace(/\d{4}/, "");

  // unusual formats
  //
  p = s.match(/(\d+)\/(\d+) \(\S+\),?\s*(\d+:\d+);\s*(\d+)\/(\d+) \(\S+\),?\s*(\d+:\d+)/);
  if (p) {
    result = parseUnusual1(p);
    result.format = 'DD/MM (weekday), HH:mm; DD/MM (weekday) HH:mm';
  } else {
    p = s.match(/(\d+).(\d+), (\d+:\d+)/);
    //  parseDayMonthTime(p);
    // console.log(">>>>", s, p);
    if (p) {
      result = parseDayMonthTime(p);
      result.format = 'DD.MM HH:mm';
    } else {
      p = s.match(/(\d+ \S+) в (\d+) час/);
      if (p) {
        p[2] = p[2] + ":00";
        result = parseDayTime(p);
        result.format = 'day month в time';
      } else {
        p = s.match(/(.*),(.*)/);
        if (p) {
          // check if its a dates list
          let days = s.split(',')
          const isDaysList = days.every(day => {
            const r = parseDayMonth(day);
            return r;
          });

          if (isDaysList) {
            result = days.map(day => {
              return parseDayMonth(day);
            });
            result.format = 'day month, day month[, ...]';

            return {
              init: s.trim(),
              result
            };
          }

          let hasSecondTime = p[1].match(/(.*),(.*)/)
          if (hasSecondTime) {
            if (matchTime(hasSecondTime[2])) {
              p = hasSecondTime;
            }
          }

          result = parseDayTime(p);
          result.format = 'day, time';
        } else {
          p = parseDayMonth(s);
          if (p) {
            result = p;
            result.format = 'day month';
          } else {
            p = s.match(/(.*) в (.*)/);
            if (p) {
              // console.log(p);
              result = parseDayTime(p);
              result.format = 'day в time';
            } else {
              p = s.match(/(.*) с(.*)до(.*)/);
              if (p) {
                result = parseDayTimePeriod(p);
                result.format = 'day с timeFrom до timeTo';
              } else {
                //console.log(s.match(/(\d+ \S+)\D+(\d+:\d+)/));
                p = s.match(/(\d+ \S+)\D+(\d\d:\d\d)/);
                if (p) {
                  result = parseDayTime(p);
                  result.format = 'day DD:DD';
                } else {
                  p = s.match(/(\d+ \S+)\D+(\d\d\.\d\d)/);
                  if (p) {
                    result = parseDayTime(p);
                    result.format = 'day DD.DD';
                  } else {
                    p = s.match(/с(.*)по(.*)/);
                    if (p) {
                      result = parseDatePeriod(p);
                      result.format = "с DD.MM.YY по DD.MM.YY";
                    } else {
                      p = s.match(/(\d+)-(\d+)\s+(\S+)/);
                      if (p) {
                        result = parseDayPeriod(p);
                        result.format = 'day1-day2 month';
                      } else {
                        p = s.match(/(\d+).+(\d+)\s+(\S+)/);
                        if (p) {
                          result = parseTwoDays(p);
                          result.format = 'day1 day2 month';
                        } else {
                          p = s.match(/(\d+)\.(\d+)\D+(\d+:\d+)/);
                          if (p) {
                            result = parseDayMonthNTime(p);
                            result.format = 'dayN.monthM DD:DD';
                          } else {
                            result = "error";
                            debugTime("error");
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
    console.log(s);
    result.error = "Month not recognized (undefined)";
  }

  return {
    init: s.trim(),
    result
  };
};

const stripText = text => {
  text = text.replace(/style="display:none"/, '');
  text = text.replace(/<a href="\/wall-.*Показать полностью…<\/a>/u, '');
  // console.log(">>>", text);
  return text;
};

const parsePost = post => {
  const author = "none"; // post.querySelector('.post_author .author').innerHTML;

  const content = post.querySelector('.pi_text');
  if (!content) {
    return null;
  }

  let text = post.querySelector('.pi_text').innerHTML;
  text = text.trim();

  // console.log(text + "\n---------\n");

  const eventDt = parseDate(text);

  const images = [];
  const imageEls = post.querySelectorAll('.thumbs_map div');
  imageEls.forEach(v => {
    const m = v.outerHTML.match(new RegExp("background-image: url\\((.+?)\\)"));
    images.push(m[1]);
  });

  text = stripText(text);

  return {
    eventDt,
    text
    // images
  };
};

const parseWall = ({ html, page, useOnlyI }) => {
  const root = parser.parse(html);
  let postContainers = root.querySelectorAll(".wall_item");

  if (useOnlyI && postContainers[useOnlyI]) {
    postContainers = [postContainers[useOnlyI]];
  }

  const posts = [];
  postContainers.forEach((container, i) => {
    const r = parsePost(container);
    if (!r) {
      return;
    }
    r.page = page;
    r.i = i;
    posts.push(r);
  });
  // const r = parsePost(postContainers);
  //
  // console.log(r);
  // console.log("--------------");

  return posts;
};

const fetchWall = async (offset) => {
  return await fetchText({
    path: 'afisha_nnov',
    method: 'POST',
    form: {
      own: 1,
      offset: offset || 0
    }
  });
};

const fetchFirstWall = async () => {
  return await fetchText({
    path: 'afisha_nnov',
    method: 'GET'
  });
};

const path = require('path');
const appRoot = path.dirname(path.dirname(path.resolve(__dirname)));

const outputDates = posts => {
  posts.forEach(async (post, i) => {
    if (!post.eventDt) {
      console.log(i + ")" + "no date");
    } else if (post.eventDt.result.error) {
      console.log(i + ")" + post.eventDt.result.error);
    } else {
      console.log(i + ")", post.eventDt.result);
      console.log(post.eventDt.init + "\n");
    }
  })
};

const parseGroup = async ({ store, fromStore }) => {
  let wallHtml;
  if (!fromStore) {
    wallHtml = await fetchWall(1);
    if (store) {
      fs.writeFileSync(appRoot + "/cache/wall.html", wallHtml);
    }
  }

  if (fromStore) {
    wallHtml = fs.readFileSync(appRoot + "/cache/wall.html").toString();
  }
  let r = await parseWall(wallHtml);

  // outputDates(r);

  return r;
};

const processPage = async ({ showDates, useOnlyI, i }) => {
  console.log(`Process ${i} page`);
  html = await fetchWall(10 * i + 1);
  parseResult = await parseWall({ html, page: i, useOnlyI });
  parseResult.page = i;
  if (showDates) {
    outputDates(parseResult);
  }
  return parseResult;
};

const parseGroupLong = async ({ pages, showDates, useOnlyPage, useOnlyI }) => {
  if (!pages) {
    pages = 1;
  }

  let html;
  let result = [];
  let parseResult;

  if (!useOnlyPage) {
    console.log(`Process 1 page`);
    html = await fetchFirstWall();
    parseResult = await parseWall({html, page: 1, useOnlyI});
    if (showDates) {
      outputDates(parseResult);
    }
    result = [...result, ...parseResult];
  }

  if (useOnlyPage) {
    let parseResult = await processPage({ showDates, i: useOnlyPage });
    result.concat(parseResult);
    result = [...result, ...parseResult];
  }

  if (pages > 1) {
    for (let i = 2; i <= pages; i++) {
      let parseResult = await processPage({ showDates, useOnlyI, i} );
      result.concat(parseResult);
      result = [...result, ...parseResult];
    }
  }
  return result;
};

module.exports = {
  fetchText,
  fetchMeta,
  parseWall,
  fetchWall,
  parseGroup,
  parseGroupLong,
  parseDateStr
};
