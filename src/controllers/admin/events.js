const adminAuth = require('../../middleware/auth/admin');
const fs = require('fs');

// function timeout(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

const makeid = function (length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

module.exports = (app) => {
  app.post('/api/events/images/:id', adminAuth, async function (req, res) {
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
      // logic
      const event = await app.db.Event.findOne({_id: req.params.id});
      const image = await app.db.EventUserImage.create({
        event: req.params.id
      });
      event.userImages.push(image._id);
      await event.save();

      const name = image._id + '.png';
      await file.mv('./upload/event/report/' + name);
      res.send({name});
    });
  app.delete('/api/events/images/:id', adminAuth, async function (req, res) {
    const image = await app.db.EventUserImage.findOne({
      _id: req.params.id
    });
    if (image) {
      const event = await app.db.Event.findOne({
        _id: image.event
      });
      event.userImages = event.userImages.filter(v => {
        return v._id.toString() !== image._id.toString();
      });
      await event.save();
      await image.remove();
      fs.rmSync(global.appRoot + '/upload/event/report/' + image._id + '.png');
      res.send({success: true});
    } else {
      res.send({error: 'Record does not exists'});
    }
  });
  app.post('/api/admin/events/images/temp', adminAuth, async function (req, res) {
    let file = req.files.file;
    const name = makeid(20) + '.png';
    await file.mv('./upload/event/temp/' + name);
    res.send({name});
  });
  app.post('/api/admin/events', adminAuth, async function (req, res) {
    const r = await app.db.Event.create({
      text: text,
      eventDt: [eventDt],
      dtUpdate: Date.now(),
      images: data.images,
      source: 'admin'
    });
  });
  app.post('/api/admin/events/:id', adminAuth, async function (req, res) {
    const update = {
      text: req.body.text
    };
    await app.db.Event.updateOne({ _id: req.params.id }, update);
    res.send(await app.db.Event.findById(req.params.id));
  });
};
