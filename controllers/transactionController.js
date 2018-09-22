var mongoose = require('mongoose');
var Transaction = require('../models/transactionModel');
var config = require('../config');
Transaction = mongoose.model('transaction');

var stripe = require("stripe")(config.stripeKey);

var userController = require('../controllers/userController');

var jsSHA = require("jssha");
exports.payUMoneyPayment = function (req, res) {
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

exports.stripePayment = function (req, res) {
    let planID = parseInt(req.params.planID);
    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    const token = req.body.id; // Using Express

    let planAmount = 100;
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
            }
        });

        userController.addMoney(req, res, req.body.email, plan);
    });
};

exports.payUMoneyPaymentResponse = function (req, res) {
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