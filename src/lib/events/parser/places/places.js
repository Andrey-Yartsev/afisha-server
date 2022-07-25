let _places = require('./_places');
module.exports = _places.filter(v => !v.hide);
