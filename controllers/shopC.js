/* -------------------------------------------------------------------------- */
/*                                   MODULES                                  */
/* -------------------------------------------------------------------------- */

const nodemailer = require('nodemailer');

const sendGrid = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(
  sendGrid({
    auth: {
      api_key: process.env.SENDGRID_KEY,
    },
  })
);

const asyncFn = require('../middleware/async');

const Furniture = require('../models/Furniture');

const Order = require('../models/Order');

const invoiceHandler = require('../utils/invoice');

/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARE                                 */
/* -------------------------------------------------------------------------- */

// @desc      get home page
// @route     GET /
// @access    Public

exports.getHomePage = asyncFn((req, res, next) => {
  res.render('shop/home', {
    pageTitle: 'Sklep Dominika',
    path: '/',
  });
});

// @desc      send a message
// @route     GET /send-message
// @access    Public

exports.postSendMessage = asyncFn(
  async (req, res, next) => {
    const { name, email, subject, message } = req.body;

    res.status(200).redirect('/meble');

    return transporter.sendMail({
      from: 'dominikus.pt@interia.pl',
      to: 'dominikus.pt@interia.pl',
      subject: `${name} - ${subject}`,
      html: `
      <h1>${subject}</h1>
      <p> ${message}</p>
       <h5>Wiadomość od ${name}  , z emailem ${email}</h5>
      
      `,
    });
  }
);

// @desc      get furniture page
// @route     GET /meble
// @access    Public

exports.getFurniturePage = asyncFn(
  async (req, res, next) => {
    const furniture = await Furniture.find();

    res.render('shop/furniture', {
      pageTitle: 'Meble',
      furniture,
      path: '/meble',
    });
  }
);

// @desc      get furniture details page
// @route     GET /furnitre/:id
// @access    Public
exports.getFurnitureDetailsPage = asyncFn(
  async (req, res, next) => {
    const id = req.params.id;

    const piece = await Furniture.findById(id);

    if (!piece) {
      throw {
        message: 'Nie ma takiego mebla',
        statusCode: 404,
      };
    }

    res.render('shop/furniture-details', {
      pageTitle: `Mebel ${id}`,
      piece,
      path: '/meble',
    });
  }
);

// @desc      get orders page
// @route     GET /zamowienia
// @access    Private

exports.getOrdersPage = asyncFn(async (req, res, next) => {
  const orderItems = await Order.find();

  res.render('shop/orders', {
    pageTitle: 'Zamówienia',
    path: '/zamowienia',
    orderItems,
  });
});

// @desc      add cart items to order
// @route     GET /order/add
// @access    Private

exports.getOrder = asyncFn(async (req, res, next) => {
  if (req.user.cart.items.length === 0) {
    throw {
      message:
        'Nie można złożyć zamówienia bez produktów w koszyku',
      statusCode: 400,
    };
  }
  const user = await req.user
    .populate('cart.items.furnitureId')
    .execPopulate();

  const order = new Order({
    items: user.cart.items,
    totalPrice: user.cart.totalPrice,
    userId: user._id,
    email: req.user.email,
  });

  await order.save();

  user.cart = {
    items: [],
    totalPrice: 0,
  };

  await user.save();

  res.status(200).redirect('/zamowienia');
});

// @desc      download invoice from order
// @route     GET /order/:id
// @access    Private

exports.getOrderInvoice = asyncFn(
  async (req, res, next) => {
    const id = req.params.id;

    let order = await Order.findById(id);

    if (!order) {
      throw {
        message: 'Takie zamówienie nie istnieje',
        statusCode: 404,
      };
    }

    order = await order
      .populate('items.furnitureId')
      .execPopulate();

    if (
      order.userId.toString() !== req.user._id.toString()
    ) {
      throw {
        message: 'Możesz pobierać tylko swoją fakturę ',
      };
    }

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${id}.pdf"`
    );
    res.setHeader('Contenty-Type', 'application/pdf');

    return invoiceHandler(order, res);

    /* -------------------------------------------------------------------------- */
  }
);
