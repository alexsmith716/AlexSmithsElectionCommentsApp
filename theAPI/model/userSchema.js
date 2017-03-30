
var mongoose = require('mongoose');
var crypto = require('crypto');

/*
User
    > User can create MainComments
    > User can SubComment on other User's MainComments
*/

var userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    displayname: {
        type: String,
        required: true,
        unique: false
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: Object,
        required: true
    },
    datecreated: { 
        type: Date, 
        default: Date.now 
    },
    previouslogin: { 
        type: Date,
        default: Date.now 
    },
    lastlogin: { 
        type: Date,
        default: Date.now 
    },
    hash: String,
    salt: String
});

// randomBytes:     create salt
// pbkdf2:          create hash from password & salt (asynch)
// pbkdf2Sync:      create hash from password & salt (synch)

// crypto.randomBytes(     size,        callback
// crypto.randomBytes(      256,    function(err, buf)

// crypto.pbkdf2(  password,    salt,     iterations,   keylen,    digest,        callback
// crypto.pbkdf2(  password,  self.salt,    100000,       512,    'sha512',   function(err, key)

userSchema.methods.setPassword = function (password, callback) {
    if (!password) {
        return callback('No password was given');
    }
    var self = this;

    crypto.randomBytes(64, function(err, buf) {
        if (err) {
            return callback(err);
        }

        var salt = buf.toString('hex');
        self.salt = salt;

        crypto.pbkdf2(password, self.salt, 1000, 64, 'sha512', function(err, key) {

            if (err) {
                return callback(err);
            }

            var hash = key.toString('hex')
            self.hash = hash;
            callback(null, self);
        });
    });
};

userSchema.methods.checkPassword = function(password, callback) {
    var result;
    var self = this;

    crypto.pbkdf2(password, self.salt, 1000, 64, 'sha512', function(err, key) {
        if (err) {
            return callback(err);
        }
        var hash = key.toString('hex')
        self.hash === hash ? result = true : result = false;
        callback(null, result);
    });
};

userSchema.methods.name = function() {
    return this.displayname || this.email;
};

var User = mongoose.model('User', userSchema);
module.exports = User;
