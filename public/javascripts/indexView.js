

$('.modal').on('shown.bs.modal', function() {
  $(this).find('[autofocus]').focus();
  var hasFocus = $('#state').is(':focus');
  var hasFocus2 = $('#inputElement').is(':focus');
});

var doIndexViewAddCommentModal = function() {

    $('#addMainCommentFormModal').modal({
      keyboard: false,
      backdrop: 'static'
    })
    
}
