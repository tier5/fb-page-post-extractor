/**
 * Name : users.js
 * Purpose : Users model 
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const db = require('../configs/connection');
const bcrypt = require('bcrypt');

// Users Model
const UserSchema =  new Schema({
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:[true, 'Email must be unique'],
        trim: true,
        validate: [{validator: value => validator.isEmail(value), msg : 'Not an email'}]
    },
    password:{
        type:String,required:[true, 'Password is required']
    }
    
},{
    usePushEach: true
});

/**
 * Function to hash password before save 
 */
UserSchema.pre('save', function (next) {
    var user = this;
  
    if (user.isModified('password')) {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
          user.password = hash;
          next();
        });
      });
    } else {
      next();
    }
  });

var User = db.model('Users', UserSchema);

module.exports = User