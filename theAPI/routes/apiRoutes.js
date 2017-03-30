
var express 		= require("express");
var router 			= express.Router();
var apiControllers 	= require("../controller/apiMainCtrls");
var auth            = require("../../shared/auth");
var cookieParser      = require('cookie-parser');
var csrf              = require('csurf');
var csrfProtection 		= csrf({ cookie: true });

router.get("/index", apiControllers.getIndexResponse);

router.get("/comments", apiControllers.getCommentsResponse);

router.post("/comments/maincomment", auth.ensureAuthenticated, apiControllers.postMainCommentResponse);

router.post("/comments/subcomment/:subcommentid", auth.ensureAuthenticated, apiControllers.postSubCommentResponse);

// router.post("/signup", apiControllers.postSignUpResponse);
router.post("/login", apiControllers.postLoginResponse);

router.get("/userprofile/:userid", auth.ensureAuthenticated, apiControllers.getUserProfileResponse);

router.get("/resetpassword", auth.ensureNotAuthenticated, apiControllers.getResetPasswordResponse);

router.put("/login/:userid", apiControllers.updateUserResponse);

router.get("/:commentid", auth.ensureAuthenticated, apiControllers.getOneCommentResponse);

router.post("/validatelogin", apiControllers.postValidateLogin);

/* +++++++++++++++++++++++++++++++++++++ */

router.post("/loginuser", csrfProtection, apiControllers.ajaxLoginUser);
router.post("/signupuser", csrfProtection, apiControllers.ajaxSignUpUser);
router.put("/evaluateuserprofile", auth.ensureAuthenticated, csrfProtection, apiControllers.ajaxEvaluateUserProfile);

router.post("/evaluateuseremail", apiControllers.ajaxEvaluateUserEmail);

router.post("/evaluateregistereduser", apiControllers.ajaxEvaluateRegisteredUser);

module.exports = router;





