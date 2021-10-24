const router = require('express').Router();
const MainControler = require('./MainController');

const RouteConstant = require('../../constant/Routes');
//const Middleware = require('../../cors/middleware').checkToken;
const Validation = require('../../validation/UserValidation');

module.exports = (app) => {
  router.route('/')
  .get(
    MainControler.SendMain
  );

  //For User Registrarion
  router.route('/Register')
  .post(
    Validation.Register(),
    MainControler.Register
  );

  router.route('/SendOtp').post();

  /*
  router.route("/VerifyOtp").post(
    Validation.VerifyOtp(),
    MainControler.VerifyOtp
  );
*/
  router.route("/VerifyOnlinePayment").post();

  //For User Login
  router.route('/Login')
  .post(
    Validation.Login(),
    MainControler.Login
  );

  app.use(
    RouteConstant.Main,
    router
  );
};