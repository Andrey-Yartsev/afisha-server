const auth = require('../../middleware/auth/admin');
const fs = require('fs');
const express = require('express');

module.exports = (app) => {
  app.post('/api/events/images/:id', auth, async function (req, res) {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      });
    } else {
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
      await file.mv('./upload/' + name);
      res.send({name});
    }
  });
  app.delete('/api/events/images/:id', auth, async function (req, res) {
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
      fs.rmSync(global.appRoot + '/upload/' + image._id + '.png');
      res.send({success: true});
    } else {
      res.send({error: 'Record does not exists'});
    }
  });
};
