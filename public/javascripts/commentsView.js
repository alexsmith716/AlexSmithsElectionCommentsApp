
var requestLoader = $('<div class="modal-backdrop fade in"><img src="/images/request-loader.gif" style="position: fixed; top: 45%; left: 49%;"></div>');

$('#sidebar').affix({
      offset: {
        top: 245
      }
});

$(document).on("click", ".modaltest",  function () {
  requestLoader.appendTo(document.body);
  setTimeout(function() { requestLoader.remove(); }, 2000);
});


$(document).on("click", ".subCommentReply",  "#subCommentReply2", function () {
     var mcID = $(this).data("id");
     var pathmcID = "/comments/subcomment/"+mcID;
     $("#addSubCommentForm").attr("action",pathmcID);
     //$("#addSubCommentForm").setAttribute("action", pathmcID);
     $("#addSubCommentFormModal").modal({
      keyboard: false,
      backdrop: 'static'
    })
});


/*
$('#addSubCommentFormModal').on('show.bs.modal', function(e) {
    //get data-id attribute of the clicked element
    var bookId = $(e.relatedTarget).data('book-id');
    //populate the textbox
    $(e.currentTarget).find('input[name="bookId"]').val(bookId);
});
*/

// button(type="button", class="subCommentReply btn btn-primary btn-lg", data-id=`${doc.id}`) Reply
/*
$(document).on("click", ".subCommentReply", function () {
     var mcid = $(this).data('id');
     $("#addSubCommentForm").val( myBookId );
     console.log("MMmmmmmmodal !!!!!! mcid: ", mcid)
     //$(".modal-body #bookId").val( myBookId );
     // As pointed out in comments, 
     // it is superfluous to have to manually call the modal.
     // $('#addBookDialog').modal('show');
});
*/

var doCommentModal = function() {
    $('#addMainCommentFormModal').modal({
      keyboard: false,
      backdrop: 'static'
    })
}

/*
var doSubCommentModal = function() {
    $('#addSubCommentFormModal').modal({
      keyboard: false,
      backdrop: 'static'
    })
}*/
