const normalizedPath = require('path').join(__dirname, 'export');

module.exports = function () {
  const items = {};
  require('fs').readdirSync(normalizedPath).forEach((file) => {
    let name = file.replace(/\.js$/, '');
    name = name.replace('Parser', '');
    items[name] = require(`${normalizedPath}/${file}`);
  });
  return items;
};
