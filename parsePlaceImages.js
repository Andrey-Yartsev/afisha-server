const path = require('path');
const db = require("./src/db/index");
const Parser = require("./src/lib/events/parser/places/VkPageImageParser");

process.on('unhandledRejection', (reason, p) => {
  console.error(reason);
  console.error(p);
});

global.appRoot = path.resolve(__dirname);

(async () => {

  const updateImageRecord = async (models, placeId) => {
    await models.PlaceImage.updateOne(
      {placeId},
      {
        $set: {
          placeId,
          dtUpdate: Date.now()
        },
      },
      {upsert: true},
    );
  };
  const models = await db();

  let placeImages = await models.PlaceImage.find({});//.map(v => v.placeId);
  let existingPlaceIds = placeImages.map(placeImage => placeImage.placeId);

  let places = require(global.appRoot + '/src/lib/events/parser/places/places.js');
  const sliceFrom = 0;
  // const sliceCount = 1;
  // places = places.splice(sliceFrom, sliceCount);
  let placeId = sliceFrom + 1;
  for await (let place of places) {
    if (existingPlaceIds.indexOf(placeId) !== 0) {
      console.log('exists: ', placeId);
      placeId++;
      continue;
    }
    if (!place.vk) {
      console.log('place has no vk ', place);
      placeId++;
      continue;
    }
    let parser = new Parser(models, {
      vkPath: place.vk,
      placeId: placeId
    });
    const path = await parser.parse();
    if (!path) {
      console.log('group ' + place.vk + ' has no image');
    }
    await updateImageRecord(models, placeId);
    placeId++;
  }
  process.exit(0);
})();
