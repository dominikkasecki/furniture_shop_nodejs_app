/* -------------------------------------------------------------------------- */
/*                                   MODULES                                  */
/* -------------------------------------------------------------------------- */

const asyncFn = require('../middleware/async');

const mongoose = require('mongoose');

const colors = require('colors');

const AWS = require('aws-sdk');

const {
  validationResult,
} = require('express-validator/check');

const Furniture = require('../models/Furniture');

const imageHandler = require('../utils/image');

/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARE                                 */
/* -------------------------------------------------------------------------- */

/* --------------------------------- Create --------------------------------- */

// @desc      get add furniture page
// @route     GET  /dodaj-mebel
// @access    Private

exports.getAddFurniturePage = asyncFn((req, res, next) => {
  res.render('admin/furniture', {
    pageTitle: 'Dodaj mebel',
    edit: false,
    error: false,
    input: {
      errors: [],
    },
    path: '/dodaj-mebel',
  });
});

// @desc      post furniture
// @route     POST  /furniture/add
// @access    Private

exports.postAddFurniture = asyncFn(
  async (req, res, next) => {
    const errors = validationResult(req);
    console.log(' errors:', errors.array());

    console.log(req.files);

    const {
      name,
      category,
      available,
      timeOfExecution,
      price,
      description,
    } = req.body;

    if (!errors.isEmpty()) {
      return res.render('admin/furniture', {
        pageTitle: 'Dodaj mebel',
        edit: false,
        error: errors.array()[0].msg,
        input: {
          name,
          category,
          available,
          timeOfExecution,
          price,
          description,
          errors: errors.array(),
        },
        path: '/dodaj-mebel',
      });
    }

    req.body.available = /tak/gi.test(req.body.available);

    await imageHandler(req, true, false);

    req.body.userId = req.session.user._id;

    const furniture = await Furniture.create(req.body);

    if (!furniture) {
      throw {
        message: 'Dodawanie mebla nie powiodło się ',
      };
    }

    return res.status(201).redirect('/moje-meble');
  }
);

/* --------------------------------- Update --------------------------------- */

// @desc      edit furniture page
// @route     GET  /furniture/edit/:id
// @access    Private

exports.getEditFurniturePage = asyncFn(
  async (req, res, next) => {
    const id = req.params.id;

    const furniture = await Furniture.findById(id);

    if (!furniture) {
      throw {
        message: 'Takie mebel nie istnieje',
        statusCode: 404,
      };
    }

    if (
      furniture.userId.toString() !==
      req.session.user._id.toString()
    ) {
      throw {
        message: 'Ten mebel nie jest twój',
        statusCode: 403,
      };
    }

    const {
      _id,
      name,
      category,
      timeOfExecution,
      available,
      price,
      description,
    } = furniture;

    res.render('admin/furniture', {
      pageTitle: 'Edytuj mebel',
      edit: true,
      error: false,
      input: {
        _id: _id.toString(),
        name,
        category,
        timeOfExecution,
        available: available ? 'TAK' : 'NIE',
        price,
        description,
        errors: [],
      },
      path: '/edytuj-mebel',
    });
  }
);

// @desc      edit furniture
// @route     POST /furniture/edit/:id
// @access    Private

exports.postEditFurniture = asyncFn(
  async (req, res, next) => {
    const id = req.params.id;

    const furniture = await Furniture.findById(id);

    if (!furniture) {
      throw {
        message: 'Taki mebel nie istnieje',
        statusCode: 404,
      };
    }

    if (
      furniture.userId.toString() !==
      req.session.user._id.toString()
    ) {
      throw {
        message: 'Ten mebel nie jest twój',
        statusCode: 403,
      };
    }

    const errors = validationResult(req);

    const {
      name,
      category,
      available,
      timeOfExecution,
      price,
      description,
    } = req.body;

    if (!errors.isEmpty()) {
      return res.render('admin/furniture', {
        pageTitle: 'Edytuj mebel',
        edit: true,
        error: errors.array()[0].msg,
        input: {
          _id: furniture._id,
          name,
          category,
          available,
          timeOfExecution,
          price,
          description,
          errors: errors.array(),
        },
        path: '/edytuj-mebel',
      });
    }

    req.body.available = /tak/gi.test(req.body.available);

    /* ---------------------------------- Image --------------------------------- */

    if (req.files.length > 0) {
      req.imagesUrl = furniture.images;

      await imageHandler(req, true, true);
    }

    /* -------------------------------------------------------------------------- */

    await Furniture.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).redirect('/moje-meble');
  }
);

/* --------------------------------- Delete --------------------------------- */

// @desc      delete  furniture
// @route     GET  /furniture/delete/:id
// @access    Private

exports.getDeleteFurniture = asyncFn(
  async (req, res, next) => {
    const id = req.params.id;

    const furniture = await Furniture.findById(id);

    if (!furniture) {
      throw {
        message: 'Takie mebel nie istnieje',
        statusCode: 404,
      };
    }

    if (
      furniture.userId.toString() !==
      req.session.user._id.toString()
    ) {
      throw {
        message: 'Ten mebel nie jest twój!',
        statusCode: 403,
      };
    }

    req.imagesUrl = furniture.images;

    await imageHandler(req, false, true);

    await furniture.remove();

    res.status(200).redirect('/moje-meble');
  }
);

/* ---------------------------------- Read ---------------------------------- */

// @desc      get my   furniture page
// @route     GET  /moje-meble
// @access    Private

exports.getMyFurniturePage = asyncFn(
  async (req, res, next) => {
    const { _id } = req.user;

    const furniture = await Furniture.find({ userId: _id });

    if (!furniture) {
      throw {
        message: 'Takie meble nie istnieją',
        statusCode: 404,
      };
    }

    return res.status(200).render('admin/my-furniture', {
      pageTitle: 'Moje meble',
      path: '/moje-meble',
      furniture,
    });
  }
);
