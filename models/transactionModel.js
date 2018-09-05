'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
},
  amount: {
    type: Number,
  },
  txnID: {
    type: Number,
    unique: true
  },
  generation_timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('transaction', TransactionSchema, 'transaction');