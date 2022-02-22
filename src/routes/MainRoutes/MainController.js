const PaymentService = require('../../services/PaymentService');
const NetworkService = require('../../services/NetworkService');
const MainService = require('../../services/MainService');
const reqResponse = require('../../cors/responseHandler');
const { validationResult, body } = require('express-validator');
const config = require('../../../config');
const db = require("../../db");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const crypto = require('crypto');
require('dotenv').config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });

  /**
   * Module for basic auths
   * @module GeneralFunctions
   */
module.exports = {
    /**
     * 
     * @param {Request} req Request object 
     * @param {Response} res Respose Object
     */
	SendMain: async (req, res) => {
        var Time = await MainService.GetTime();
		res.send("TAddMag "+Time);
	},

    //Controller For User Registration
	Register: async (req,res) =>{
		//Check for valid params
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors)
			return res.status(422).send(reqResponse.errorResponse(422,"Invalid Data Passed",errors));
		}

        // Getting the Request Body
        const body = req.body;
        
        let transaction_id;
		try{
            //Creating a CashPayment Option
            if((body["transaction_id"] ? true : false) && (req.headers['x-access-token'] || req.headers['authorization'] ? true : false))
            {
                let token = req.headers['x-access-token'] || req.headers['authorization'];
                if (token) {
                  token = token.split(" ")
                  if(token.length == 2)
                    token = token[1];
                  else
                    token = "";
                  jwt.verify(token, config.ScrectKey, async (err, decoded) =>  {
                    if (err) {
                      return res.status(403).send(reqResponse.errorResponse(403));
                    } else {
                      req.decoded = decoded;
                      transaction_id = await PaymentService.CreateCashPayment({Amount:500*100,type:"Credit",description:"For User Registration Admin",currency:"INR"});
                    }
                  });
                } else {
                  return res.status(403).send(reqResponse.errorResponse(403)).end();
                }
            }
            if(body['transaction_id'] ? true : false)
                transaction_id = body['transaction_id'];
            else
                return res.status(401).send(reqResponse.errorResponse(403)).end();
            //Verifying Referal code
            if(body["refferedby"] != null && body["refferedby"] != ""){
                const result = await db.query(
                    `SELECT * from taddmagusers WHERE referalcode = $1;`,
                    [body["refferedby"]]
                );
                if(result.rows.length == 0)
                    throw "Invalid Referal Code";
            }

            //Adding a new user into the db
            let TotalUsers = await db.query(`SELECT MAX(user_id) FROM taddmagusers;`);
            let count = TotalUsers.rows[0].max == null?  0: TotalUsers.rows[0].max;

            const hashedPassword = bcrypt.hashSync(body["password"], saltRounds);
            var d = new Date();
            let referalcode = "TG"+d.getFullYear()+(parseInt(count)+1); 
            
            let result = await db.query(
                `INSERT INTO taddmagusers (user_id,fullname, mobile_number, gender, mobile_verified, kyc_status, dateofbirth, address, district, state, pancard, aadhar, bank_name, account_number, refferedby, payment_id, password, level,referalcode,money_spent) 
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING user_id`,
                 [parseInt(count)+1,body["fullname"],body["mobile_number"],body["gender"],true,false,body["dateofbirth"],body["address"],body["district"],body["state"],body["pancard"],body["aadhar"],body["bank_name"],body["account_number"],body["refferedby"],transaction_id,hashedPassword,1,referalcode,500*100]
            )
            if(body["refferedby"] != null && body["refferedby"] != "")
             result = await db.query(
                `UPDATE taddmagusers SET no_of_referals = no_of_referals + 1 WHERE referalcode = $1;`,
                 [body["refferedby"]]
            );

            //Check for any promotions
            await NetworkService.checkAllLevelPromotion();
            res.send(referalcode).end();
        }
        catch(err){

            //For Mobile Number Already Present
            if(err.constraint == "taddmagusers_mobile_number_key"){
                res.send("Mobile number already present.").end();
                await PaymentService.DeleteCashPayment(transaction_id);
            } 

            //If The Referal Code Is Invalid
            else if(err == "Invalid Referal Code"){
                res.send("Invalid Referal Code").end();
                await PaymentService.DeleteCashPayment(transaction_id);
            }

            //For Somthing Else Its Broken
            else{
                console.log(err);
                res.status(500).end();
            }
        }
	},

    //Login into the app
    Login: async (req,res)=>{

        //Checking the username and password are passed into the request
        const errors = validationResult(req);
          if (!errors.isEmpty()) {
              console.log(errors)
              return res.status(422).send(reqResponse.errorResponse("Error","Invalid Data Passed",errors));
          }
        //If username and password is for admin
         else if(req.body.mobile_number === config.AdminMobile && req.body.password === config.AdminPassword)
         {
            var token = jwt.sign({ Role:"Admin" }, config.ScrectKey, {
                expiresIn: 86400 // expires in 24 hours
            });
            res.send(reqResponse.successResponse("Sucess","Login Sucessfull",{jwt:token})).end();
         }  
         //If the username and password is for user
         else
         {
            var data = await db.query(`SELECT password,user_id FROM taddmagusers WHERE mobile_number = $1;`,[req.body.mobile_number])
            if(data.rowCount > 0)
            {
                if(bcrypt.compareSync(req.body.password,data.rows[0].password))
                {
                    var token = jwt.sign({ Role:"User", user_id:data.rows[0].user_id }, config.ScrectKey);
                    res.send(reqResponse.successResponse("Sucess","Login Sucessfull",{jwt:token})).end();
                }
                else
                    res.send(reqResponse.successResponse("Error","Invalid Login credentials",{})).end();
            }
            else
            res.send(reqResponse.successResponse("Error","Invalid Login credentials",{})).end(); 
         }
    },

    SendOtp :async(req,res)=>{
        //Checking the mobilenumber are passed into the request
        const errors = validationResult(req);
        try{
        if (!errors.isEmpty()) {
            console.log(errors)
            return res.status(422).send(reqResponse.errorResponse("Error","Invalid Data Passed",{error:errors}));
        }
        else
        {
            var result = await db.query(
                `Select mobile_number from taddmagusers Where mobile_number = $1`,
                 [req.body.mobile_number]
            );
            if(result.rows.length !== 0 )
            {
                return res.status(200).send(reqResponse.successResponse("Error","Mobile Number already Registred",{}));
            }
            else
            {
                //hashing the Otp
                var token = jwt.sign({ otp:"9999", mobile_number:req.body.mobile_number }, config.ScrectKey, {
                    expiresIn: "150s" // expires in 24 hours
                });

                res.status(200).send(reqResponse.successResponse("Sucess","Otp Sent Sucessfully",{jwt:token})).end();
                }
            }
        }
        catch(e){console.log(e);}
    },

    VerifyOtp: async(req,res) =>{
        //ckecking the hashed otp is passed into request
        const errors = validationResult(req);
          if (!errors.isEmpty()) {
              console.log(errors)
              return res.status(422).send(reqResponse.successResponse("Error","Invalid Data Passed",{errors:errors}));
          }
        //verifing the jwt
        try{
            const decode = jwt.verify(req.body.jwtotp,config.ScrectKey)
            const same = decode.otp == req.body.otp;
            if(same == true)
            {
                //hashing the Otp
                var token = jwt.sign({ mobile_number:decode.mobile_number,verified:true }, config.ScrectKey, {
                    expiresIn: "24hr" // expires in 24 hours
                });
                res.status(200).send(reqResponse.successResponse("Sucess","OTP Verified Sucessfully",{jwt:token,valid:same}))
            }
            else{
                res.status(200).send(reqResponse.successResponse("Error","OTP didn't match",{valid:same}))
            }
        }
        catch(error){
            res.status(200).send(reqResponse.successResponse("Error","OTP Expired",{valid:false}));
        }
    },

    CreateOrder: async(req,res) =>{

        //Check for valid params
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors)
			return res.status(422).send(reqResponse.errorResponse(422,"Invalid Data Passed",errors));
		}

        let transaction_id;
		try{
            const amount = req.body.amount,
                  currency = req.body.currency,
                  receipt_id = req.body.receipt_id,
                  type = req.body.type,
                  description = req.body.description;
            //Creating a order in razorpay
            const order = await razorpay.orders.create({
                amount: amount,
                currency:currency ,
                receipt: receipt_id
            });
            try{
                //Creating a CashPayment Option
                transaction_id = await PaymentService.CreateRazorPayPayment({Amount:amount,type:type,description:description,currency:currency,orderid:order.id,receipt_id:receipt_id});
                //Return Status
                res.status(200).send(reqResponse.successResponse(200,"OderCreatiion Sucessfull",{"transactionid":transaction_id,"orderid":order.id}))
            }
            catch(Exception){
                //Return Status
                return res.status(400).send(reqResponse.errorResponse(400,"Internal Error",errors));
            }
        }
        catch(error){
            console.log(error);
            return res.status(400).send(reqResponse.errorResponse(400,"Internal Error",errors));
        }
          
    },

    VerifyPayment: async(req,res) =>{
        try{
            const { orderid,transactioninfo } = req.body;
            const generatedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
                .update(`${orderid}|${transactioninfo.razorpay_payment_id}`)
                .digest("hex");
            const result = generatedSignature === transactioninfo.razorpay_signature;
            if(result){
                transaction_id = await PaymentService.PaymentSucessfull({orderid:orderid,razorpay_trans_id:transactioninfo.razorpay_payment_id});
            }
            else
            {
                transaction_id = await PaymentService.PaymentFailure({orderid:orderid,razorpay_trans_id:transactioninfo.razorpay_payment_id}); 
            }
            return res.status(200).send(reqResponse.successResponse(200,"Payment Sucessfull",{validSignature:result}));
        }
        catch(err){
            console.log(err);
            return res.status(400).send(reqResponse.errorResponse(400,"Internal Error",err));
        }
    },

    verifyrefferalcode: async(req,res)=>{
        const result = await db.query(
            `SELECT referalcode from taddmagusers WHERE referalcode = $1;`,
            [req.body["referalcode"]]
        );
        if(result.rows.length !== 0)
            res.status(200).send(reqResponse.successResponse(200,"Valid Referal",{validreferal:true}));
        else
            res.status(200).send(reqResponse.successResponse(200,"Invalid Referal Code",{validreferal:false}));
    }
}