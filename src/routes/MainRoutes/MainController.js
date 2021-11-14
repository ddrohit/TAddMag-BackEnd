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

const razorpay = new Razorpay({
    key_id: "rzp_test_8aTrvDwW1OXtqq",
    key_secret: "qdjUb9NnS8Sz8fvPPi1CYUKL",
  });

module.exports = {

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
            transaction_id = await PaymentService.CreateCashPayment({Amount:500,type:"Credit",description:"For User Registration Admin",currency:"INR"});
            
            //Verifying Referal code
            if(body["refferedby"] != null&&body["refferedby"] != ""){
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
                `INSERT INTO taddmagusers (user_id,fullname, mobile_number, mobile_verified, kyc_status, dateofbirth, address, district, state, pancard, aadhar, bank_name, account_number, refferedby, payment_id, password, level,referalcode) 
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING user_id`,
                 [parseInt(count)+1,body["fullname"],body["mobile_number"],true,false,body["dateofbirth"],body["address"],body["district"],body["state"],body["pancard"],body["aadhar"],body["bank_name"],body["account_number"],body["refferedby"],transaction_id,hashedPassword,1,referalcode]
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

    GetStates: async (req,res)=>{
        let States = {"India":["Andhra Pradesh","Telangana"]};
        res.end();
    },

    GetDistricts: async (req,res)=>{
        let districts = {"Andhra Pradesh":["Visakhapatnam","Nellore"],"Telangana":["Hyderabad"]};
        res.end();
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
            var data = await db.query(`SELECT password FROM taddmagusers WHERE mobile_number = $1;`,[req.body.mobile_number])
            if(data.rowCount > 0)
            {
                if(bcrypt.compareSync(req.body.password,data.rows[0].password))
                    res.send(reqResponse.successResponse("Sucess","Login Sucessfull",{})).end();
                else
                    res.send(reqResponse.successResponse("Error","Invalid Login credentials",{})).end();
            }
         }
    },

    SendOtp :async(req,res)=>{
        //Checking the mobilenumber are passed into the request
        const errors = validationResult(req);
          if (!errors.isEmpty()) {
              console.log(errors)
              return res.status(422).send(reqResponse.errorResponse("Error","Invalid Data Passed",{error:errors}));
          }
        //hashing the Otp
        var token = jwt.sign({ otp:"9999", mobile_number:req.body.mobile_number }, config.ScrectKey, {
            expiresIn: "150s" // expires in 24 hours
        });

        res.status(200).send(reqResponse.successResponse("Sucess","Otp Sent Sucessfully",{jwt:token})).end();
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
                res.status(200).send(reqResponse.successResponse("Sucess","OTP Verified Sucessfully",{jwdtoken:token,valid:same}))
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

            //Creating a order in razorpay
            const order = await razorpay.orders.create({
                amount: req.body.amount,
                currency: req.body.currency,
            });

            //Creating a CashPayment Option
            transaction_id = await PaymentService.CreateRazorPayPayment({Amount:500,type:"Credit",description:"For User Registration",currency:"INR",orderid:order.id});
            //Return Status
            res.status(200).send(reqResponse.successResponse(200,"OderCreatiion Sucessfull",{"transactionid":transaction_id,"orderid":order.id}))
        }
        catch(error){
            console.log(error);
            return res.status(400).send(reqResponse.errorResponse(400,"Internal Error",errors));
        }
          
    },

    VerifyOrder: async(req,res) =>{

    }
}