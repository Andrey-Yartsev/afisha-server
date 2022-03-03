module.exports = (app) => {
  require('./auth')(app);
  require('./events')(app);
  require('./admin/events')(app);
};
