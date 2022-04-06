const passport = require('passport');
const VKontakteStrategy = require('passport-vkontakte').Strategy;
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth/user');

passport.use(new VKontakteStrategy({
    clientID: process.env.VK_CLIENT_ID,
    clientSecret: process.env.VK_CLIENT_SECRET,
    callbackURL: process.env.VK_CALLBACK_URL
  },
  function (accessToken, refreshToken, params, profile, done) {
    return done(null, profile);
  }
));

const createOrFindUser = async (app, vkUser) => {
  let user = await app.db.User.findOne({
    vkId: vkUser.id
  });
  if (user) {
    return user;
  }
  return await app.db.User.create({
    vkId: vkUser.id,
    username: vkUser.username,
    displayName: vkUser.displayName
  });
};

const sign = (user, onSign) => {
  jwt.sign(
    user.toObject(),
    "randomString",
    { expiresIn: "2d" },
    (err, token) => {
      if (err) throw err;
      onSign(token);
    }
  );
};

module.exports = (app) => {
  app.get('/api/auth/vkontakte',
    passport.authenticate('vkontakte'),
    function (req, res) {
      // The request will be redirected to vk.com for authentication, so
      // this function will not be called.
    }
  );
  app.get('/api/auth/vkontakte/callback',
    passport.authenticate('vkontakte', {
      failureRedirect: '/login',
      session: false
    }),
    async function (req, res) {
      const user = await createOrFindUser(app, req.user);
      sign(user, token => {
        res.redirect(process.env.FRONT_PATH + '/?vk-token=' + token);
      });
      // res.send(user);
    }
  );
  app.get('/api/me', auth,
    async function (req, res) {
      const user = await app.db.User.findOne({ _id: req.user._id });
      if (!user) {
        res.status(500);
        res.json({
          error: "no user found",
        });
        return;
      }
      res.send(user);
    }
  );
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    })
  })
};
