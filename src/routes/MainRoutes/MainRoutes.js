//* */

const router = require('express').Router();
const MainControler = require('./MainController');
const crypto = require('crypto');
const RouteConstant = require('../../constant/Routes');
//const Middleware = require('../../cors/middleware').checkToken;
const Validation = require('../../validation/UserValidation');
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "rzp_test_8aTrvDwW1OXtqq",
  key_secret: "qdjUb9NnS8Sz8fvPPi1CYUKL",
});

module.exports = (app) => {router.route('/').get( MainControler.SendMain);

  //For User Registrarion
  router.route('/Register').post(Validation.Register(),MainControler.Register);
  
  //For Otp
  router.route('/SendOtp').post(Validation.SendOtp(),MainControler.SendOtp);

  //For Otp
  router.route('/VerifyOtp').post(Validation.VerifyOtp(),MainControler.VerifyOtp);

  //For User Login
  router.route('/Login').post(Validation.Login(),MainControler.Login);

  //For creatingh a order
  router.route('/CreateOrder').post(Validation.Createorder(),MainControler.CreateOrder)

  //Veriding and capturing the payment
  router.route('/VerifyPayment').post(Validation.verifyPayment(),MainControler.VerifyPayment)

  //verifing the referal code
  router.route('/VerifyReferal').post(Validation.verifyrefferalcode(),MainControler.verifyrefferalcode)

  app.use(RouteConstant.Main,router);
};

