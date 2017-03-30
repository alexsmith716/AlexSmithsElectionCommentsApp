var nodemailer = require('nodemailer');

var EMAIL_ACCOUNT_USER = 'your@email.address';
var EMAIL_ACCOUNT_PASSWORD = 'your-password'
var YOUR_NAME = 'Your Name';


var smtpTransport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: EMAIL_ACCOUNT_USER,
    pass: EMAIL_ACCOUNT_PASSWORD
  }
});


exports.sendMail = function(fromAddress, toAddress, subject, content, next){
  var success = true;
  var mailOptions = {    from: YOUR_NAME + ' <' + fromAddress + '>',
    to: toAddress,
    replyTo: fromAddress,
    subject: subject,
    html: content
  };

  smtpTransport.sendMail(mailOptions, function(err, response){
    if(err){
      console.log('[err] Message NOT sent: ', err);
      success = false;
    }
    else {
      console.log('[INFO] Message Sent: ' + response.message);
    }
    next(err, success);
  });
};