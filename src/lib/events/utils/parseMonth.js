const moment = require('moment');

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

const stripWeekDays = function (s) {
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
};

const getMonthN = (month) => {
  month = month.toLowerCase();
  if (months.indexOf(month) === -1) {
    throw new Error('Wrong month input: ' + month);
  }
  return months.indexOf(month) + 1;
};

const rangeToDates = function (dateFrom, dateTo) {
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

const parseDayMonth = function (text) {
  text = stripWeekDays(text);
  text = text.trim();
  const mths = months.join('|');
  const re = `^(\\d+)\\s*(${mths})`;
  const m = text.match(new RegExp(re, 'i'));
  if (!m) {
    return false;
  }
  return {
    day: m[1],
    month: getMonthN(m[2]),
  };
};

const parseDaysMonth = function (text) {
  text = stripWeekDays(text);
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

  return rangeToDates(dateFrom, dateTo);
};

const parseMonth = function (text) {
  text = stripWeekDays(text);
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
};

module.exports = {months, stripWeekDays, getMonthN, rangeToDates, parseDayMonth, parseDaysMonth, parseMonth};
