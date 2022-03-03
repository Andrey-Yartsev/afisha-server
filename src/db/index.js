const mongoose = require('mongoose');

mongoose.Promise = Promise;

const db = mongoose.connection;

const ucFirst = function (s) {
  return s.charAt(0).toUpperCase() + s.substr(1);
};

const normalizedPath = require('path').join(__dirname, 'schemas');

db.on('error', console.error);

const host = process.env.MONGO_HOST || 'localhost';
const name = process.env.DB_NAME || 'afisha';

mongoose.connect(`mongodb://${host}/${name}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.once('open', () => {
      const models = {};
      models._db = db;
      require('fs').readdirSync(normalizedPath).forEach((file) => {
        const name = ucFirst(file.replace(/\.js$/, ''));
        models[name] = mongoose.model(name, require(`${normalizedPath}/${file}`));
      });
      resolve(models);
    });
  });
};
