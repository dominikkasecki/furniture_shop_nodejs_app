/* -------------------------------------------------------------------------- */
/*                                   MODULES                                  */
/* -------------------------------------------------------------------------- */

const asyncFn = require('../middleware/async');

const {
  validationResult,
} = require('express-validator/check');

const User = require('../models/User');
/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARE                                 */
/* -------------------------------------------------------------------------- */

/* --------------------------------- Signup --------------------------------- */

// @desc      get signup page
// @route     GET  /zarejestruj
// @access    Public

exports.getSignupPage = asyncFn((req, res, next) => {
  res.render('auth/account', {
    pageTitle: 'Rejestracja',
    login: false,
    error: false,
    input: {},
    path: '/zarejestruj',
  });
});

// @desc      post signup
// @route     POST  /signup
// @access    Public

exports.postSignup = asyncFn(async (req, res, next) => {
  const errors = validationResult(req);

  const { email, password, secondpassword } = req.body;

  if (!errors.isEmpty()) {
    return res.render('auth/account', {
      pageTitle: 'Rejestracja',
      login: false,
      error: errors.array()[0].msg,
      input: {
        email,
        password,
        secondpassword,
      },
      path: '/zarejestruj',
    });
  }

  if (password.toString() !== secondpassword.toString()) {
    return res.render('auth/account', {
      pageTitle: 'Rejestracja',
      login: false,
      error: 'Hasła nie są takie same',
      input: {
        email,
        password,
        secondpassword,
      },
      path: '/zarejestruj',
    });
  }

  const user = await User.create(req.body);

  if (!user) {
    throw { message: 'Tworzenie konta nie powiodło się' };
  }

  return res.status(201).redirect('/zaloguj');
});

/* ---------------------------------- Login --------------------------------- */

// @desc      get login page
// @route     GET /zaloguj
// @access    Public
exports.getLoginPage = asyncFn((req, res, next) => {
  res.render('auth/account', {
    pageTitle: 'Zaloguj się',
    login: true,
    error: false,
    input: {},
    path: '/zaloguj',
  });
});
// @desc      confirm credentials
// @route     POST  /login
// @access    Private
exports.postLogin = asyncFn(async (req, res, next) => {
  const errors = validationResult(req);

  const { email, password } = req.body;

  if (!errors.isEmpty()) {
    return res.render('auth/account', {
      pageTitle: 'Zaloguj się',
      login: true,
      error: errors.array()[0].msg,
      input: {
        email,
        password,
      },
      path: '/zaloguj',
    });
  }

  const user = await User.findOne({ email }).select(
    '+password'
  );

  if (!user) {
    return res.render('auth/account', {
      pageTitle: 'Zaloguj się',
      login: true,
      error: 'Takie konto nie istnieje',
      input: {
        email,
        password,
      },
      path: '/zaloguj',
    });
  }

  const isTheSame = await user.verifyPassword(password);

  if (!isTheSame) {
    return res.render('auth/account', {
      pageTitle: 'Zaloguj się',
      login: true,
      error: 'Hasło jest niepoprawne',
      input: {
        email,
        password,
      },
      path: '/zaloguj',
    });
  }

  req.session.user = { _id: user._id, email: user.email };
  req.session.isLoggedIn = true;
  req.session.save((err) => {
    if (err) {
      throw {
        message:
          'Logowanie się nie powiodło. Przepraszamy za problem',
      };
    }
    return res.status(200).redirect('/');
  });
});

// @desc      logout the user
// @route     GET /wyloguj
// @access    Private
exports.getLogout = asyncFn((req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      throw {
        message:
          'Wylogowanie nie powidło się . Przepraszamy za problem',
      };
    }
    return res.status(200).redirect('/');
  });
});
