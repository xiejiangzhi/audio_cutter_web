(function(window){
  var $add_range_btn = $('#add_range_btn');
  var $results_body = $('#results_body');
  var $cut_btn = $('#cut_btn');
  var $results_form = $('#results_form');

  var result_tempfile = $results_body.find('tr:first').remove().html();

  $add_range_btn.click(function(){
    add_range();
  });

  $('a[req_via_form=true]').click(function(event){
    var $this = $(this);
    send_req($this.attr('method'), $this.attr('href'));
    event.preventDefault()
  });

  $('#file_receiver').click(function(){
    $('#file_uploader').click();
  });

  $('#file_receiver')
  .on('dragover', function(){
    event.preventDefault();
    event.stopPropagation();
  })
  .on('dragleave', function(){
    event.preventDefault();
    event.stopPropagation();
  })
  .on('drop', function(event){
    var files = event.target.files || event.originalEvent.dataTransfer.files;
    $('#file_uploader')[0].files = files;
    $(this).find('strong').text(files[0].name);

    event.preventDefault();
    event.stopPropagation();
  });

  $('#file_uploader').change(function(){
    var file = this.files[0]
    $('#file_receiver').find('strong').text(file ? file.name : "Drop or choose file");
  });

  function send_req(method, path){
    $results_form.attr('method', method);
    $results_form.attr('action', path);

    $results_form.submit();
  }

  function add_range(){
    var $tr = $('<tr></tr>');
    $tr.html(result_tempfile);
    $tr.find('td:first strong').text($results_body.find('tr').length);

    $results_body.find('tr:last').before($tr);
  }

  
  if ($results_body.find('tr').length == 1) {
    add_range();
  }
}(window));
