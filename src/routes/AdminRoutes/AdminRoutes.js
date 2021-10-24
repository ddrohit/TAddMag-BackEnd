const router = require('express').Router();
const AdminController = require('./AdminController');

const RouteConstant = require('../../constant/Routes');
//const Middleware = require('../../cors/middleware').checkToken;
const Validation = require('../../validation/UserValidation');

module.exports = (app) => {
    router.route('/Login')
    .get(
      Validation.Login(),
      AdminController.Login
    );
    app.use(
      RouteConstant.Admin,
      router
    );
  };