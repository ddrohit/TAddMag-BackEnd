const jwt = require('jsonwebtoken');
const reqResponse = require('./responseHandler'); 
const config = require('../../config');

module.exports = {
  checkToken
}

function checkToken(req, res, next) {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  if (token) {
    token = token.split(" ")
    if(token.length == 2)
      token = token[1];
    else
      token = "";
    jwt.verify(token, config.ScrectKey, (err, decoded) => {
      if (err) {
        return res.status(414).send(reqResponse.errorResponse(414));
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    next();
  }
}