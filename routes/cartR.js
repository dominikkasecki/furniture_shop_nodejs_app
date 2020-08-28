/* -------------------------------------------------------------------------- */
/*                                   MODULES                                  */
/* -------------------------------------------------------------------------- */

const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/isAuth');

const {
  getCartFurniturePage,
  getCartAddItem,
  getCartDeleteItem,
} = require('../controllers/cartC');

console.log(' getCartFurniturePage:', getCartFurniturePage);
/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARE                                 */
/* -------------------------------------------------------------------------- */

router.get('/karta', isAuth, getCartFurniturePage);

router.get('/cart/add/:id', isAuth, getCartAddItem);

router.get('/cart/delete/:id', isAuth, getCartDeleteItem);

module.exports = router;
