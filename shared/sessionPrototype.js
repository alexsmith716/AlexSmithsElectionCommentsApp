var session       = require('express-session');
var MongoStore    = require('connect-mongo')(session);

session.Session.prototype.loginSignup = function loginSignup(callback) {
  this.regenerate(function (err) {
    if(err) { 
      callback(err);
      return; 
    }
    //this.req.session._loggedInAt = Date.now();
    //bind session to IP address & user agent
    //this.req.session._ip = this.req.ip;
    //this.req.session._ua = this.req.headers['user-agent'];
    callback();  
  });
};

session.Session.prototype.logout = function logout(callback) {

  this.destroy(function(err) {
    
    callback();
  });

};

session.Session.prototype.login = function login() {
  this.session._loggedInAt = Date.now();
};

session.Session.prototype.isLoggedIn = function isLoggedIn() { 
  return !!this._loggedInAt;
};

session.Session.prototype.recentLogin = function recentLogin() {
  return (this._loggedInAt && (Date.now() - this._loggedInAt) < (1000 * 60 * 6));
};