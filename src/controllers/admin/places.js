const adminAuth = require('../../middleware/auth/admin');

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
};
