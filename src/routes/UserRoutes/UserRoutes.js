const router = require('express').Router();
const AdminController = require('./UserController');

const RouteConstant = require('../../constant/Routes');
const {checkToken} = require('../../cors/middleware');
const Validation = require('../../validation/UserValidation');
const UserController = require('./UserController');

module.exports = (app) => {

    router.use(checkToken);

    router.route('/GetDetails')
    .post(
      Validation.getUserDetails(),
      UserController.getUserDetails
    );

    app.use(
      RouteConstant.User,
      router
    );
  };