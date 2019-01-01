'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var prevSubscriptions = new Schema({
  stripeSubsId: {
    type: String
  },
  plan: {
    type: String
  },
  start: {
    type: Number
  },
  end: {
    type: Number
  }
});

var Subscription = new Schema({
  stripeCustId: {
    type: String
  },
  stripeSubsId: {
    type: String
  }
});

var UserSchema = new Schema({
  name: {
    type: String,
    lowercase: true,
    minlength: [3, 'name is atleast of 3 characters'],
    maxlength: [30, 'name does not exceeds 30 characters'],
    required: [true, 'please enter your name']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    lowercase: true,
    minlength: [3, 'email is atleast of 3 characters'],
    maxlength: [30, 'email does not exceeds 30 characters'],
    match: /\S+@\S+\.\S+/,
    unique: true,
    required: [true, 'please enter your email']
  },
  mobile: {
    type: Number,
    required: [true, 'please enter your email']
  },
  isVerifiedEmail: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
  },
  subscription: Subscription,
  previousSubscriptions: [ prevSubscriptions ],
  plan: {
    type: String
  },
  transactions: [{
    type: Schema.Types.ObjectId,
    ref: 'transaction'
  }],
  preset: [{
    type: Schema.Types.ObjectId,
    ref: 'preset'
  }],
  expires: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  },
  registration_timestamp: {
    type: Date,
    default: Date.now
  },
  last_login_timestamp: {
    type: Date
  },
  activation_timestamp: {
    type: Date
  },
  deactivation_timestamp: {
    type: Date
  }
});

module.exports = mongoose.model('user', UserSchema, 'users');