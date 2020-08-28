const { createInvoice } = require('./invoiceGenerator');

const converter = require('../utils/converter');

const invoiceHandler = (order, res) => {
  const invoice = {
    items: [],
    subtotal: order.totalPrice * 100,
    paid: 0,
    invoice_nr: order._id,
  };

  order.items.forEach((el) => {
    const { price } = el.furnitureId;

    const name = converter(`
    ${el.furnitureId.name.toLowerCase().slice(0, 20)}${
      el.furnitureId.name.length > 20 ? '....' : ''
    }
    `);

    const description = converter(
      `
    ${el.furnitureId.description.slice(0, 30)}${
        el.furnitureId.description.length > 30 ? '....' : ''
      }
    `
    );

    invoice.items.push({
      item: name,
      description,
      amount: price * 100,
      quantity: el.qty,
    });
  });

  return createInvoice(
    invoice,
    `invoice-${order._id}.pdf`,
    res
  );
};

module.exports = invoiceHandler;

// {
//     item: 'TC 100',
//     description: 'Toner Cartridge',
//     quantity: 2,
//     amount: 6000,
//   },
//   {
//     item: 'USB_EXT',
//     description: 'USB Cable Extender',
//     quantity: 1,
//     amount: 2000,
//   },
