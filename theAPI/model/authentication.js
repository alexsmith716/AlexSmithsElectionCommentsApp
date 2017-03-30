var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./userSchema.js');

module.exports = function() {
  
  // serialize user into session
  passport.serializeUser(function(user, cb) {
    console.log('####### authentication > PASSPORT.serializeUser $$$$$$: ', user.id)
    cb(null, user.id);
  });

  // deserialize user out of the session
  passport.deserializeUser(function(id, cb) {
    User.findById(id, function(err, user) {
      if(user){
        console.log('####### authentication > PASSPORT.deserializeUser $$$$$$: ', user.id)
      }
      cb(err, user);
    });
  });


  passport.use('local', new LocalStrategy({ usernameField: 'email' }, function(username, password, cb) {

      User.findOne({ email: username }, function(findOneErr, user) {

        if (findOneErr) { 
          
          return cb(findOneErr);

        }else if (!user) {

          return cb(null, false, { message: 'No user has that username!' });

        }else{

          user.checkPassword(password, function(checkPassErr, result){

            if (checkPassErr) {
              return cb(checkPassErr);
            }

            if(!result){

              return cb(null, false, { message: 'Invalid password.' });

            }else{

              console.log('####### authentication > PASSPORT.use CHECKPASSWORD GOOD $$$$$$')
              return cb(null, user);

            }

          });
        }
      });
    }
  ));

};
