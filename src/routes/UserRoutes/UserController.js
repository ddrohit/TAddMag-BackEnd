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
    Login: async (req, res) => {
        const body = req.body;
        if(body["mobileno"] === config.AdminMobile && body["password"] === config.AdminPassword){
            res.status(200).send(reqResponse.successResponse(200,"Login Sucessfull",{}));
        }
        else{
            res.status(401).send(reqResponse.successResponse(401,"Invalid credentials",{}))
        }
    }
}