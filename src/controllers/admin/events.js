const adminAuth = require('../../middleware/auth/admin');
const auth = require('../../middleware/auth/user');
const fs = require('fs');
const moment = require('moment');

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

const getDate = function ({ date, time }) {
  return moment(`${date} ${time}`, 'DD.MM HH:mm').toDate();
};

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
  // добавление события вк-юзеро или админом
  app.post('/api/admin/events', auth, async function (req, res) {
    const eventDt = getDate(req.body);
    let images = [];
    if (req.body.image) {
      images.push(req.body.image);
    }
    console.log(req.user);
    let vkUser = null;
    if (req.user) {
      vkUser = {};
      vkUser.vkId = req.user;
      vkUser.username = req.username;
      vkUser.displayName = req.displayName;
    }
    const result = await app.db.Event.create({
      text: req.body.text,
      images,
      eventDt: [eventDt],
      dtUpdate: Date.now(),
      source: 'admin',
      vkUser: vkUser
    });
    res.send(result);
  });
  app.post('/api/admin/events/:id', adminAuth, async function (req, res) {
    const eventDt = getDate(req.body);
    let images = [];
    if (req.body.image) {
      images.push(req.body.image);
    }
    const update = {
      eventDt: [eventDt],
      images,
      text: req.body.text
    };
    await app.db.Event.updateOne({ _id: req.params.id }, update);
    res.send(await app.db.Event.findById(req.params.id));
  });
  app.delete('/api/admin/events/:id', adminAuth, async function (req, res) {
    await app.db.Event.deleteOne({ _id: req.params.id });
    res.send({ success: true });
  });
};
