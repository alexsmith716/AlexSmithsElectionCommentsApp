
var helper = {

    init: function() {

        window.showLoading = function() {
            $('.modal-backdrop').show();
        };
        window.hideLoading = function() {
            $('.modal-backdrop').hide();
        };

        showLoading(); 

        $('[name="inputElement"]').prop('required', true);
        $('[name="state"]').prop('required', true);

        setTimeout(function() { hideLoading(); }, 500);

        helper.initializeJqueryEvents();
    },

    initializeJqueryEvents:  function(){

        $('#editProfileFormModal').on('shown.bs.modal', function() {
            console.log('#editProfileFormModal > shown.bs.modal ++++');
          $(this).find('[autofocus]').focus();
          //var hasFocus = $('#state').is(':focus');
          //var hasFocus = $('#inputElement').is(':focus');
        });

        $('#editProfileFormModal').on('hidden.bs.modal', function () {
            console.log('#editProfileFormModal > hidden.bs.modal ++++');
            $('.editProfileFormError').removeClass('show');
            //$('#editProfileInputElement').removeClass('has-error');
            $('.editProfileFormError').html('');
            $('#editProfileInputElement').val('');
            $('#state').val('').trigger('change');
            $('.modalAlertSuccess').hide();
            $('.modalAlertDanger').hide();
            $('.modalOkayBtn').hide();
            $('.modalCancelSubmitBtns').show();
        });

        $('#personalInfoToggle').click(function(){
            helper.toggleEditBtn('personalInfo', true);
        });

        $('#personalInfoUpdate').click(function(){
            helper.toggleEditBtn('personalInfo', false);
        });

        $('#accountInfoToggle').click(function(){
            helper.toggleEditBtn('accountInfo', true);
        });

        $('#accountInfoUpdate').click(function(){
            helper.toggleEditBtn('accountInfo', false);
        });

        $('.editFormElement').click(function(){
            helper.doEditProfileModal('editProfileFormModal', 'editProfileForm', this);
        });

        $('#editProfileForm').on('submit', function(e) {

            console.log('#editProfileForm > SUBMIT ++1');

            e.preventDefault();

            var data = {};
            var activeElem;
            var serviceUrl = $(this).attr('action');

            var whichformdataid = $('#editProfileForm').data('whichformdataid');
            var whichFormDataType = $('#editProfileForm').data('whichformdatatype');
            var labelText = helper.makeTitleFromElementID(whichformdataid);

            whichFormDataType === 'select' ? activeElem = $('#state') : activeElem = $('#editProfileInputElement');

            var userInput = helper.evaluateInput(whichformdataid, whichFormDataType);
            var pathName = whichformdataid.replace(/-/g, '');
            
            if(!userInput){
                console.log('#editProfileForm > BAD FORM');
                return false;
            }

            console.log('#editProfileForm > GOOD FORM');

            console.log('#editProfileForm > GOOD FORM> pathName: ', pathName);
            console.log('#editProfileForm > GOOD FORM> userInput: ', userInput);

            console.log('#editProfileForm > GOOD FORM> whichformdataid: ', whichformdataid);
            console.log('#editProfileForm > GOOD FORM> whichFormDataType: ', whichFormDataType);
            console.log('#editProfileForm > GOOD FORM> labelText: ', labelText);

            $('.loading').show();

            data = {
                pathName: pathName,
                pathNameData: userInput,
                expectedResponse: 'false',
                _csrf: $('meta[name="csrf-token"]').attr('content')
            };

            $.ajax({
                rejectUnauthorized: false,
                url: serviceUrl,
                type: 'PUT',
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                accept: 'application/json',

                success: function(data, status, xhr) {
                    if (data.message === 'success') {
                        console.log('#editProfileFormX > ajax > SUCCESS > SUCCESS');
                        $('.loading').hide();
                        $('#editProfileFormModal').modal('hide');
                        $('#editProfileModalAlert .editProfileModalAlertSuccess strong').html('You\'re '+labelText+' has been successfully edited!');
                        $('#editProfileModalAlert .editProfileModalAlertSuccess').addClass('show');
                        $('#editProfileModalAlert').modal('show');
                        $('.'+whichformdataid).text(userInput);
                    } else {
                        console.log('#editProfileFormX > ajax > SUCCESS > ERROR');
                        $('.editProfileFormError').html('Could not edit your '+labelText+'.');
                        $('.editProfileFormError').addClass('show');
                        $(activeElem).addClass('has-error');
                        $('.loading').hide();
                        return false;
                    }
                },
                error: function(xhr, status, error) {
                    $('.loading').hide();

                    var parsedXHR = JSON.parse(xhr.responseText);

                    console.log('#editProfileFormX > ajax > ERROR > ERROR > parsedXHR: ', parsedXHR);

                    if(parsedXHR.type === 'token'){
                        location.href = parsedXHR.redirect;
                    }else{
                        $('.editProfileFormError').html('Could not edit your '+labelText+'. Try again or contact customer service.');
                        $('.editProfileFormError').addClass('show');
                        $(activeElem).addClass('has-error');
                    }
                    return false;
                }
            });
        });

        /*
        $('#submitEditProfileBtn').on('click', function(e) {
            console.log('#submitEditProfileBtn ++++')
            e.preventDefault();
            var serviceUrl;
            var dataObject = {};
            var data = {};
            var editedUserProfileID;
            var activeElem;

            var whichformdataid = $('#editProfileForm').data('whichformdataid');
            var whichFormDataType = $('#editProfileForm').data('whichformdatatype');
            var labelText = helper.makeTitleFromElementID(whichformdataid);

            whichFormDataType === 'select' ? activeElem = $('#state') : activeElem = $('#editProfileInputElement');

            //var dataElement = $('div[data-id^='+whichformdataid+']');
            var userInput = helper.evaluateInput(whichformdataid, whichFormDataType);
            var pathName = whichformdataid.replace(/-/g, '');

            console.log('TheModal > submitEditProfileBtn > pathName: ', pathName); 
            console.log('TheModal > submitEditProfileBtn > userInput: ', userInput);
            console.log('TheModal > submitEditProfileBtn > whichFormDataType: ', whichFormDataType);
            
            // TheModal > submitEditProfileBtn > pathName:  email, state, firstname, password
            // TheModal > submitEditProfileBtn > userInput:  bbb@bbb.com, Alaska, Joe, 555nnn
            // TheModal > submitEditProfileBtn > whichFormDataType:  text, email, select, password
            
            if(!userInput){
                console.log('submitEditProfileBtn > BAD FORM');
                return false;
            }else{
                console.log('submitEditProfileBtn > GOOD FORM');
                $('.loading').show();

                serviceUrl = 'https://localhost:3000/api/evaluateuserprofile';

                data = {
                    pathName: pathName,
                    pathNameData: userInput,
                    expectedResponse: 'false'
                };
           
                $.ajax({
                    rejectUnauthorized: false,
                    url: serviceUrl,
                    type: 'PUT',
                    data: JSON.stringify(data),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',

                    success: function(data, status, xhr) {
                        if (data.message === 'success') {
                            console.log('submitEditProfileBtn > ajax > success > success');
                            $('.loading').hide();
                            $('#editProfileFormModal').modal('hide');
                            $('#editProfileModalAlert .editProfileModalAlertSuccess strong').text('You\'re '+labelText+' has been successfully edited!');
                            $('#editProfileModalAlert .editProfileModalAlertSuccess').addClass('show').removeClass('hide');
                            $('#editProfileModalAlert').modal('show');
                            $('.'+whichformdataid).text(userInput);
                        } else {
                            console.log('submitEditProfileBtn > ajax > success > error');
                            $('.editProfileFormError').text('editProfileForm .editProfileFormError 111');
                            $('.editProfileFormError').addClass('show').removeClass('hide');
                            $(activeElem).removeClass("valid").addClass("invalid");
                            $('.loading').hide();
                            return false;
                        }
                    },
                    error: function(xhr, status, error) {
                        console.log('submitEditProfileBtn > ajax > error > error');
                        $('.editProfileFormError').text('Could not edit your '+labelText+'. Try again or contact customer service.');
                        $('.editProfileFormError').addClass('show').removeClass('hide');
                        $(activeElem).removeClass("valid").addClass("invalid");
                        $('.loading').hide();
                        return false;
                    }
                });
            }
        });
        */
    },

    makeTitleFromElementID: function(whichID) {
        whichID = whichID.replace(/-/g, ' ');
        labelText = whichID.replace(/\b\w/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        return labelText;
    },

    // whichFormDataID:  first-name , whichFormDataType:  text
    // whichFormDataID:  state ,      whichFormDataType:  select
    // whichFormDataID:  email/password ,      whichFormDataType:  email/password
    evaluateInput: function(whichID, whichType) {
        console.log('evaluateInput +++++')
        var emailPattern = /\S+@\S+\.\S+/;
        var passwordPattern = /^\S{4,}$/;
        var whichFormElementType;
        var isThisElementValueValid;
        var pattern;

        if(whichType === 'select'){
            whichFormElementType = $('#state');
        }else{
            whichFormElementType = $('#editProfileInputElement');
        }

        console.log('evaluateInput > whichFormElementType:', whichFormElementType)

        var whichTypeVal = whichFormElementType.val();
        whichTypeVal = whichTypeVal.trim();
        var elementTitle = whichFormElementType.attr('title');
        
        if(whichID === 'email' || whichID === 'password'){

            whichID === 'email' ? pattern = emailPattern : pattern = passwordPattern;
            isThisElementValueValid = pattern.test(whichTypeVal);

            if(isThisElementValueValid){
                console.log()
                $('.editProfileFormError').text(''); 
                $('.editProfileFormError').removeClass('show').addClass('hide');
                return whichTypeVal;
            }else{
                $('.editProfileFormError').text(elementTitle);
                $('.editProfileFormError').removeClass('hide').addClass('show');
                return false;
            }
 
        }else{
        
            if(whichTypeVal && whichTypeVal !== ''){
                $('.editProfileFormError').text(''); 
                $('.editProfileFormError').removeClass('show').addClass('hide');
                return whichTypeVal;
            }else{
                $('.editProfileFormError').text(elementTitle);
                $('.editProfileFormError').removeClass('hide').addClass('show');
                return false;
            }
        }

    },

    toggleEditBtn: function(whichTabs,displayTab) {
        var tabID, i, e;
        tabID = document.getElementsByClassName(whichTabs);

        for(i=0; i < tabID.length; i++) {
            e = tabID[i]; 
            if(displayTab){
                e.style.display = 'none';
            }else{
                if(e.style.display == 'none') {
                    e.style.display = 'inline';
                } else {
                    e.style.display = 'none';
                }
            }
        }
        if(e.style.display === 'inline'){
            whichTabs === 'accountInfo' ? $('#updateAccountBtn').text('Done') : null;
            whichTabs === 'personalInfo' ? $('#updatePersonalBtn').text('Done') : null;
        }
        if(e.style.display === 'none'){
            whichTabs === 'accountInfo' ? $('#updateAccountBtn').text('Update Account info') : null;
            whichTabs === 'personalInfo' ? $('#updatePersonalBtn').text('Update Personal info') : null;
        }
    },

    doEditProfileModal: function(editProfileFormModalID, editProfileFormID, editBtnClicked) {
        console.log('doEditProfileModal ++++++++');

        var voo = 'aaa';
        var emailPattern = /\S+@\S+\.\S+/;
        var passwordPattern = /^\S{4,}$/;
        var alphaStringPattern = /^[a-zA-Z]+$/;
        var userNamePattern = /^[a-zA-Z0-9_]{4,21}$/;

        var vqq = userNamePattern.test(voo);
        console.log('doEditProfileModal > userNamePattern.test: ', vqq);

        var editBtnClickedParentElem = $(editBtnClicked).parent();

        var dataID = editBtnClickedParentElem.data('id');
        var currentFormType = editBtnClickedParentElem.data('formelementtype');
        var labelText = helper.makeTitleFromElementID(dataID);
        var currentFormValue = $('.'+dataID).text();
        currentFormValue = currentFormValue.trim();

        console.log('doEditProfileModal > dataID: ', dataID);
        console.log('doEditProfileModal > currentFormType: ', currentFormType);
        console.log('doEditProfileModal > labelText: ', labelText);
        console.log('doEditProfileModal > currentFormValue: ', currentFormValue);

        $('#editProfileInputElementParent').removeClass('show').addClass('hide');
        $('#editProfileSelectElementParent').removeClass('show').addClass('hide');
        $('#editProfileInputElement').prop('disabled', true);
        $('#state').prop('disabled', true);


        if(currentFormType === 'select'){
            $('#editProfileSelectElementParent').removeClass('hide').addClass('show');
            $('#state').prop( 'disabled', false );
            $('#state').find('[option]').focus();

        }else{
            $('#editProfileInputElementParent').removeClass('hide').addClass('show');
            $('#editProfileInputElement').prop( 'disabled', false );
            $('#editProfileInputElement').attr({ 
                placeholder: labelText,
                type: currentFormType
            });

            switch (dataID) {
                case 'first-name':
                    $('#editProfileInputElement').attr({ 
                        maxlength: '21',
                        title: 'Please type a First Name'
                    });
                    break;
                case 'last-name':
                    $('#editProfileInputElement').attr({ 
                        maxlength: '31',
                        title: 'Please type a Last Name'
                    });
                    break;
                case 'city':
                    $('#editProfileInputElement').attr({ 
                        maxlength: '31',
                        title: 'Please type a City'
                    });
                    break;
                case 'email':
                    $('#editProfileInputElement').attr({ 
                        maxlength: '31',
                        title: 'Please type a valid Email Address'
                    });
                    break;
                case 'password':
                    $('#editProfileInputElement').attr({ 
                        pattern: '[^\S]{4,}',
                        minlength: '4',
                        title: 'Password must be at least 4 characters long. No whitespace allowed'
                    });
                    break;
            }
        }

        $('#editProfileFormLabelCurrent').html('Current ' + labelText + ':');

        if(dataID === 'password'){
            $('#editProfileFormLabelUpdated').html('To change password, first submit your current password');
            $('#editProfileInputElement').attr({ placeholder: 'Current Password' });
        }else{
            $('#editProfileFormLabelUpdated').html('Change your ' + labelText + ':');
        }

        $('#modalFormElementValueCurrent').html(currentFormValue);
        
        $('#'+editProfileFormID).data('whichformdataid', dataID);
        $('#'+editProfileFormID).data('whichformdatatype', currentFormType);
        
        $('#'+editProfileFormModalID).modal({
          keyboard: false,
          backdrop: 'static'
        })
    },

}

$(function () {
    helper.init();
});

