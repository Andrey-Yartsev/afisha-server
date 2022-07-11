const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  console.log(req.headers);
  const token = req.headers.authorization.split(' ')[0];
  if (!token) return res.status(401).json({ message: "Auth Error" });

  try {
    const decoded = jwt.verify(token, "randomString");
    req.user = decoded;
    next();
  } catch (e) {
    console.error(e);
    res.status(401).send({ message: "Invalid Token" });
  }
};
