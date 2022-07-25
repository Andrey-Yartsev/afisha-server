const adminAuth = require('../../middleware/auth/admin');
const fs = require('fs');

module.exports = (app) => {
  app.post('/api/places/images/:placeId', adminAuth, async function (req, res) {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      });
      return;
    }
    let file = req.files.file;
    if (!req.files.file) {
      res.send({
        status: false,
        message: 'No file uploaded 2'
      });
    }
    const placeId = req.params.placeId;
    const placeImage = await app.db.PlaceImage.create({
      placeId
    });

    await app.db.PlaceImage.updateOne(
      { placeId },
      {
        $set: {
          placeId,
          dtUpdate: Date.now()
        },
      },
      { upsert: true },
    );

    await placeImage.save();
    const name = placeId + '.png';
    await file.mv('./upload/place/image/' + name);
    res.send({
      path: process.env.STATIC_PATH + '/upload/place/image/' + name
    });
  });


  app.delete('/api/places/images/:placeId', adminAuth, async function (req, res) {
    console.log(req.params.placeId);
    const image = await app.db.PlaceImage.findOne({
      placeId: req.params.placeId
    });
    if (image) {
      const r = image.remove();
      console.log(r);
      console.log(await app.db.PlaceImage.findOne({
        placeId: req.params.placeId
      }));
      //global.appRootas
      console.log('DELETE ./upload/place/image/' + image.placeId + '.png');
      fs.rmSync('./upload/place/image/' + image.placeId + '.png');
      res.send({success: true});
    } else {
      res.status(404);
      res.send({error: 'Record does not exists'});
    }
  });

};
