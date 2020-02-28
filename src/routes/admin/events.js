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
