const Joi = require('joi');
const controller = require('../../controllers/admin/events');

module.exports = [
  {
    method: 'GET',
    path: '/admin/events',
    handler: controller.index,
    config: {
      description: 'Outputs events',
      tags: ['admin']
    }
  },
];
