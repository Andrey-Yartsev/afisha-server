const controller = require('../../controllers/admin/events');

module.exports = [
  {
    method: 'POST',
    path: '/api/admin/events',
    handler: controller.create,
    config: {
      description: 'Creates event',
      tags: ['admin'],
      auth: 'admin'
    }
  },
  {
    method: 'POST',
    path: '/api/events/images/{id}',
    config: {
      description: 'Creates event image',
      tags: ['admin'],
      auth: 'admin',
      handler: controller.upload,
      payload: {
        maxBytes: 209715200,
        output: 'file',
        parse: true
      }
    }
  },
  {
    method: 'DELETE',
    path: '/api/admin/events/{id}',
    handler: controller.remove,
    config: {
      description: 'Delete event',
      tags: ['admin'],
      auth: 'admin'
    }
  },
];
