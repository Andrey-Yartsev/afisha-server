const AuthBearer = require('hapi-auth-bearer-token');

module.exports = async (server) => {
  await server.register(AuthBearer);

  require('./strategies/admin')(server);
};
