const Joi = require('joi')
const controller = require('../controllers/events')

module.exports = [
  {
    method: 'GET',
    path: '/api/events/{date?}',
    handler: controller.fetch,
    config: {
      description: 'Get events',
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: '/api/events/exists/{month}',
    handler: controller.exists,
    config: {
      description: 'Get days events exists information',
      tags: ['api']
    }
  },
];
