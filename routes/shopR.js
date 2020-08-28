/* -------------------------------------------------------------------------- */
/*                                   MODULES                                  */
/* -------------------------------------------------------------------------- */

const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/isAuth');

const {
  getHomePage,
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

router.get('/meble', getFurniturePage);

router.get('/meble/:id', getFurnitureDetailsPage);

router.get('/zamowienia', getOrdersPage);

router.get('/order/add', isAuth, getOrder);

router.get('/order/:id', isAuth, getOrderInvoice);

module.exports = router;
