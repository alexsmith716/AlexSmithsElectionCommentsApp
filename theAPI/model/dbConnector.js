
var mongoose = require('mongoose');
var gracefulShutdown;
var dbURI = 'mongodb://localhost/pec2016';



// MongoLab documentation: http://docs.mongolab.com/
// connection string: mongodb://adbuser:mydbpassword@ds5342322.mongolab.com:5342322/myproj-dev
// set string in terminal: $ heroku config:set MONGOLAB_URI=your_db_uri



if (process.env.NODE_ENV === 'production') {
    dbURI = process.env.MONGOLAB_URI;
}


mongoose.connect(dbURI);


// CONNECTION EVENTS
mongoose.connection.on('connected', function() {
    console.log('####### > MONGOOSE CONNECTED: ' + dbURI);
});
mongoose.connection.on('error', function(err) {
    console.log('####### > Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
    console.log('####### > Mongoose disconnected');
});



// Handle Mongoose/Node connections
gracefulShutdown = function(msg, callback) {
    mongoose.connection.close(function() {
        console.log('####### > Mongoose disconnected through: ' + msg);
        callback();
    });
};


// For app termination
process.on('SIGINT', function() {
    gracefulShutdown('app termination', function() {
        console.log('####### > Mongoose SIGINT gracefulShutdown');
        process.exit(0);
    });
});



// For nodemon restarts
process.once('SIGUSR2', function() {
    gracefulShutdown('nodemon restart', function() {
        console.log('####### > Mongoose SIGUSR2 gracefulShutdown');
        process.kill(process.pid, 'SIGUSR2');
    });
});


// For Heroku app termination
process.on('SIGTERM', function() {
    gracefulShutdown('Heroku app termination', function() {
        console.log('####### > Mongoose SIGTERM gracefulShutdown');
        process.exit(0);
    });
});


// SCHEMAS & MODELS
require('./userSchema');
require('./commentsSchema');

