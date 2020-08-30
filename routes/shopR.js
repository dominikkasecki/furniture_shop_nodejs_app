/* -------------------------------------------------------------------------- */
/*                                   MODULES                                  */
/* -------------------------------------------------------------------------- */

const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/isAuth');

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

const {
  getHomePage,
  postSendMessage,
  getFurniturePage,
  getFurnitureDetailsPage,
  getOrdersPage,
  getOrder,
  getOrderInvoice,
} = require('../controllers/shopC');

/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARE                                 */
/* -------------------------------------------------------------------------- */

router.get('/', getHomePage);

router.post('/send-message', limiter, postSendMessage);

router.get('/meble', getFurniturePage);

router.get('/meble/:id', getFurnitureDetailsPage);

router.get('/zamowienia', getOrdersPage);

router.get('/order/add', isAuth, getOrder);

router.get('/order/:id', isAuth, getOrderInvoice);

module.exports = router;
