module.exports = [
  {
    method: 'POST',
    path: '/api/admin/login',
    handler: (req) => {
      console.log(req.payload);
      if (req.payload.password !== process.env.ADMIN_PASS) {
        return { error: "Wrong pass" };
      }
      return { success: true };
    },
    config: {
      description: 'Login',
      tags: ['admin']
    }
  }
];
