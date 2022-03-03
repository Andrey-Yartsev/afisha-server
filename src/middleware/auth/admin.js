module.exports = (req, res, next) => {
  if (req.query.access_token === process.env.ADMIN_PASS) {
    next();
  } else {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};
