const PaymentService = require('../../services/PaymentService');
const NetworkService = require('../../services/NetworkService');
const MainService = require('../../services/MainService');
const reqResponse = require('../../cors/responseHandler');
const { validationResult } = require('express-validator');
const config = require('../../../config')
const db = require("../../db")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require("jsonwebtoken")


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
            transaction_id = await PaymentService.CreateCashPayment({Amount:500,type:"Credit",description:"For User Registration Admin"});
            
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
                `INSERT INTO taddmagusers (user_id,first_name, mobile_number, mobile_verified, kyc_status, age, address, city, state, pincode, pancard, aadhar, bank_name, account_number, refferedby, payment_id, password, level,referalcode) 
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING user_id`,
                 [parseInt(count)+1,body["first_name"],body["mobile_number"],true,false,body["age"],body["address"],body["city"],body["state"],body["pincode"],body["pancard"],body["aadhar"],body["bank_name"],body["account_number"],body["refferedby"],transaction_id,hashedPassword,1,referalcode]
            )
            if(body["refferedby"] != null&&body["refferedby"] != "")
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

    Login: async (req,res)=>{

        const errors = validationResult(req);
          if (!errors.isEmpty()) {
              console.log(errors)
              return res.status(422).send(reqResponse.errorResponse(422,"Invalid Data Passed",errors));
          }

          //If username and password is for admin
         if(req.body.mobileno === config.AdminMobile && req.body.password === config.AdminPassword)
         {
            var token = jwt.sign({ Role:"Admin" }, config.ScrectKey, {
                expiresIn: 86400 // expires in 24 hours
            });
            res.send(reqResponse.successResponse(200,"Login Sucessfull",{jwt:token})).end();
         }  
         else
            res.send(reqResponse.successResponse(200,"Invalid Login credentials",{})).end();
      },

}