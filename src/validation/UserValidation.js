const { body, check } = require('express-validator');
const { verifyrefferalcode } = require('../routes/MainRoutes/MainController');

module.exports = {
  Login: () => {
    return [
      check("mobile_number").not().isEmpty().withMessage('mobileno is mandatory')
      .matches(/^(\+\d{1,3}[- ]?)?\d{10}$/).withMessage('Invalid mobile number'),
      check("password").not().isEmpty().withMessage('password is mandatory')
    ]
  },

  Register: () => {
    return [
      check("fullname").not().isEmpty().withMessage('first_name is Mandatory'),
      check("mobile_number").not().isEmpty().withMessage('mobile_number is Mandatory')
      .matches(/^(\+\d{1,3}[- ]?)?\d{10}$/).withMessage('Invalid mobile number'),
      check("dateofbirth").not().isEmpty().withMessage('dateofbirth is mandatory'),
      check("address").not().isEmpty().withMessage('address is Mandatory'),
      check("district").not().isEmpty().withMessage('district is Mandatory'),
      check("state").not().isEmpty().withMessage('state is Mandatory'),
      check("gender").not().isEmpty().withMessage('gender is Mandatory'),
      check("password").not().isEmpty().withMessage('password is Mandatory').isLength({ min: 5 }).withMessage("Invalid password"),
      check("mobileJwt").not().isEmpty().withMessage('mobile not verified'),
      check("paymentJwt").not().isEmpty().withMessage('Payment Not Done')
    ]
  },
  Createorder: () => {
    return [
      check("amount").not().isEmpty().withMessage('amount is mandatory'),
      check("currency").not().isEmpty().withMessage('currency is mandatory'),
      check("receipt_id").not().isEmpty().withMessage('receipt_id is mandatory'),
      check("type").not().isEmpty().withMessage('type is mandatory'),
      check("description").not().isEmpty().withMessage('description is mandatory')
    ]
  },
  SendOtp : () => {
    return [
      check("mobile_number").not().isEmpty().withMessage('mobile_number is Mandatory')
      .matches(/^(\+\d{1,3}[- ]?)?\d{10}$/).withMessage('Invalid mobile number'),
    ]
  },
  VerifyOtp : () => {
    return [
      check("jwtotp").not().isEmpty().withMessage('jwtotp is Mandatory'),
      check("otp").not().isEmpty().withMessage("otp is Mandatory")
    ]
  },
  verifyPayment : () => {
    return [
      check("orderid").not().isEmpty().withMessage('orderid is Mandatory'),
      check("transactioninfo").not().isEmpty().withMessage("transactioninfo is Mandatory")
    ]
  },
  verifyrefferalcode : () => {
    return [
      check("referal").not().isEmpty().withMessage('referal code is Mandatory'),
    ]
  },
  getUsers:()=>{
    return[
      check("query").not().isEmpty().withMessage('query is Mandatory')
    ]
  },
  getUserDetails:()=>{
    return[
      check("id").not().isEmpty().withMessage('id is Mandatory')
    ]
  }
}