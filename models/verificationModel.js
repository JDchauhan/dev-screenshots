'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VerificationModel = new Schema({
  userID: {
    type: Schema.Types.ObjectId
  },
  key: {
    type: String,
  }
});

module.exports = mongoose.model('verification', VerificationModel, 'verifications');