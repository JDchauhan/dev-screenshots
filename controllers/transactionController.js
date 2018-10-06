var mongoose = require('mongoose');
var Transaction = require('../models/transactionModel');
var config = require('../config');
Transaction = mongoose.model('transaction');

var stripe = require("stripe")(config.stripeKey);

var userController = require('../controllers/userController');
var AuthoriseUser = require('../helper/authoriseUser');

var responses = require('../helper/responses');
var Mail = require('../helper/mail');

var jsSHA = require("jssha");
module.exports.payUMoneyPayment = function (req, res) {
    if (!req.body.txnid || !req.body.amount || !req.body.productinfo ||
        !req.body.firstname || !req.body.email) {
        res.send("Mandatory fields missing");
    } else {
        var pd = req.body;
        var hashString = config.merchantKey +
            '|' + pd.txnid +
            '|' + pd.amount + '|' + pd.productinfo + '|' +
            pd.firstname + '|' + pd.email + '|' +
            '||||||||||' +
            config.merchantSalt;
        var sha = new jsSHA('SHA-512', "TEXT");
        sha.update(hashString)
        var hash = sha.getHash("HEX");
        res.send({
            'hash': hash
        });
    }
};

module.exports.stripePayment = function (req, res) {
    let planID = parseInt(req.params.planID);
    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    const token = req.body.id; // Using Express

    let planAmount = 499;
    let plan = "lite";
    switch (planID) {
        case 1:
            break;
        case 2:
            plan = "professional";
            planAmount = 999;
            break;
        case 3:
            plan = "enterprise";
            planAmount = 1999;
            break;
        default:
            console.log(err);
            return res.send({
                'status': "Error occured"
            });
    }

    const charge = stripe.charges.create({
        amount: planAmount,
        currency: 'usd',
        description: 'Example charge',
        source: token,
    }, function (err, charge) {
        if (err) {
            console.log(err);
            return res.send({
                'status': "Error occured"
            });
        }

        Transaction.create({
            email: req.body.email,
            amount: planAmount,
            txnID: charge.id
        }, function (err, response) {
            if (err) {
                console.log(err);
                return;
            }

            userController.createTransaction(req, res, req.body.email, plan, response._id);

            Mail.invoice(req.body.email, planAmount, plan);
    
        });
    });
};

module.exports.payUMoneyPaymentResponse = function (req, res) {
    var pd = req.body;
    //Generate new Hash 
    var hashString = config.merchantSalt + '|' + pd.status + '||||||||||' + '|' + pd.email + '|' + pd.firstname + '|' + pd.productinfo + '|' + pd.amount + '|' + pd.txnid + '|' + config.merchantKey;
    var sha = new jsSHA('SHA-512', "TEXT");
    sha.update(hashString)
    var hash = sha.getHash("HEX");
    // Verify the new hash with the hash value in response
    //pd.net_amount_debit,
    //pd.payuMoneyId,
    if (hash == pd.hash) {

        Transaction.create({
            email: pd.email,
            amount: pd.net_amount_debit,
            txnID: pd.payuMoneyId
        }, function (err, response) {
            if (err) {
                if (err.code && err.code == 11000) {} else {
                    return console.log(err);
                }
                res.send({
                    'status': "Error occured"
                });
            } else {
                userController.addMoney(req, res, pd.email);
            }
        })
    } else {
        res.send({
            'status': "Error occured"
        });
    }
}

// module.exports.getAllTransactions = function (req, res) {
//     AuthoriseUser.getUser(req, res, function (user) {
//         Transaction.find({
//             email: user.email
//         }, {
//             _id: 0,
//             __v: 0
//         }, function (err, transactions) {
//             if (err) {
//                 console.log(err);
//                 return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
//             }

//             if (!transactions) {
//                 return responses.errorMsg(res, 404, "Not Found", "transactions not found.", null);
//             }

//             return responses.successMsg(res, transactions);
//         });
//     });
// };

module.exports.createSubscription = function (req, res, userId, email, custId, plan) {
    stripe.subscriptions.create({
        customer: custId,
        items: [{
            plan: plan,
        }, ]
    }, function (err, subscription) {
        if (err) {
            console.log(err);
            return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
        }

        plan = plan.split('_')[2];
        userController.stripeSubscription(req, res, userId, custId, subscription.id, plan, email);
    });
};

module.exports.createCust = function (req, res) {
    AuthoriseUser.getUser(req, res, function (user) {
        let plan = req.body.plan;

        if (!user.subscription.stripeCustId && !user.subscription.stripeSubsId) {
            stripe.customers.create({
                description: 'Screenshot customer',
                email: user.email,
                source: req.body.id,
            }, function (err, customer) {
                if (err) {
                    console.log(err);
                    return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
                }

                userController.stripeCust(req, res, customer.id, user._id, function (success) {
                    if (success) {
                        module.exports.createSubscription(req, res, user._id, user.email, customer.id, plan);
                    }
                });

            });
        } else if (!user.subscription.stripeSubsId) {
            module.exports.createSubscription(req, res, user._id, user.email, user.subscription.stripeCustId, plan);
        } else {
            return responses.errorMsg(res, 208, "Already Reported", "already reported.", null);
        }
    });
};

module.exports.cancelSubscription = function (req, res) {
    AuthoriseUser.getUser(req, res, function (user) {
        stripe.subscriptions.del(
            user.subscription.stripeSubsId,
            function (err, confirmation) {
                if (err) {
                    console.log(err);
                    return responses.errorMsg(res, 500, "Unexpected Error", "unexpected error.", null);
                }
                
                let prevSubs = {
                    stripeSubsId: user.subscription.stripeSubsId,
                    plan: user.plan,
                    start: confirmation.current_period_start * 1000,
                    end: confirmation.current_period_end * 1000
                };
                userController.cancelSubscription(req, res, user._id, user.subscription.stripeCustId, prevSubs);
            }
        );
    });
};