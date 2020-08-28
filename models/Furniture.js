const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const furnitureSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Proszę podać nazwę meblu'],
    minlength: [
      3,
      'Nazwa mebla musi zawierać minimalnie 3 znaki',
    ],
  },
  description: {
    type: String,
    required: [true, 'Proszę dodać opis mebla'],
    minlength: [
      20,
      'Opis mebla musi zawierać minimalnie 20 znaków',
    ],
  },
  category: {
    type: String,
    required: ['Mebel musi zawierać kategorię'],
    minlength: [
      3,
      'Nazwa kategorii musi zawierać minimalnie 3 znaki',
    ],
  },
  available: {
    type: Boolean,
    default: false,
  },
  timeOfExecution: {
    type: Number,
    default: 1,
    required: [true, 'Mebel musi zawierać czas wykonania'],
  },
  price: {
    type: Number,
    required: [true, 'Mebel musi posiadać cenę'],
  },
  images: {
    type: [String],
    required: [true, 'Proszę dodać zdjęcia mebla'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },

  userId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Mebel musi mieć swoje autora'],
    ref: 'User',
  },
});

module.exports = mongoose.model(
  'Furniture',
  furnitureSchema
);
