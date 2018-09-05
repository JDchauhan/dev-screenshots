var mongoose = require('mongoose');
var Transaction = require('../models/transactionModel');
Transaction = mongoose.model('transaction');

var stripe = require("stripe")("sk_test_zYughn70gpvloEOH5AAyH5Ze");

var userController = require('../controllers/userController');

var jsSHA = require("jssha");
exports.payUMoneyPayment = function (req, res) {
    if (!req.body.txnid || !req.body.amount || !req.body.productinfo ||
        !req.body.firstname || !req.body.email) {
        res.send("Mandatory fields missing");
    } else {
        var pd = req.body;
        var hashString = 'eolzYsVq' + // Merchant Key 
            '|' + pd.txnid +
            '|' + pd.amount + '|' + pd.productinfo + '|' +
            pd.firstname + '|' + pd.email + '|' +
            '||||||||||' +
            '1iMiPKZ9hO' // Your salt value
        var sha = new jsSHA('SHA-512', "TEXT");
        sha.update(hashString)
        var hash = sha.getHash("HEX");
        res.send({
            'hash': hash
        });
    }
};

exports.stripePayment = function (req, res) {
    
        // Token is created using Checkout or Elements!
        // Get the payment token ID submitted by the form:
        const token = req.body.id; // Using Express
        
        const charge = stripe.charges.create({
          amount: 999,
          currency: 'usd',
          description: 'Example charge',
          source: token,
        });

        res.send({
            'status': "success"
        })
};

exports.payUMoneyPaymentResponse = function (req, res) {
    var pd = req.body;
    //Generate new Hash 
    var hashString = '1iMiPKZ9hO' + '|' + pd.status + '||||||||||' + '|' + pd.email + '|' + pd.firstname + '|' + pd.productinfo + '|' + pd.amount + '|' + pd.txnid + '|' + 'eolzYsVq'
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
        }, function(err, response){
            if(err){
                if(err.code && err.code == 11000){
                } else {
                    return console.log(err);
                }
                res.send({
                    'status': "Error occured"
                });
            } else {
                userController.addMoney(req, res, pd.email, pd.net_amount_debit);
            }
        })
    } else {
        res.send({
            'status': "Error occured"
        });
    }
}