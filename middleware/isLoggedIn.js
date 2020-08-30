const asyncFn = require('./async');

const isLoggedIn = asyncFn((req, res, next) => {
  if (req.session.user && req.session.isLoggedIn) {
    throw {
      message:
        'Nie możesz się logować i rejestrować jak jesteś zalogowany',
      statusCode: 400,
    };
  }

  return next();
});

module.exports = isLoggedIn;
