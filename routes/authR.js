/* -------------------------------------------------------------------------- */
/*                                   MODULES                                  */
/* -------------------------------------------------------------------------- */

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');

const {
  getSignupPage,
  postSignup,
  getLoginPage,
  postLogin,
  getLogout,
} = require('../controllers/authC');

/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARE                                 */
/* -------------------------------------------------------------------------- */

router.get('/zarejestruj', getSignupPage);

router.post(
  '/signup',
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

router.get('/zaloguj', getLoginPage);

router.post(
  '/login',
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

router.get('/wyloguj', getLogout);

module.exports = router;
