'use strict';
var jwt = require('jsonwebtoken');
var config = require('../config');
var responses = require('./responses');

function verifyToken(req, res, next) {
  var token = req.headers.authorization || req.params.token;
  if (!token) {
    let errors = {
      auth: false
    };
    return responses.errorMsg(res, 403, "Forbidden", "no token provided.", errors);
  }

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return responses.errorMsg(res, 401, "Unauthorized", "failed to authenticate token.", null);
    }
    req.id = decoded.id;

    next();
  });
}
module.exports = verifyToken;