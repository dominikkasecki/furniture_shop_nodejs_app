/* -------------------------------------------------------------------------- */
/*                                   MODULES                                  */
/* -------------------------------------------------------------------------- */

const colors = require('colors');

const Furniture = require('../models/Furniture');

const stripe = require('stripe')(process.env.STRIPE_KEY);

const asyncFn = require('../middleware/async');

/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARE                                 */
/* -------------------------------------------------------------------------- */

// @desc      get cart furniture page
// @route     GET /karta
// @access    Private

exports.getCartFurniturePage = asyncFn(
  async (req, res, next) => {
    req.user = await req.user
      .populate('cart.items.furnitureId')
      .execPopulate();

    let sessionId = null;

    if (req.user && req.user.cart.items.length > 0) {
      const session = await stripe.checkout.sessions.create(
        {
          payment_method_types: ['card'],
          line_items: req.user.cart.items.map((el) => {
            return {
              name: el.furnitureId.name,
              description: el.furnitureId.description,
              amount:
                Math.round(el.furnitureId.price) * 100,
              currency: 'usd',
              quantity: el.qty,
            };
          }),
          success_url: `${req.protocol}://${req.get(
            'host'
          )}/order/add`, //=> http://localhost:3000
          cancel_url: `${req.protocol}://${req.get(
            'host'
          )}/order/cancel`,
        }
      );

      sessionId = session.id;
    }

    res.render('shop/cart', {
      pageTitle: 'Karta',
      path: '/karta',
      cartItems: req.user.cart.items,
      totalPrice: req.user.cart.totalPrice,
      sessionId,
    });
  }
);

// @desc      add item to cart
// @route     GET /cart/add/:id
// @access    Private

exports.getCartAddItem = asyncFn(async (req, res, next) => {
  const id = req.params.id;

  const furniture = await Furniture.findById(id);

  if (!furniture) {
    throw {
      message: 'Taki mebel nie istnieje',
      statusCode: 404,
    };
  }

  const cartItem = req.user.cart.items.find(
    (cur) =>
      cur.furnitureId.toString() ===
      furniture._id.toString()
  );

  if (!cartItem) {
    req.user.cart.items.push({
      furnitureId: furniture._id,
      qty: 1,
    });
  } else {
    cartItem.qty += 1;
  }

  req.user.cart.totalPrice += furniture.price;

  await req.user.save();

  res.status(200).redirect('/karta');
});

// @desc      delete item form cart
// @route     GET /cart/delete/:id
// @access    Private

exports.getCartDeleteItem = asyncFn(
  async (req, res, next) => {
    const id = req.params.id;

    const user = await req.user
      .populate('cart.items.furnitureId')
      .execPopulate();

    const delCartItem = user.cart.items.find(
      (el) =>
        el.furnitureId._id.toString() === id.toString()
    );

    if (!delCartItem) {
      throw {
        message:
          'Takie mebel nie istnieje , więc nie można go usunać',
        statusCode: 404,
      };
    }

    user.cart.totalPrice -=
      delCartItem.qty * delCartItem.furnitureId.price;

    user.cart.items = user.cart.items.filter(
      (el) =>
        el.furnitureId._id.toString() !== id.toString()
    );

    await user.save();

    res.status(200).redirect('/karta');
  }
);
