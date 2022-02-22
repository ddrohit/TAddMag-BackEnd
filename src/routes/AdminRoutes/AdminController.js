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
    getUsers: async (req, res) => {
        console.log(req.decode);
        const body = req.body;
        const query = body["query"];
        try{
            const result = await db.query("SELECT user_id, fullname, level, refferedby, mobile_number FROM taddmagusers WHERE mobile_number LIKE $1 AND fullname Like $2 LIMIT $3 OFFSET $4",["%"+query.filterValue[0].value+"%","%"+query.filterValue[1].value+"%",query.limit,query.skip]);
            const resultcount = await db.query("SELECT COUNT(*) FROM taddmagusers WHERE mobile_number LIKE $1 AND fullname Like $2",["%"+query.filterValue[0].value+"%","%"+query.filterValue[1].value+"%"]);
            res.send(reqResponse.successResponse("Sucess","Retrive Data Sucessfull",{rows:result.rows,totalcount:resultcount.rows[0].count})).end();
        }
        catch(error){
            res.send(reqResponse.errorResponse(422,"Error","Required data not supplied",{data:""})).end();
        }
    },
    getPayments: async (req, res) => {
        const body = req.body;
        const query = body["query"];
        try{
            const result = await db.query("SELECT * FROM taddmagtrans WHERE receipt_id LIKE $1 LIMIT $2 OFFSET $3",["%"+query.filterValue[0].value+"%",query.limit,query.skip]);
            const resultcount = await db.query("SELECT COUNT(*) FROM taddmagtrans WHERE receipt_id LIKE $1",["%"+query.filterValue[0].value+"%"]);
            res.send(reqResponse.successResponse("Sucess","Retrive Data Sucessfull",{rows:result.rows,totalcount:resultcount.rows[0].count})).end();
        }
        catch(error){
            res.send(reqResponse.errorResponse(422,"Error","Required data not supplied",{data:""})).end();
        }
    },
    getUserDetails : async (req,res) => {
        const id = req.body["id"]
        try{
            const result = await db.query("SELECT fullname, level, refferedby, address, dateofbirth, mobile_number, no_of_referals, registred_on, referalcode FROM taddmagusers WHERE user_id = $1",[id]);
            res.send(reqResponse.successResponse("Sucess","Retrive Data Sucessfull",{rows:result.rows})).end();
        }
        catch(error){
            res.send(reqResponse.errorResponse(422,"Required data not supplied",{}))
        } 
    },
    getStatistics : async (req,res) =>{
        try{
            const result = await db.query("SELECT fullname, level, refferedby, address, dateofbirth, mobile_number, no_of_referals, registred_on, referalcode FROM taddmagusers WHERE user_id = $1",[id]);
            res.send(reqResponse.successResponse("Sucess","Retrive Data Sucessfull",{rows:result.rows})).end();
        }
        catch(error){
            res.send(reqResponse.errorResponse(422,"Required data not supplied",{}))
        } 
    }
}