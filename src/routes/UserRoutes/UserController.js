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
    getUserDetails: async (req,res)=>{
        const id = req.decoded.user_id;
            try{
                const result = await db.query("SELECT fullname, level, refferedby, address, dateofbirth, mobile_number, no_of_referals, registred_on, referalcode FROM taddmagusers WHERE user_id = $1",[id]);
                res.send(reqResponse.successResponse("Sucess","Retrive Data Sucessfull",{rows:result.rows})).end();
            }
        catch(error){
            res.send(reqResponse.errorResponse(422,"Required data not supplied",{}))
        }
    }
}