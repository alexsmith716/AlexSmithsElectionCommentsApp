var session     	= require('express-session');
var MongoStore 		= require('connect-mongo')(session);

session.Session.prototype.login = function login(callback) {
	this.regenerate(function (err) {
		if(err) { 
			callback(err);
			return; 
		}
		this.req.session._loggedInAt = Date.now();
		callback(); 
	});
};

	// check the logged in status of user
session.Session.prototype.isLoggedIn = function isLoggedIn() { 
	return !!this._loggedInAt;
};

	// check time of session
session.Session.prototype.isFresh = function isFresh() {
	// return true if logged in in less then 3 minutes ago
	return (this._loggedInAt && (Date.now() - this._loggedInAt) < (1000 * 60 * 3));
};