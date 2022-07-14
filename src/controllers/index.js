module.exports = (app) => {
  require('./auth')(app);
  require('./events')(app);
  require('./admin/events')(app);
  require('./vk-auth')(app);
  require('./places')(app);
  require('./admin/places')(app);
};
