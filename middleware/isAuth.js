const User = require('../models/User');

const asyncFn = require('./async');

const isAuth = asyncFn(async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    throw {
      message: 'Użytkownik nie jest zalogowany',
      statusCode: 401,
    };
  }

  const user = await User.findById(req.session.user._id);

  if (!user) {
    throw {
      message: 'Twoje konto nie istnieje',
      statusCode: 401,
    };
  }

  req.user = user;

  return next();
});

module.exports = isAuth;
