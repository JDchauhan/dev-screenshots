var mongoose = require('mongoose');
var User = require('../models/userModel');
User = mongoose.model('user');

var Verification = require('../models/verificationModel');
Verification = mongoose.model('verification');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');

Mail = require('../helper/mail');
var responses = require('../helper/responses');
var AuthoriseUser = require('../helper/authoriseUser');

module.exports.register = function (req, res) {
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);

    req.body.password = hashedPassword;
    User.create(req.body,
        function (err, user) {
            if (err) {

                if ((err.name && err.name == "UserExistsError") || (err.code && err.code == 11000)) {
                    return responses.errorMsg(res, 409, "Conflict", "user already exists.", null);

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

            // create a token
            var token = jwt.sign({
                id: user._id
            }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
            });

            Verification.create({
                    userID: user._id,
                    key: token
                },
                function (err, verification) {
                    if (err) {
                        return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
                    } else {

                        var link = 'https://screenshot.hexerve.com/verify/email/' + token;

                        Mail.verification_mail(req.body.email, link);

                        return responses.successMsg(res, {email: req.body.email});
                    }
                });

        });
};

module.exports.login = function (req, res) {

    User.findOne({
        email: req.body.email
    }, function (err, user) {

        if (err) {
            console.log(err);
            return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
        }

        if (!user) {
            return responses.errorMsg(res, 404, "Not Found", "user not found", null);
        }

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

        if (!passwordIsValid) {
            errors = {
                auth: false,
                token: null,
                "msg": null
            };
            return responses.errorMsg(res, 401, "Unauthorized", "incorrect password.", errors);
        }

        if (!user.isVerifiedEmail) {
            errors = {
                auth: false,
                token: null,
                "msg": null
            };
            return responses.errorMsg(res, 401, "Unauthorized", "Verify your account to login.", errors);
        }

        var token = jwt.sign({
            id: user._id
        }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
        });

        results = {
            auth: true,
            token: token
        };
        return responses.successMsg(res, results);
    });
};

module.exports.current_user = function (req, res) {
    AuthoriseUser.getUser(req, res, function (user) {
        user.password = undefined;
        user.__v = undefined;
        results = {
            user: user
        };
        return responses.successMsg(res, results);
    });
};

module.exports.changePassword = function (req, res) {
    if (!req.id || req.id.length !== 24) {
        return responses.errorMsg(res, 401, "Unauthorized", "failed to authenticate token.", null);
    }

    User.findById(req.id, function (err, user) {
        if (!user) {
            return responses.errorMsg(res, 404, "Not Found", "user not found.", errors);
        }

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

        if (!passwordIsValid)
            results = {
                user: user
            };
        if (!passwordIsValid) {
            errors = {
                auth: false,
                token: null,
                "msg": null
            };
            return responses.errorMsg(res, 401, "Unauthorized", "incorrect password.", errors);
        }

        if (!user.isVerifiedEmail) {
            errors = {
                auth: false,
                token: null,
                "msg": null
            };
            return responses.errorMsg(res, 401, "Unauthorized", "Verify your account to login.", errors);
        }

        updatePassword(user.id, req.body.newPassword, function (result) {
            if (result) {
                return responses.successMsg(res, null);

            } else {
                return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
            }
        });

    });
};

module.exports.verify = function (req, res) {
    if (!req.id || req.id.length !== 24) {
        return responses.errorMsg(res, 400, "Bad Request", "incorrect user id.");
    }
    Verification.findOneAndRemove({
        userID: req.id
    }, function (err, verified) {
        if (err) {
            return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
        }
        if (!verified) {
            return responses.errorMsg(res, 410, "Gone", "link has been expired.", null);
        } else {
            if (verified.type && verified.type === "pass") {
                AuthoriseUser.getUser(req, res, function (user) {
                    if (!user) {
                        return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
                    }
                    var token = jwt.sign({
                        email: user.email,
                        user: user._id,
                        auth: true,
                        type: "pass"
                    }, config.secret, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    results = {
                        auth: true,
                        token: token
                    };
                    res.render("setPass", {
                        message: JSON.stringify(results)
                    });
                });
            } else {

                let time = new Date();
                let expires = time.setDate(time.getDate() + 15);
                User.findOneAndUpdate({
                    _id: req.id
                }, {
                    isVerifiedEmail: true,
                    expires: expires
                }, function (err, user) {
                    if (err) {
                        return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
                    }

                    if (!user) {
                        return responses.errorMsg(res, 404, "Not Found", "user not found.", null);
                    }
                    user.email_verification = true;
                    return res.render("login", {
                        message: "verified"
                    });
                });
            }
        }
    });
};

function updatePassword(id, pass, callback) {
    var hashedPassword = bcrypt.hashSync(pass, 8);
    User.findOneAndUpdate({
            _id: id,
        }, {
            password: hashedPassword
        },
        function (err, user) {
            if (err) {
                callback(false);
            }
            callback(true);
        });
}


module.exports.setPassword = function (req, res) {
    var token = req.headers.authorization || req.params.token;
    if (!token) {
        let errors = {
            auth: false
        };
        return responses.errorMsg(res, 403, "Forbidden", "no token provided.", errors);
    }

    jwt.verify(token, config.secret, function (err, decoded) {
        if (err || !(decoded.auth && decoded.type && decoded.type === "pass")) {
            return responses.errorMsg(res, 401, "Unauthorized", "failed to authenticate token.", null);
        }

        let id = decoded.user;
        updatePassword(id, req.body.newPassword, function (result) {
            if (result) {
                return responses.successMsg(res, null);

            } else {
                return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
            }
        });

    });

};

module.exports.forgetPassword = function (req, res) {
    User.findOne({
        email: req.body.email
    }, function (err, user) {

        if (err) {
            return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
        }

        if (!user) {
            return responses.errorMsg(res, 404, "Not Found", "user not found.", null);
        }

        var token = jwt.sign({
            id: user._id
        }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
        });

        Verification.findOneAndUpdate({
                userID: user._id
            }, {
                key: token,
                type: "pass"
            },
            function (err, verification) {
                if (err) {
                    return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
                } else {
                    if (!verification) {
                        Verification.create({
                                key: token,
                                userID: user._id,
                                type: "pass"
                            },
                            function (err, verification) {
                                if (err) {
                                    return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
                                }
                                user.password = undefined;

                                var link = 'https://screenshot.hexerve.com/verify/email/' + token;

                                Mail.forgetPass_mail(req.body.email, link);

                                return responses.successMsg(res, null);

                            });
                    } else {
                        user.password = undefined;

                        var link = 'https://screenshot.hexerve.com/verify/email/' + token;

                        Mail.verification_mail(req.body.email, link);

                        return responses.successMsg(res, null);

                    }
                }
            });
    });
};

module.exports.sendVerificationLink = function (req, res) {
    console.log(req.body.email)
    User.findOne({
        email: req.body.email
    }, function (err, user) {

        if (err) {
            return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
        }

        if (!user) {
            return responses.errorMsg(res, 404, "Not Found", "user not found.", null);
        }

        if (user.isVerifiedEmail !== false) {
            return responses.errorMsg(res, 208, "Already Reported", "already verified.", null);
        } else {
            var token = jwt.sign({
                id: user._id
            }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
            });

            Verification.findOneAndUpdate({
                    email: req.body.email
                }, {
                    key: token
                },
                function (err, verification) {
                    if (err) {
                        return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
                    } else {
                        user.password = undefined;

                        var link = 'https://screenshot.hexerve.com/verify/email/' + token;

                        Mail.verification_mail(req.body.email, link);
                        return responses.successMsg(res, null);
                    }
                });
        }
    });
};

module.exports.addMoney = function (req, res, email, plan) {

    User.findOne({
        email: email,
    }, function (err, user) {
        if (err) {
            return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
        } else {
            var expires;
            if (user.expires < Date.now()) {
                let time = new Date();
                expires = time.setDate(time.getDate() + 30);
            } else {
                let time = user.expires;
                expires = time.setDate(time.getDate() + 30);
            }
            User.findOneAndUpdate({
                    email: email,
                }, {
                    plan: plan,
                    expires: expires
                },
                function (err, user) {
                    if (err) {
                        return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
                    } else {
                        user.password = undefined;

                        return responses.successMsg(res, null);
                    }
                });
        }
    });
}