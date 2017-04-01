
var app = require('../../app');
var fs  = require('fs');
var https   = require('https');
var request = require('request');
var passport = require('passport');
var pugCompiler = require('../../shared/pugCompiler.js');
var mailer = require('../../shared/mailer.js');
var sanitizeInputModule = require('../../shared/sanitizeInput.js');
require('../../shared/sessionPrototype');
var serverSideValidation = require('../../shared/serverSideValidation.js');


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


var apiOptions = {
  server : 'https://localhost:3000'
};

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


if (process.env.NODE_ENV === 'production') {
  apiOptions.server = 'https://my-awesome-app123.com';
}


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */



var _handleError = function (req, res, statusCode) {

  var title;
  var content;

  if (statusCode === 404) {
    title = '404, Page not found:';
    content = 'The page you requested cannot be found. Please try again. \n\n If this problem continues, please contact our Help Desk at 555-555-1234 or email customer.care@ThisGreatApp.com.';

  } else if (statusCode === 500) {
    title = '500, Internal server error:';
    content = 'There is a problem with our server. Please try again. \n\n If this problem continues, please contact our Help Desk at 555-555-1234 or email customer.care@ThisGreatApp.com.';

  } else {
    title = statusCode + ', Error processing request:';
    content = 'An Error has occurred processing your request. Please try again. \n\n If this problem continues, please contact our Help Desk at 555-555-1234 or email customer.care@ThisGreatApp.com.';
  }

  res.status(statusCode);

  res.render('basicView', {
    title : title,
    content : content
  });

};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.nocache = function(req, res, next){
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.getLogout = function(req, res){

  console.log('####### > serverMainCtrls > module.exports.getLogout 1: ', req.sessionID);

  req.session.destroy(function(err) {

    req.logout();

    if(err){

      _handleError(req, res, 400);

    }else{

      console.log('####### > serverMainCtrls > module.exports.getLogout 2: ', req.sessionID);
      res.redirect('/');

    }

  });

};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.getIndex = function(req, res){

  console.log('####### > serverMainCtrls > getIndex > req.sessionID: ', req.sessionID)
  //console.log('####### > serverMainCtrls > getIndex > req.session: ', req.session)

  var requestOptions, path;
  path = '/api/index';
  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'GET',
    json : {}
  };
  request(requestOptions, function(err, response) {
    if(err){
      _handleError(req, res, err);
    }else if (response.statusCode === 200) {
      var htitle = 'Election App 2016!';
      var stitle = 'Log In or Sign Up to join the discussion';
      res.render('indexView', {
        pageHeader: {
          title: htitle
        },
        subtitle: stitle
      })
    }else{
      _handleError(req, res, response.statusCode);
    }
  });
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.getUserHome = function(req, res){

  console.log('####### > serverMainCtrls > module.exports.getUserHome 1: ', req.sessionID);
  res.render('userHome');

};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.getComments = function(req, res){

  var requestOptions, path;
  path = '/api/comments';
  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'GET',
    json : {}
  };
  request(requestOptions, function(err, response, body) {
    if(err){
      _handleError(req, res, err);
    }else if (response.statusCode === 200) {
      var htitle = 'Election App 2016!';
      var stitle = 'Log In or Sign Up to join the discussion';
      var message;
      if (!(body instanceof Array)) {
        message = 'API path error!';
        body = [];
      } else {
        if (!body.length) {
          //message = 'No data found!';
        }
      }
      res.render('commentsView', {
        csrfToken: req.csrfToken(),
        sideBlurb: 'The 2016 presidential election is upon us! Who do you support and what are your comments regarding this hotly contested event?',
        responseBody: body,
        message: message
      })
    }else{
      _handleError(req, res, response.statusCode);
    }
  });
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */



module.exports.putUserProfile = function(req, res){ 

  var requestOptions, path, postdata;
  path = '/api/userprofile/' + res.locals.currentUser.id;
  var reqBody = req.body;
  var userProfileChangeKey;
  var userProfileChangeValue;

  for (var v in reqBody){
    if (typeof reqBody[v] !== 'function') {
      if(v !== '_csrf') {
        userProfileChangeKey = v;
        userProfileChangeValue = reqBody[v];
      }
    }
  }

  var val = userProfileChangeValue;
  if(userProfileChangeKey === 'state'){
    val = JSON.parse(userProfileChangeValue);
  }

  postdata = {
    [userProfileChangeKey]: val
  };

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'PUT',
    json : postdata
  };

  var objKey = Object.keys(postdata)

  if (!objKey[0]) {
    var m = 'All User Profile fields required'
    res.redirect('/userprofile/' + res.locals.currentUser.id + '/?err='+m);

  } else {
    request(requestOptions, function(err, response, body) {
      if (response.statusCode === 200) {
        res.redirect('/userprofile');

      } else if (response.statusCode === 400 && body.name && body.name === 'ValidationError' ) {
        _handleError(req, res, response.statusCode);

      } else if (response.statusCode === 404) {

      } else {
        if (body.message){
          m = body.message
          res.redirect('/signup/?err='+m);
        }
        _handleError(req, res, response.statusCode);
      }
    });
  }
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.postMainComment = function(req, res){
  var requestOptions, path, postdata;
  path = '/api/comments/mainComment';

  postdata = {
    displayname: res.locals.currentUser.displayname,
    commenterId: res.locals.currentUser.id,
    city: res.locals.currentUser.city,
    state: res.locals.currentUser.state,
    candidate: req.body.candidate,
    comment: req.body.comment
  };

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'POST',
    json : postdata
  };

  if (!postdata.displayname || !postdata.commenterId || !postdata.city || !postdata.state || !postdata.candidate || !postdata.comment) {
    m = 'All Sign up fields required';
    res.redirect('/comments/?err='+m);
  } else {
    request(requestOptions, function(err, httpResponse, body) {
      if (httpResponse.statusCode === 201) {
        res.redirect('/comments');
      } else if (httpResponse.statusCode === 400 && body.name && body.name === 'ValidationError' ) {
          m = 'Error has ocurred (serverMainCtrls.js > requestAddNewComment)';
          res.redirect('/comments/?err='+m);
      } else {
          _handleError(req, res, httpResponse.statusCode);
      }
    });
  }
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.postSubComment = function(req, res){

  var requestOptions, path, postdata;
  var sanitizeSubcommentid = sanitizeInputModule(req.params.subcommentid);
  path = '/api/comments/subcomment/' + sanitizeSubcommentid;

  postdata = {
    displayname: res.locals.currentUser.displayname,
    commenterId: res.locals.currentUser.id,
    city: res.locals.currentUser.city,
    state: res.locals.currentUser.state,
    comment: req.body.comment
  };

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'POST',
    json : postdata
  };

  if (!postdata.displayname || !postdata.commenterId || !postdata.city || !postdata.state || !postdata.comment) {
    m = 'All Comment Reply fields required';
    res.redirect('/comments/subcomment/' + sanitizeInput1 + '/?err='+m);
  } else {
    request(requestOptions, function(err, response, body) {
      if (response.statusCode === 201) {
        res.redirect('/comments');
      } else if (response.statusCode === 400 && body.name && body.name === 'ValidationError' ) {
          m = 'Error has ocurred > serverMainCtrls.js > postSubComment)';
          res.redirect('/comments/subcomment/' + sanitizeInput1 + '/?err='+m);
      } else {
          _handleError(req, res, response.statusCode);
      }
    });
  }
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.getAddNewComment = function(req, res) {

    res.render('addNewCommentView', {
    title: 'MEANCRUDApp',
    sideBlurb: 'The 2016 presidential election is upon us! Who do you support and what are your comments regarding this hotly contested event?'
    });

};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */



module.exports.getResetPassword = function(req, res){

  var hostname = req.headers.host;
  var requestOptions, path, m;
  path = '/api/resetpassword';

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'GET',
    json : {}
  };
  if (!req.body.email || !req.body.password) {
    m = 'Error prosessing Password Reset request. Please try again.';
  }
  request(requestOptions, function(err, response) {
    if(err){
      console.log('getResetPassword +++')
      _handleError(req, res, err);
    }else if (response.statusCode === 200) {
      console.log('getResetPassword > response.content: ', response.content)
      m = 'Please check your email. Instructions have been sent to your email address on how to reset your password.';
      res.render('login', {
        csrfToken: req.csrfToken(),
        title: 'Log In',
        pageHeader: {
          header: 'Welcome back!!!!!!'
        },
        message: m
      });

    }else{
      _handleError(req, res, response.statusCode);
    }
  });
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.postLogin = function(req, res, next){

  var requestOptions, path, postdata, m;
  path = '/api/login';

  postdata = {
    email: req.body.email,
    password: req.body.password
  };

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'POST',
    json : postdata
  };
  if (!postdata.email || !postdata.password) {

    console.log('####### > serverMainCtrls.js > postLogin 222222')
    m = 'All fields required'
    res.redirect('/login/?err='+m);

  } else {

    passport.authenticate('local', function(err, user, info){
      if (err) {
        m = 'Authentication Error'
        return res.redirect('/login/?err='+m);
      }
      if (!user) { 
        m = 'Invalid login credentials'
        return res.redirect('/login/?err='+m);
      }
      req.logIn(user, function(err) {
        if (err) { 
          m = 'Authentication Login Error1'
          return res.redirect('/login/?err='+m);
        }
        path = '/api/login/' + user.id;
        requestOptions = {
          rejectUnauthorized: false,
          url : apiOptions.server + path,
          method : 'PUT'
        };
        request(requestOptions, function(err, response, body) {
          if (response.statusCode === 200) {
            res.redirect('/userhome');
          }else{
            _handleError(req, res, response.statusCode);
          }
        });
      });
    })(req, res, next);

  }
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


var testValidatedUserInput = function (v) {

  for (var key in v){
    if(v[key].hasOwnProperty('error')){
      return true;
    }
  }

};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.getLogin = function(req, res) {

  console.log('####### > serverMainCtrls > module.exports.getLogin 1: ', req.sessionID);

  req.session.regenerate(function(err) {

    if(err){

      _handleError(req, res, 400);

    }else{

      console.log('####### > serverMainCtrls > module.exports.getLogin 2: ', req.sessionID);
      res.render('login', {
        csrfToken: req.csrfToken()
      });

    }

  });
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.getSignup = function(req, res) {

  req.session.regenerate(function(err) {

    if(err){

      _handleError(req, res, 400);

    }else{

      res.render('signup', {
        csrfToken: req.csrfToken()
      });

    }

  });
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.getUserProfile = function(req, res) {
  var error;
  req.session.csrfError ? error = req.session.csrfError : null;

  var requestOptions, path;
  path = '/api/userprofile/' + res.locals.currentUser.id;
  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'GET',
    json : {}
  };
  request(requestOptions, function(err, response, body) {
    if(err){
      _handleError(req, res, err);
    }else if (response.statusCode === 200) {
      res.render('userProfile', {
        csrfToken: req.csrfToken(),
        responseBody: body,
        error: error
      });
    }else{
      _handleError(req, res, response.statusCode);
    }
  });
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.getMembersOnly = function(req, res) {

  res.render('membersonly', {
    title: 'Members Only Page',
    pageHeader: {
      header: 'Hello Authorized Users!'
    }
  });

};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.getNotifyError = function(req, res) {

  var notifyMessage = 'A website error recently occurred, please try to Log In or Sign Up again. If this problem continues, please contact customer service.';
  var notifyMessageType = 'danger';
  app.locals.notifyMessage ? notifyMessage = app.locals.notifyMessage : null;
  app.locals.notifyMessageType ? notifyMessageType = app.locals.notifyMessageType : null;

  console.log('####### > serverMainCtrls > module.exports.getNotifyError 1: ', req.session);

  req.session.regenerate(function(err) {

    if(err){

      console.log('####### > serverMainCtrls > module.exports.getNotifyError 2: ', req.session);
      _handleError(req, res, 400);

    }else{

      console.log('####### > serverMainCtrls > module.exports.getNotifyError 3: ', req.session);
      res.render('notifyError', {
        message: notifyMessage,
        type: notifyMessageType
      });

    };

  });
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.getLoginOrSignup = function(req, res) {
  res.render('loginorsignup', {
    /* +++++++= */
  });
};


module.exports.getResouces = function(req, res) {
  res.render('basicView', {
    title: 'Resources',
    pageHeader: {
      header: 'Resouces'
    },
    content: 'ThisGreatApp! is all about people sharing their favorite novelties across America.\n\nAut tenetur sit quam aliquid quia dolorum voluptate. Numquam itaque et hic reiciendis. Et eligendi quidem officia maiores. Molestiae ex sed vel architecto nostrum. Debitis culpa omnis perspiciatis vel eum. Vitae doloremque dolor enim aut minus.\n\nPossimus quaerat enim voluptatibus provident. Unde commodi ipsum voluptas ut velit. Explicabo voluptas at alias voluptas commodi. Illum et nihil ut nihil et. Voluptas iusto sed facere maiores.'
  });
};


module.exports.getDummyPage = function(req, res) {
  res.render('dummypage', {
    title: 'Dummy Test Page',
    pageHeader: {
      header: 'Dummy Test Page !!!'
    }
  });
};


module.exports.getAbout = function(req, res) {
  res.render('basicView', {
    title: 'About',
    pageHeader: {
      header: 'About'
    },
    content: 'ThisGreatApp! is all about people sharing their favorite novelties across America.\n\nAut tenetur sit quam aliquid quia dolorum voluptate. Numquam itaque et hic reiciendis. Et eligendi quidem officia maiores. Molestiae ex sed vel architecto nostrum. Debitis culpa omnis perspiciatis vel eum. Vitae doloremque dolor enim aut minus.\n\nPossimus quaerat enim voluptatibus provident. Unde commodi ipsum voluptas ut velit. Explicabo voluptas at alias voluptas commodi. Illum et nihil ut nihil et. Voluptas iusto sed facere maiores.'
  });
};


module.exports.getContact = function(req, res) {
  res.render('basicView', {
    title: 'Contact',
    pageHeader: {
      header: 'Contact'
    },
    content: 'ThisGreatApp! can be contacted by calling 1-800-555-1234.\n\nDolorem necessitatibus aliquam libero magni. Quod quaerat expedita at esse. Omnis tempora optio laborum laudantium culpa pariatur eveniet consequatur.'
  });
};


module.exports.getTeam = function(req, res) {
  res.render('basicView', {
    title: 'Team',
    pageHeader: {
      header: 'Meet the Team'
    },
    content: 'The team behind ThisGreatApp! are a dedicated bunch who enjoy sharing favorite places and experiences.\n\nAt vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.'
  });
};


