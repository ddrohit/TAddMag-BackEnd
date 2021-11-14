const { body, check } = require('express-validator');

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
      check("age").not().isEmpty().withMessage('Age is mandatory')
      .custom((value)=>{if(value < 5 && value > 150) throw new Error('Invalid Age'); else return true; }),
      check("address").not().isEmpty().withMessage('address is Mandatory'),
      check("district").not().isEmpty().withMessage('district is Mandatory'),
      check("state").not().isEmpty().withMessage('state is Mandatory'),
      /*check("pincode").not().isEmpty().withMessage("Invalid pincode")
      .matches(/^[1-9][0-9]{5}$/).withMessage('Invalid PinCode'),*/
      check("password").not().isEmpty().withMessage('password is Mandatory').isLength({ min: 5 }).withMessage("Invalid password"),
      check("mobileJwt").not().isEmpty().withMessage('mobile not verified'),
      check("paymentJwt").not().isEmpty().withMessage('Payment Not Done')
    ]
  },
  Createorder: () => {
    return [
      check("amount").not().isEmpty().withMessage('amount is mandatory'),
      check("currency").not().isEmpty().withMessage('currency is mandatory')
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
  }
}