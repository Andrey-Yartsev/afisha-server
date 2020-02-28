module.exports = function (server) {
  server.auth.strategy('admin', 'bearer-access-token', {
    allowQueryToken: true, // optional, false by default
    validate: async (request, token, h) => {
      const isValid = token === process.env.ADMIN_PASS;

      const credentials = { token };
      const artifacts = { test: 'info' };

      return { isValid, credentials, artifacts };
    }
  });
};
