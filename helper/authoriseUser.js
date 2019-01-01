var mongoose = require('mongoose');
var User = require('../models/userModel');
User = mongoose.model('user');
var responses = require('../helper/responses');

module.exports.getUser = function (req, res, callback) {
    if (!req.id || req.id.length !== 24) {
        return responses.errorMsg(res, 401, "Unauthorized", "failed to authenticate token.", null);
    }

    User.findById(req.id, {
            password: 0
        }, // projection
        function (err, user) {

            if (err) {
                return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
            }

            if (!user) {
                return responses.errorMsg(res, 404, "Not Found", "user not found.", null);
            }
            callback(user);
        });
};