'use strict';

const Hapi = require('@hapi/hapi');

const db = require('./db');

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8001;

module.exports = async function () {
  const server = Hapi.Server({
    debug: { request: ['error'] },
    port,
    routes: {
      cors: true
    },
    host
  });

  const models = await db();

  server.decorate('request', 'db', models);
  server.decorate('server', 'db', models);

  // require('./services/update')(server);

  server.route(require('./routes/events'))

  await server.start();
  console.log(`Server is listening on ${host}:${port}`);
};
