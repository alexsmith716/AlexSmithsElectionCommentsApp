
require('dotenv').load();

process.env.NODE_ENV = 'development';

var express   = require('express');
var helmet  = require('helmet');
var https   = require('https');
var path  = require('path');
//var favicon   = require('serve-favicon');
var cookieParser  = require("cookie-parser");
var bodyParser  = require('body-parser');
var fs  = require('fs');
var morgan  = require("morgan");
var rfs   = require('rotating-file-stream');
var passport  = require('passport');
var session   = require('express-session');
var MongoStore  = require('connect-mongo')(session);
var setUpAuthentication = require('./theAPI/model/authentication');
var serverRoutes  = require('./theServer/routes/serverRoutes');
var apiRoutes   = require('./theAPI/routes/apiRoutes');
var createError   = require('http-errors')

require('./theAPI/model/dbConnector');
var sanitize  = require('./shared/sanitizeInput.js');
require('./shared/sessionPrototype');

var app   = express();

var logDirectory  = path.join(__dirname, 'httpRequestLog');

var options = {
	key: fs.readFileSync(__dirname + '/ssl/thisgreatappPEM.pem'),
	cert: fs.readFileSync(__dirname + '/ssl/thisgreatappCRT.crt')
};

setUpAuthentication();

app.set('views', path.join(__dirname, 'theServer', 'views'));
app.set('view engine', 'pug');
//app.set('view cache', true);


//app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));


fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);


var accessLogStream = rfs('access.log', {
  interval: '1d',
  path: logDirectory
});


app.use(morgan('dev'));
//app.use(morgan('combined', {stream: accessLogStream}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(helmet());
app.use(cookieParser());


var cookieExpiryDate = new Date( Date.now() + 14 * 24 * 60 * 60 );
var sessionExpireDate = 6 * 60 * 60 * 1000;


if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

app.use(session({
  	store: new MongoStore({
  		url: 'mongodb://localhost/pec2016s',
  		autoRemove: 'native'
  	}),
  	name: 'id',
    secret: process.env.SESSION_SECRET,
  	resave: false,
    rolling: true,
  	saveUninitialized: false,
  	cookie: {
  		secure: true,
  		httpOnly: true,
  		maxAge: sessionExpireDate
  	}
}));


app.use(passport.initialize());
app.use(passport.session());


app.use(function(req, res, next){

  app.locals.error = null;
  res.locals.currentUser = req.user;
  res.locals.reqUrl = req.url;
  res.locals.currentURL = req.url;

  if(res.locals.currentUser){
    req.session.paginateFrom = res.locals.sortDocsFrom;
    req.session.lastPageVisited = '/indexView';
  }

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);


// Version 10.1 (10603.1.30.0.34)
// https://webkit.org/blog/7099/html-interactive-form-validation/
// HTML interactive form validation is supported in WebKit
// HTML interactive form validation is enabled by default in Safari Technology Preview 19
// Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.1 Safari/603.1.30
// Mozilla/5.0 (Linux; U; Android 4.0.3; de-ch; HTC Sensation Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30
// check string 'Mobi' anywhere in the User Agent to detect mobile device

console.log('req.headers[user-agent] +++++++++: ', req.headers['user-agent'])

  var s = /Safari/;
  var c = /Chrome/;
  //req.get('user-agent');
  if((s.test(req.headers['user-agent'])) && (!c.test(req.headers['user-agent']))){

    console.log('SAFARI +++++++++++++++++++++++++++++++')
  	res.locals.isSafari = true;
  }else{

    console.log('NOT SAFARI +++++++++++++++++++++++++++++++')
  	res.locals.isSafari = false;
  }

  next();
});


app.use('/', serverRoutes);
app.use('/api', apiRoutes);


// unidentified
app.use(function(req, res, next) {
  console.log('####### > app.js > app.use > Not Found ERROR > 404 > IS IT AJAX ???', req.xhr);
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// development
if (app.get('env') === 'development') {

  app.use(function (err, req, res, next) {

    var errHeaders = req.headers['referer'];
    var message;
    res.status(err.status || 500);

    app.locals.error = 'A website error recently occurred, please try to Log In or Sign Up again. If this problem continues, please contact customer service.';

    if (req.xhr) {

      // basic status code 
      res.status(400);
      res.json({'response': 'error', 'type': 'error', 'redirect': 'https://localhost:3000/notifyError'});

    }else{

      app.locals.error ? message = app.locals.error : null;

      req.session.loginSignup(function(err) {
        if(err){
          _handleError(req, res, 400);
        }else{
          res.render('notifyError', {
            message: message,
            type: 'danger'
          });
        }
      });

      /*
      res.render('error', {
        message: err.message,
        error: err,
        errHeaders: req.headers['referer'],
        reqXhr: req.xhr
      });
      */

    }

    /*
    res.render('error', {
      message: err.message,
      error: err,
      errHeaders: req.headers['referer'],
      reqXhr: req.xhr
    });
    */

  });
};



// production
app.use(function(err, req, res, next) {

  res.status(err.status || 500);

    app.locals.error = 'A website error recently occurred, please try to Log In or Sign Up again. If this problem continues, please contact customer service.';

    if (req.xhr) {

      res.status(err.status);
      res.json({'response': 'error', 'type': 'error', 'redirect': 'https://localhost:3000/notifyError'});

    }else{

      app.locals.error ? error = app.locals.error : null;

      req.session.loginSignup(function(err) {
        if(err){
          _handleError(req, res, 400);
        }else{
          res.render('notifyError', {
            error: error
          });
        }
      });

    }

});


module.exports = app;
app.set('port', process.env.PORT || 3000);
https.createServer(options, app).listen(app.get('port'));


