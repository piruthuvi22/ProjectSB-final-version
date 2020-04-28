const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mobile: {
    type: String,
    required:false
  },
  email: {
    type: String,
    required:false
  },
  dob: {
    type: String,
    required:false
  },
  district: {
    type: String,
    required:false
  },
  school: {
    type: String,
    required:false
  },
  grade: {
    type: String,
    required:false
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
