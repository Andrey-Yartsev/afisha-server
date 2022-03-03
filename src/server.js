const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const db = require('./db');

module.exports = async function () {
  const models = await db();

  const app = express();

  app.use(fileUpload({
    createParentPath: true
  }));
  app.use(cors());
  app.use(bodyParser.json({
    limit: '10mb'
  }));
  app.use(bodyParser.urlencoded({
    extended: true,
  }));
  app.use(morgan('dev'));

  app.db = models;

  const port = 8001;

  app.get('/', (req, res) => {
    res.send('Hello World!')
  });

  require('./controllers/index')(app);

  app.listen(port, () => {
    console.log(`afisha-server is listening on port ${port}`)
  })

  require('./services/updater')(models);
};
