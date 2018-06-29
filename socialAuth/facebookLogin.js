var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var {Users} = require('../models/index');
var init = require('./passport');
const {getUsersLongLiveAccesstoken} = require("../services/facebook");


passport.use(new FacebookStrategy({
        clientID: process.env.facebook_clientID,
        clientSecret: process.env.facebook_clientSecret,
        callbackURL: process.env.facebook_callbackURL,
        profileFields: ['id','displayName','emails']
    },
    function(accessToken, refreshToken, profile, done) {
        done(null, profile);
        getUsersLongLiveAccesstoken(accessToken)
            .then(response => {
                return Users.findOneAndUpdate({
                            email : profile.emails[0].value
                        },{
                            $set : {
                                facebookToken : response.data.access_token
                            }
                        },{})
            }).then( updated =>{
                //console.log(updated);
            }).catch(err=> {
                console.log(err);
            })
        
    }

));

// serialize user into the session
init();


module.exports = passport;