const router = require('express').Router();
const AdminController = require('./AdminController');
const {checkToken} = require('../../cors/middleware');
const RouteConstant = require('../../constant/Routes');
//const Middleware = require('../../cors/middleware').checkToken;
const Validation = require('../../validation/UserValidation');

module.exports = (app) => {

   router.use(checkToken);

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
    router.route('/GetPayments')
    .post(
      Validation.getPayments(),
      AdminController.getPayments
    );
    router.route('/GetStatistics')
    .post(
      Validation.getStatistics(),
      AdminController.getStatistics
    );
    app.use(
      RouteConstant.Admin,
      router
    );
  };