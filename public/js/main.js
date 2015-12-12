(function(window){
  var $add_range_btn = $('#add_range_btn');
  var $results_body = $('#results_body');
  var $cut_btn = $('#cut_btn');
  var $results_form = $('#results_form');
  var $wave_audio_source = $('#wave_audio_source');
  var $wave_toggle = $('#wave_toggle');
  var $range_counter = $('#range_counter');

  var result_tempfile = $results_body.find('tr:first').remove().html();

  $add_range_btn.click(function(){
    add_range();
  });


  // send request
  $('a[req_via_form=true]').click(function(event){
    var $this = $(this);
    send_req($this.attr('method'), $this.attr('href'));
    event.preventDefault()
  });


  // wave play 
  if ($wave_audio_source.length == 1) {
    var wavesurfer = WaveSurfer.create({
      container: '#wave_audio_source',
      waveColor: 'violet',
      progressColor: 'purple',
      scrollParent: true
    });
    $wave_toggle.click(function(){
      wavesurfer.playPause();
    });
    wavesurfer.load(window.AUDIO_SOURCE_SRC);
    window.wavesurfer = wavesurfer;

    // update start or end time
    wavesurfer.on('audioprocess', function(event){
      update_timestamp(wavesurfer.getCurrentTime());
    });
    wavesurfer.on('seek', function(event){
      update_timestamp(wavesurfer.getCurrentTime());
    });
    $('#results_body').on('click', 'input.audio_number', function(event){
      $(event.target).prev().click();
    });
  }

  
  // file upload
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


  

  // private methods
  function send_req(method, path){
    $results_form.attr('method', method);
    $results_form.attr('action', path);

    $results_form.submit();
  }

  function add_range(){
    var $tr = $('<tr></tr>');
    $tr.html(result_tempfile);
    $tr.find('td:first strong').text($results_body.find('tr').length);
    $tr.find('td input[name*=range_list]').val(wavesurfer.getCurrentTime());

    $results_body.append($tr);
    $tr.find('td input[name*=range_list]:last').click();

    $range_counter.text(1 + Number($range_counter.text()));
  }

  function update_timestamp(ts){
    $('#results_body input[type=radio]:checked').next().val(ts.toFixed(2));
  }

  
  if ($results_body.find('tr').length < 1) {
    add_range();
  }
}(window));
