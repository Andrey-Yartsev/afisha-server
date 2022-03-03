module.exports = (app) => {
  app.post('/api/admin/login', function (req, res) {
    if (req.body.password !== process.env.ADMIN_PASS) {
      res.send({ error: "Wrong pass" });
    }
    return res.send({ success: true });
  });
};
