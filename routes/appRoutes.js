'use strict';
module.exports = function (app) {
    var rimraf = require('rimraf');
    var fs = require('fs');

    var transactionController = require('../controllers/transactionController');

    var User = require('../controllers/userController');
    var Preset = require('../controllers/presetController');
    var screenshot = require('../helper/screenshot');
    var responses = require('../helper/responses');
    var VerifyToken = require('../helper/verifyToken');

    // user Routes
    app.get("/", function (req, res) {
        var error;
        if (req.query.fileErr && req.query.fileErr === "true") {
            error = true;
        } else {
            error = false;
        }
        res.render("dashboard", {
            error: error
        });
    });

    app.post("/", screenshot.screenshotTaker);

    app.get("/login", function (req, res) {
        res.render("login", {
            message: false
        });
    });

    app.get("/resetpass", function (req, res) {
        res.render("resetPass");
    });

    app.get("/plans", function (req, res) {
        res.render("plans");
    });

    app.post("/login", User.login);

    app.post("/register", User.register);

    app.post("/reverify", User.sendVerificationLink);

    app.put("/password/reset", VerifyToken, User.changePassword);

    app.get("/password/forget", function (req, res) {
        res.render("forgetPass");
    });

    app.put("/password/forget", User.forgetPassword);

    app.get("/password/set", function (req, res) {
        res.render("setPass",{
            message: null
        });
    });

    app.put("/password/set", User.setPassword);

    app.get('/verify/email/:token', VerifyToken, User.verify);

    app.get("/user", VerifyToken, User.current_user);

    app.get("/user/preset", VerifyToken, User.current_user_preset);

    app.post("/preset/add", VerifyToken, Preset.create);

    app.get("/payment", function (req, res) {
        res.render("payment");
    });

    app.post('/verify/email', User.sendVerificationLink);

    app.get("/download/:filename", function (req, res) {
        var file = "downloads/" + req.params.filename;
        if (fs.existsSync(file)) {
            res.download(file);
        } else {
            res.redirect(301, "../?fileErr=true");
        }
    });

    //transactions
    //app.post('/payment/payumoney',transactionController.payUMoneyPayment);

    app.post('/payment/stripe/:planID', transactionController.stripePayment);

    //app.post('/payment/payumoney/response', transactionController.payUMoneyPaymentResponse);

    // star routes
    app.get('*', function (req, res) {
        res.redirect(301, "../");
    });

    app.put('*', function (req, res) {
        res.redirect(301, "../");
    });

    app.delete('*', function (req, res) {
        res.redirect(301, "../");
    });

    app.post('*', function (req, res) {
        res.redirect(301, "../");
    });

};