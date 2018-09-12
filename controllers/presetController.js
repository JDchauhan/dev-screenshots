var mongoose = require('mongoose');
var Preset = require('../models/presetModel');
Preset = mongoose.model('preset');

var User = require('../controllers/userController');

var responses = require('../helper/responses');

module.exports.create = function (req, res) {
    Preset.create({
            name: req.body.name,
            devices: req.body.devices
        },
        function (err, preset) {
            if (err) {

                if (err.code && err.code == 11000) {
                    return responses.errorMsg(res, 409, "Conflict", "preset already exists.", null);

                } else if (err.name && err.name == "ValidationError") {
                    errors = {
                        "index": Object.keys(err.errors)
                    };
                    return responses.errorMsg(res, 400, "Bad Request", "validation failed.", errors);

                } else if (err.name && err.name == "CastError") {
                    errors = {
                        "index": err.path
                    };
                    return responses.errorMsg(res, 400, "Bad Request", "cast error.", errors);

                } else {
                    console.log(err);
                    return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
                }
            }
            User.addPreset(req, res, preset._id);

        });
};