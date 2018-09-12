'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Device = new Schema({
  name: {
    type: String
  },
  height: {
    type: Number
  },
  width: {
    type: Number
  },
});

var PresetSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  devices: [Device]
});

module.exports = mongoose.model('preset', PresetSchema, 'preset');