require('dotenv').config()
const path = require('path');

global.appRoot = path.resolve(__dirname);

process.on('unhandledRejection', (reason, p) => {
  console.error(reason)
  console.error(p)
});

require('./src/server.js')();
