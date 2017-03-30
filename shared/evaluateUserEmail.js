var User = require('../theAPI/model/userSchema.js');

module.exports = function (email, expectingARegisteredEmail, callback) {

  User.findOne( { email: email } ).exec(function(err, user) {
    
    if (err) {

      callback({status: 404, message: 'error'});

    }else {

      if(expectingARegisteredEmail === 'false'){

        if (user) {

          callback({status: 201, response: 'error'});

        }else{

          callback({status: 201, response: 'success'});

        }

      }else{

        if (!user) {

          callback({status: 201, response: 'error'});

        }else{

          callback({status: 201, response: 'success'});

        }

      }

    }

  });
};