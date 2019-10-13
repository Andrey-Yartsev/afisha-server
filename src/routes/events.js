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
  }
];
