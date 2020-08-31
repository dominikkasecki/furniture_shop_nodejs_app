/* -------------------------------------------------------------------------- */
/*                                CORE MODULES                                */
/* -------------------------------------------------------------------------- */

const path = require('path');

/* -------------------------------------------------------------------------- */
/*                                 NPM MODULES                                */
/* -------------------------------------------------------------------------- */

const express = require('express');

const app = express();

const mongoose = require('mongoose');

const colors = require('colors');

const helmet = require('helmet');

const compression = require('compression');

const csrf = require('csurf');

const bodyParser = require('body-parser');

if (process.env.NODE_ENV === 'development') {
  const dotenv = require('dotenv');

  dotenv.config({
    path: './config/config.env',
  });
}

const session = require('express-session');

const connectDB = require('connect-mongodb-session')(
  session
);

const store = new connectDB({
  uri: process.env.MONGO_URI,
  collection: 'sessions',
});

const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');

const hpp = require('hpp');

/* ----------------------------------- AWS ---------------------------------- */

const bucketName = process.env.BUCKET_NAME;

const multer = require('multer');

const multerS3 = require('multer-s3');

const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,

    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

/* --------------------------------- Routes --------------------------------- */

const shopRoutes = require('./routes/shopR');

const adminRoutes = require('./routes/adminR');

const authRoutes = require('./routes/authR');

const cartRoutes = require('./routes/cartR');

/* ------------------------------ Setup engine ------------------------------ */

app.set('views', 'views');

app.set('view engine', 'ejs');

/* ------------------------------- Middleware ------------------------------- */

app.use(helmet());

app.use(compression());

app.use(mongoSanitize());

app.use(xss());

app.use(hpp());

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(multer().array('img'));

app.use(
  session({
    secret:
      'ILPCAw2KQeuBddAQ4opGkzPBhlbFBT5JbQqlpmgwd8CCKnsgJvluH16S6DpudtT7fE0QHhyYPbv6zp8R7O6FsysZOy37N8igR7BR',
    saveUninitialized: false,
    resave: false,
    store,
  })
);

app.use(csrf());

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;

  res.locals.csrfToken = req.csrfToken();

  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://s3.console.aws.amazon.com"
  );

  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://kit.fontawesome.com"
  );

  next();
});

app.use(shopRoutes);

app.use(adminRoutes);

app.use(authRoutes);

app.use(cartRoutes);

app.use((error, req, res, next) => {
  console.log('error:'.red, error);

  console.log('stack'.red.inverse, error.stack);

  console.log('name'.cyan, error.name);
  const statusCode = error.statusCode || 500;

  if (error.name === 'CastError') {
    error.message = 'Kod mebla jest nieprawidłowy';
    error.statusCode = 400;
  }

  const message =
    error.message ||
    'Problem z serwerem. Przepraszamy za problem';

  res.render('error/statusCode', {
    pageTitle: `Error ${statusCode}`,
    statusCode,
    message,
  });
});

/* ------------------------------ Setup server ------------------------------ */

mongoose
  .connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Server connected with DB'.cyan);
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(
        `Server is running on  ${PORT} port`.green.inverse
      );
    });
  })
  .catch((err) => {
    console.log(
      `Problem with connecting DB ${err}`.red.inverse
    );
  });
