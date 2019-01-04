'use strict';
module.exports = function (app) {
    var rimraf = require('rimraf');
    var fs = require('fs');

    var transactionController = require('../controllers/transactionController');

    var User = require('../controllers/userController');
    var Transaction = require('../controllers/transactionController');
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

    app.get('/invoice/:email_1/:email_2/:type/:id/:plan/:amount', function(req, res){
        res.render('invoice', {
            email: req.params.email_1 + '@' + req.params.email_2,
            subscription: req.params.type === 'subscription' ? true : false,
            id: req.params.id,
            plan: req.params.plan,
            amount: req.params.amount
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

    app.get("/profile", function (req, res) {
        res.render("profile");
    });

    app.get("/admin", function (req, res) {
        res.render("admin");
    });

    app.get("/subscribe", function (req, res) {
        res.render("subscribe");
    });

    app.post("/login", User.login);

    app.get("/logout", VerifyToken, User.logout);

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

    app.put("/user", VerifyToken, User.updatePersonalInfo);

    app.get("/user/transaction", VerifyToken, User.getAllTransactions);

    app.get("/transaction", function (req, res) {
        res.render("transactions");
    });

    app.get("/adminAcesss/user/:info/:value", VerifyToken, User.getUserData);

    app.get("/adminAcesss/status/:email/:status", VerifyToken, User.changeStatus);

    app.get("/adminAcesss/stats", VerifyToken, User.stats);

    app.get("/adminAcesss/revoke/:email", VerifyToken, User.revoke);

    app.put("/adminAcesss/user", VerifyToken, User.updateUser);

    app.post("/adminAcesss/register", VerifyToken, User.registerUserByAdmin);

    app.get("/user/preset", VerifyToken, User.current_user_preset);

    app.post("/preset", VerifyToken, Preset.create);

    app.delete("/preset", VerifyToken, Preset.delete);

    app.get("/payment", function (req, res) {
        res.render("payment");
    });

    app.get("/tutorial", function (req, res) {
        res.render("tutorial");
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

    app.post('/customer/subscription', VerifyToken, transactionController.createCust);
    
    app.delete('/customer/subscription', VerifyToken, transactionController.cancelSubscription);
    
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