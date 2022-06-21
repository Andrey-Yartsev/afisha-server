const moment = require('moment');

module.exports = (app) => {
  app.get('/api/places', function (req, res) {
    const places = require(global.appRoot + '/src/lib/events/parser/places/places.js');
    res.send(places);
  });
};
