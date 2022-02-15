const Joi = require('@hapi/joi');

module.exports = [
  {
    method: 'POST',
    path: '/api/admin/login',
    handler: (request) => {
      if (request.payload.password !== process.env.ADMIN_PASS) {
         return { error: "Wrong pass" };
      }
      return { success: true };
    },
    options: {
      description: 'Login',
      tags: ['admin']
    }
  }
];
