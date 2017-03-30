var session     	= require('express-session');
var MongoStore 		= require('connect-mongo')(session);

session.Session.prototype.loginSignup = function loginSignup(callback) {
  console.log('##### sessionPrototype > loginSignup +++')
  var req = this.req;
	this.regenerate(function (err) {
		if(err) { 
			callback(err);
			return; 
		}
		//this.req.session._loggedInAt = Date.now();
   	//bind the session to IP address & user agent
   	//req.session._ip = req.ip;
   	//req.session._ua = req.headers['user-agent'];
    callback();  
	});
};

session.Session.prototype.isLoggedIn = function isLoggedIn() { 
	return !!this._loggedInAt;
};

session.Session.prototype.recentLogin = function recentLogin() {
	return (this._loggedInAt && (Date.now() - this._loggedInAt) < (1000 * 60 * 6));
};

session.Session.prototype.logout = function login(callback) {
  var req = this.req;
  this.destroy(function(err) {
    if(err) { 
      callback(err);
      return; 
    }
    callback();
  });
  //delete this.req.session;
  //this.req.sessionStore.destroy(this.id, fn);
  //return this;
};
