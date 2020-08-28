const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  items: {
    type: [
      {
        furnitureId: {
          type: Schema.Types.ObjectId,
          ref: 'Furniture',
        },

        qty: Number,
      },
    ],
    required: [true, 'Items are needed to  make order'],
  },
  totalPrice: {
    type: Number,
    required: [true, 'Order has to have a total price'],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Order has to have own client'],
  },
  email: {
    type: String,
    required: [true, "Order has to have client's email "],
  },
});

module.exports = mongoose.model('Order', orderSchema);
