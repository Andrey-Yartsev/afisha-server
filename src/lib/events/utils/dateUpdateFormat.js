const moment = require('moment');

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const getDate = (d) => {
  if (moment.isMoment(d)) {
    d = momentFirstMin(d);
    return d.toDate();
  }
  if (!d.day) {
    return false;
  }
  if (!isNumeric(d.day)) {
    return false;
  }
  let s = '';

  s += `${moment().format('YYYY')}-${
    (`0${d.month}`).slice(-2)}-${(`0${d.day}`).slice(-2)}`;
  if (d.time) {
    s += ` ${d.time}`;
  }
  return momentFirstMin(moment(s)).toDate();
};

const momentFirstMin = (moment) => moment.add(1, 'second'); // .utc();

module.exports = { getDate, momentFirstMin };
