var passport = require('passport');
var {User} = require('../models/index');


module.exports = function() {

    passport.serializeUser(function(user, cb) {
        cb(null, user);
      });
      
    passport.deserializeUser(function(obj, cb) {
        cb(null, obj);
    });
};




