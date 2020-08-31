/* -------------------------------------------------------------------------- */
/*                                   MODULES                                  */
/* -------------------------------------------------------------------------- */

const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/isAuth');

const stripeCSP = require('../utils/stripeCSP');

const {
  getCartFurniturePage,
  getCartAddItem,
  getCartDeleteItem,
} = require('../controllers/cartC');

/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARE                                 */
/* -------------------------------------------------------------------------- */

router.get(
  '/karta',
  stripeCSP,
  isAuth,
  getCartFurniturePage
);

router.get(
  '/cart/add/:id',
  stripeCSP,
  isAuth,
  getCartAddItem
);

router.get(
  '/cart/delete/:id',
  stripeCSP,
  isAuth,
  getCartDeleteItem
);

module.exports = router;
