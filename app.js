// cd documents/spring2017/AlexSmithsElectionCommentsApp

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


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */



var options = {
  key: fs.readFileSync(__dirname + '/ssl/thisgreatappPEM.pem'),
  cert: fs.readFileSync(__dirname + '/ssl/thisgreatappCRT.crt')
};



/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


setUpAuthentication();


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


app.set('views', path.join(__dirname, 'theServer', 'views'));
app.set('view engine', 'pug');
//app.set('view cache', true);


//app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);


var accessLogStream = rfs('access.log', {
  interval: '1d',
  path: logDirectory
});


app.use(morgan('dev'));
//app.use(morgan('combined', {stream: accessLogStream}));



/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(helmet());
app.use(cookieParser());



/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


// var cookieExpireDate = new Date( Date.now() + 14 * 24 * 60 * 60 );



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// session will expire on sessionExpireDate
// session will renew sessionExpireDate on each request
// session will update itself on same-browser multiple logins
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// var sessionExpireDate = 6 * 60 * 60 * 1000; // 6 hours
// var sessionExpireDate = 1 * 60 * 1000; // 1 minute
var sessionExpireDate = 10 * 60 * 1000; // 10 minutes


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


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


app.use(passport.initialize());
app.use(passport.session());


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


app.use(function(req, res, next){

  console.log('REQ.HEADERS +++: ', req.headers['user-agent']);
  console.log('REQ.SESSIONID +++: ', req.sessionID);
  console.log('REQ.USER ++++++: ', req.user);

  app.locals.notifyMessage = null;
  app.locals.notifyMessageType = null;
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

  // Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36
  // Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.1 Safari/603.1.30

  // Mozilla/5.0 (Linux; U; Android 4.0.3; de-ch; HTC Sensation Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30
  // check string 'Mobi' anywhere in the User Agent to detect mobile device


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

  //return next(createError(401, 'Please login to view this page.'));

  next();
});



/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */



app.use('/', serverRoutes);
app.use('/api', apiRoutes);



/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


/*
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    //
  }
});
*/


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


// development
if (app.get('env') === 'development') {

  app.use(function (err, req, res, next) {

    res.status(err.status || 500);
    app.locals.notifyMessage = 'A website error recently occurred, please try to Log In or Sign Up again. If this problem continues, please contact customer service.';
    app.locals.notifyMessageType = 'danger';

    console.log('####### > app > development Error 1: ', req.session);

    req.session.destroy(function(err) {

      req.logout();

      if (req.xhr) {

        console.log('####### > app > development Error 1 AJAX : ', req.session);
        res.status(400);
        res.json({'response': 'error', 'type': 'error', 'redirect': 'https://localhost:3000/notifyError'});

      }else{

        console.log('####### > app > development Error 2 NO AJAX : ', req.session);
        res.redirect('/notifyError');

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
  });
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


// production
app.use(function(err, req, res, next) {

    res.status(err.status || 500);

    app.locals.notifyMessage = 'A website error recently occurred, please try to Log In or Sign Up again. If this problem continues, please contact customer service.';
    app.locals.notifyMessageType = 'danger';

    req.session.destroy(function(err) {

      req.logout();

      if (req.xhr) {

        res.status(400);
        res.json({'response': 'error', 'type': 'error', 'redirect': 'https://localhost:3000/notifyError'});

      }else{

        res.redirect('/notifyError');

      }

    });

});


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports = app;


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


app.set('port', process.env.PORT || 3000);
var server =  https.createServer(options, app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */




