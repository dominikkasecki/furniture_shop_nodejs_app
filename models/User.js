const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bcrypt = require('bcryptjs');

const crypto = require('crypto');

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Proszę dodać email'],
    minlenght: [3, 'Email jest za krótki'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Proszę podać prawidłowy email',
    ],
    unique: [true, 'Email musi być unikalny'],
  },
  password: {
    type: String,
    required: [true, 'Proszę dodać hasło'],
    minlenght: [3, 'Hasło jest za krótkie'],
    select: false,
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin'],
  },
  resetPasswordToken: String,
  resetTokenExpire: Date,
  cart: {
    items: {
      type: [
        {
          furnitureId: {
            type: Schema.Types.ObjectId,
            ref: 'Furniture',
          },
          qty: {
            type: Number,
            required: [true, 'Item has to have quantity'],
          },
        },
      ],

      default: [],
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.verifyPassword = async function (
  password
) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.createPasswordToken = function () {
  const token = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  return token;
};

module.exports = mongoose.model('User', userSchema);
