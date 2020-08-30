/* -------------------------------------------------------------------------- */
/*                                   MODULES                                  */
/* -------------------------------------------------------------------------- */

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');

const isLoggedIn = require('../middleware/isLoggedIn');

const isAuth = require('../middleware/isAuth');

const {
  getSignupPage,
  postSignup,
  getLoginPage,
  postLogin,
  getLogout,
  getResetPasswordEmailPage,
  postResetPasswordEmail,
  getResetPasswordPage,
  postResetPassword,
  getUpdatePasswordPage,
  postUpdatePassword,
} = require('../controllers/authC');

/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARE                                 */
/* -------------------------------------------------------------------------- */

router.get('/zarejestruj', isLoggedIn, getSignupPage);

router.post(
  '/signup',
  isLoggedIn,
  [
    body('email', 'Email jest niepoprawny')
      .isLength({ min: 3 })
      .withMessage('Email jest za krótki')
      .normalizeEmail()
      .isEmail()
      .trim(),
    body('password', 'Hasło jest niepoprawne')
      .isLength({ min: 3 })
      .withMessage('Hasło jest za krótkie')
      .isString()
      .trim(),
  ],
  postSignup
);

router.get('/zaloguj', isLoggedIn, getLoginPage);

router.post(
  '/login',
  isLoggedIn,
  [
    body('email')
      .isLength({ min: 3 })
      .withMessage('Email jest za krótki')
      .normalizeEmail()
      .isEmail()
      .trim(),
    body('password', 'Hasło jest niepoprawne')
      .isString()
      .trim(),
  ],
  postLogin
);

router
  .route('/reset-password')
  .get(getResetPasswordEmailPage)
  .post(postResetPasswordEmail);

router
  .route('/reset-password/:id')
  .get(getResetPasswordPage)
  .post(postResetPassword);

router
  .route('/update-password')
  .get(isAuth, getUpdatePasswordPage)
  .post(isAuth, postUpdatePassword);

router.get('/wyloguj', getLogout);

module.exports = router;
