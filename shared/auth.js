
module.exports.ensureAuthenticated = function(req, res, next){
  if (req.isAuthenticated()) {
    console.log('####### > ensureAuthenticated > YES +++++')
    return next();
  } else {
    console.log('####### > ensureAuthenticated > NO +++++')
    res.redirect('/loginorsignup');
  }
};


module.exports.ensureNotAuthenticated = function(req, res, next){
  if (!req.isAuthenticated()) {
    console.log('####### > ensureNotAuthenticated > YES +++++')
    return next();
  } else {
    onsole.log('####### > ensureNotAuthenticated > NO +++++')
    res.redirect('/');
  }
};