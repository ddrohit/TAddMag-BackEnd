const router = require('express').Router();
const MainControler = require('./MainController');
const RouteConstant = require('../../constant/Routes');
//const Middleware = require('../../cors/middleware').checkToken;
//const Validation = require('../../validation/UserValidation');

module.exports = (app) => {
  router.route('/')
  .get(
    MainControler.SendMain
  );

  app.use(
    RouteConstant.Main,
    router
  );
};