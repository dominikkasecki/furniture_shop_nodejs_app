/* -------------------------------------------------------------------------- */
/*                                   MODULES                                  */
/* -------------------------------------------------------------------------- */

const nodemailer = require('nodemailer');

const sendGrid = require('nodemailer-sendgrid-transport');

const crypto = require('crypto');

const transporter = nodemailer.createTransport(
  sendGrid({
    auth: {
      api_key: process.env.SENDGRID_KEY,
    },
  })
);

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
    input: {
      errors: [],
    },
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
        errors: errors.array(),
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
        errors: [
          { param: 'password' },
          { param: 'secondpassword' },
        ],
      },
      path: '/zarejestruj',
    });
  }

  const user = await User.create(req.body);

  if (!user) {
    throw { message: 'Tworzenie konta nie powiodło się' };
  }

  res.status(201).redirect('/zaloguj');

  return transporter.sendMail({
    to: email,
    from: 'dominikus.pt@interia.pl',
    subject: `Pomyślna rejestracja ${email}`,
    html: `
    <h1>Witamy ${email} w sklepie Dominik </h1>
    <p>Jesteś naszym nowym użytkownikiem , za co serdecznie dziękujemy </p>
    <p>W ramach nagrody dostaniesz różne zniżki cenowe !</p>
    <p>Powrót do strony głównej ${req.protocol}://${req.get(
      'host'
    )}/</p>
    <p>Pozdrawia zespół Dominik dominikus.pt@interia.pl</p>
    `,
  });
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
    input: {
      errors: [],
    },
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
        errors: errors.array(),
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
        errors: [{ param: 'email' }],
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
        errors: [{ param: 'password' }],
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
  if (!req.session.user && !req.session.isLoggedIn) {
    throw {
      message:
        'Nie można się wylogować ,jeśli się nie zalogowało',
      statusCode: 400,
    };
  }
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

/* ----------------------------- Update password ---------------------------- */

// @desc      get user's update password page
// @route     GET /update-password
// @access    Private

exports.getUpdatePasswordPage = asyncFn(
  async (req, res, next) => {
    res.render('auth/update', {
      pageTitle: 'Zmiana hasła',
      path: '/update-password',
      input: {
        errors: [],
      },
      error: false,
    });
  }
);

// @desc      Update user's password
// @route     POST /update-password
// @access    Public

exports.postUpdatePassword = asyncFn(
  async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select(
      '+password'
    );

    if (!(await user.verifyPassword(currentPassword))) {
      return res.render('auth/update', {
        pageTitle: 'Zmiana hasła',
        path: '/update-password',
        input: {
          currentPassword,
          newPassword,
          errors: [{ param: 'currentPassword' }],
        },
        error: 'Aktualne hasło jest nieprawidłowe',
      });
    }

    if (newPassword.length < 3) {
      return res.render('auth/update', {
        pageTitle: 'Zmiana hasła',
        path: '/update-password',
        input: {
          currentPassword,
          newPassword,
          errors: [{ param: 'newPassword' }],
        },
        error: 'Hasło musi mieć minimalnie 3 znaki',
      });
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: true });

    res.status(200).redirect('/');
  }
);

/* ----------------------------- Reset password ----------------------------- */

// @desc      find user's password to reset page
// @route     GET /reset-password
// @access    Public

exports.getResetPasswordEmailPage = asyncFn(
  (req, res, next) => {
    res.render('auth/email', {
      pageTitle: 'Reset hasła',
      path: '/reset-password',
      error: false,
      input: {
        errors: [],
      },
    });
  }
);

// @desc      find user's password to reset
// @route     POST /reset-password
// @access    Public

exports.postResetPasswordEmail = asyncFn(
  async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.render('auth/email', {
        pageTitle: 'Reset hasła',
        path: '/reset-password',
        error: 'Nie ma takiego emaila',
        input: {
          email,
          errors: [{ param: 'email' }],
        },
      });
    }

    const { resetPasswordToken, resetTokenExpire } = user;

    if (resetPasswordToken || resetTokenExpire) {
      throw {
        message:
          'Już wysłałeś prośbę zresetowania hasła . Udaj się na swój email',
        statusCode: 400,
      };
    }

    user.resetTokenExpire = Date.now() + 3600 * 1000;

    const token = user.createPasswordToken();

    await user.save({ validateBeforeSave: true });

    try {
      transporter.sendMail({
        to: user.email,
        from: 'dominikus.pt@interia.pl',
        subject: 'Prośba o reset hasła',
        html: `
        <h1>Drogi ${user.email} </h1>
        
        <p>, poprosiłeś nas o zmianę hasła ,więc tutaj masz odnośnik , który będzie aktywny tylko przez 1h</p>
        <p>${req.protocol}://${req.get(
          'host'
        )}/reset-password/${token}</p>
        
        `,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;

      user.resetTokenExpire = undefined;

      await user.save();
    }

    return res.status(200).render('auth/account', {
      pageTitle: 'Zaloguj się',
      login: true,
      error: 'Wiadomość została wysłana',
      input: {
        errors: [],
      },
      path: '/zaloguj',
    });
  }
);

// @desc      get reset a user's password page
// @route     GET /reset-password/:id
// @access    Public

exports.getResetPasswordPage = asyncFn((req, res, next) => {
  const id = req.params.id;

  res.render('auth/reset', {
    pageTitle: 'Reset hasła',
    path: '/reset-password',
    id,
    error: false,
    input: {
      errors: [],
    },
  });
});

// @desc      reset a user's password
// @route     POST /reset-password/:id
// @access    Public

exports.postResetPassword = asyncFn(
  async (req, res, next) => {
    const { password } = req.body;

    const id = req.params.id;

    if (password.length < 3) {
      return res.render('auth/reset', {
        pageTitle: 'Reset hasła',
        path: '/reset-password',
        id,
        error: 'Hasło musi mieć minimalnie 3 znaki',
        input: {
          errors: [{ param: 'password' }],
        },
      });
    }

    const token = crypto
      .createHash('sha256')
      .update(id)
      .digest('hex');

    const user = await User.findOne({
      resetTokenExpire: {
        $gt: Date.now(),
      },
      resetPasswordToken: token,
    });

    if (!user) {
      throw {
        message:
          'Ten użytkownik nie wysłał prośby o zmianę hasła',
        statusCode: 400,
      };
    }

    user.resetPasswordToken = undefined;

    user.resetTokenExpire = undefined;

    user.password = password;

    await user.save({ validateBeforeSave: true });

    res.status(200).render('auth/account', {
      pageTitle: 'Zaloguj się',
      login: true,
      error: 'Hasło zresetowano',
      input: {
        errors: [],
      },
      path: '/zaloguj',
    });
  }
);
