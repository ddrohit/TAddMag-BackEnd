const router = require('express').Router();
const AdminController = require('./AdminController');

const RouteConstant = require('../../constant/Routes');
//const Middleware = require('../../cors/middleware').checkToken;
const Validation = require('../../validation/UserValidation');

module.exports = (app) => {
    router.route('/GetUsers')
    .post(
      Validation.getUsers(),
      AdminController.getUsers
    );
    router.route('/GetUserDetails')
    .post(
      Validation.getUserDetails(),
      AdminController.getUserDetails
    );
    app.use(
      RouteConstant.Admin,
      router
    );
  };