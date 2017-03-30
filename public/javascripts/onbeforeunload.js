
console.log('####### > onbeforeunload.js');

window.onbeforeunload = function() { 
	//$('.clrFavForm').trigger('click');
	var addNewCommentViewFormID = document.getElementById("addNewCommentViewFormID");
	var signUpFormID = document.getElementById("signUpFormID");
	var loginFormID = document.getElementById("loginFormID");

	if(addNewCommentViewFormID != null){
		addNewCommentViewFormID.reset();
    	$("#state").val('').trigger('change');
    	$(addNewCommentViewFormID).find(".form-group").removeClass("has-error"); 
    	$(addNewCommentViewFormID).data('validator').resetForm(); 
	}

	if(signUpFormID != null){
		signUpFormID.reset();
    	$(signUpFormID).find(".form-group").removeClass("has-error"); 
	}

	if(loginFormID != null){
		loginFormID.reset();
    	$(loginFormID).find(".form-group").removeClass("has-error"); 
	}

};