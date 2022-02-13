const Hapi = require('@hapi/hapi');

const db = require('./db');

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8001;

module.exports = async function () {
  const server = Hapi.Server({
    debug: { request: ['error'] },
    port,
    routes: {
      cors: true,
    },
    host,
  });

  await server.register(require('@hapi/vision'));

  server.views({
    engines: {
      html: require('handlebars'),
    },
    relativeTo: __dirname,
    path: 'templates',
  });

  const models = await db();

  server.decorate('request', 'db', models);
  server.decorate('server', 'db', models);

  await require('./lib/auth')(server);

  server.route(require('./routes/events'));
  server.route(require('./routes/admin/events'));

  await server.register(require('@hapi/inert'));
  server.route({
    method: 'GET',
    path: '/api/upload/{param*}',
    handler: {
      directory: {
        path: 'upload'
      }
    }
  });

  await server.start();
  console.log(`Server is listening on ${host}:${port}`);

  require('./services/updater')(models);
};
