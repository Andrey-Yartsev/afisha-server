const moment = require('moment');

module.exports = (app) => {
  app.get('/api/places', function (req, res) {
    let places = require(global.appRoot + '/src/lib/events/parser/places/places.js');
    //let places2 = [];

    const filterDuplicates = () => {
      let existingDuplicateIndex;
      for (let i = 0; i < places.length; i++) {
        let place = places[i];
        if (place.group) {
          existingDuplicateIndex = places.findIndex(place2 => {
            if (place2.hide === undefined && place2.name !== place.name && place2.group === place.group) {
              places[i].hide = true;
              return true;
            }
            places[i].hide = false;
            return false;
          });
        }
      }
    };
    const filterHidden = () => {
      places = places.filter(place => {
        if (place.hide === undefined) {
          return true;
        }
        return !place.hide;
      });
    };
    //filterHidden();
    //filterDuplicates();
    filterHidden();
//    console.log(places);
    res.send(places);
  });
};
