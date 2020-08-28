/* -------------------------------------------------------------------------- */
/*                                   MODULES                                  */
/* -------------------------------------------------------------------------- */

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');

const isAuth = require('../middleware/isAuth');

const {
  getAddFurniturePage,
  postAddFurniture,
  getDeleteFurniture,
  getMyFurniturePage,
  getEditFurniturePage,
  postEditFurniture,
} = require('../controllers/adminC');

/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARE                                 */
/* -------------------------------------------------------------------------- */

router.get('/dodaj-mebel', isAuth, getAddFurniturePage);

router.post(
  '/furniture/add',
  isAuth,
  [
    body('name', 'Nazwa mebla jest nieprawidłowa')
      .isLength({ min: 3 })
      .withMessage('Nazwa mebla jest za krótka')
      .isString()
      .trim(),
    body('category', 'Kategoria mebla jest nieprawidłowa')
      .isLength({ min: 3 })
      .withMessage('Kategoria mebla jest za krótka'),
    body(
      'available',
      'Dostępność mebla jest nieprawidłowo napisana'
    )
      .isString()
      .trim(),
    body(
      'timeOfExecution',
      'Czas wykonania musi być liczbą'
    ).isNumeric(),
    body('price', 'Cena mebla musi być liczbą').isNumeric(),
    body('description', 'Opis mebla jest nieprawidłowy')
      .isLength({ min: 20 })
      .withMessage('Opis mebla jest za krótki'),

    body('img', 'Proszę dodać zdjęcie').custom(
      (value, { req }) => {
        console.log('value:', req.files);
        if (req.files.length === 0)
          return Promise.reject('Proszę dodać zdjęcie');

        return true;
      }
    ),
  ],

  postAddFurniture
);

router
  .route('/furniture/edit/:id')
  .get(isAuth, getEditFurniturePage)
  .post(
    isAuth,
    [
      body('name', 'Nazwa mebla jest nieprawidłowa')
        .isLength({ min: 3 })
        .withMessage('Nazwa mebla jest za krótka')
        .isString()
        .trim(),
      body('category', 'Kategoria mebla jest nieprawidłowa')
        .isLength({ min: 3 })
        .withMessage('Kategoria mebla jest za krótka'),
      body(
        'available',
        'Dostępność mebla jest nieprawidłowo napisana'
      )
        .isString()
        .trim(),
      body(
        'timeOfExecution',
        'Czas wykonania musi być liczbą'
      ).isNumeric(),
      body(
        'price',
        'Cena mebla musi być liczbą'
      ).isNumeric(),
      body('description', 'Opis mebla jest nieprawidłowy')
        .isLength({ min: 20 })
        .withMessage('Opis mebla jest za krótki'),
    ],
    postEditFurniture
  );

router.get(
  '/furniture/delete/:id',
  isAuth,
  getDeleteFurniture
);

router.get('/moje-meble', isAuth, getMyFurniturePage);

module.exports = router;
