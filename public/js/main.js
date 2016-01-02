(function(window){
  var $add_range_btn = $('#add_range_btn');
  var $results_body = $('#results_body');
  var $cut_btn = $('#cut_btn');
  var $results_form = $('#results_form');
  var $no_start_index = $('#no_start_index');
  var $wave_audio_source = $('#wave_audio_source');
  var $wave_toggle = $('#wave_toggle');
  var $range_counter = $('#range_counter');
  var $wave_zoom_val = $('#wave_zoom_val');
  var wavesurfer = null;
  var wave_region = null;
  var can_update_timestamp = true;
  var max_px_per_sec = 200;

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
    wavesurfer = WaveSurfer.create({
      container: '#wave_audio_source',
      scrollParent: true,
      pixelRatio: 1,
      normalize: true,
      minimap: true,
      height: 80,
      minPxPerSec: 15
    });
    
    wavesurfer.initMinimap({
      height: 30,
      waveColor: '#ddd',
      progressColor: '#999',
      cursorColor: '#999'
    });

    wavesurfer.on('ready', function(){
      var px_per_sec = 30000 / wavesurfer.getDuration();
      wavesurfer.zoom(px_per_sec > max_px_per_sec ? max_px_per_sec : px_per_sec);
      var timeline = Object.create(WaveSurfer.Timeline);
      timeline.init({
        wavesurfer: wavesurfer,
        container: '#wave_audio_timeline'
      });

      wave_region = wavesurfer.addRegion({
        drag: false,
        start: 0,
        end: 10,
        color: 'rgba(0, 0, 255, 0.1)'
      });
      update_region();
    });

    wavesurfer.on('play', function(){
      console.log('play')
    });
    wavesurfer.on('pause', function(){
      can_update_timestamp = true;
      console.log('pause')

      var $radio = $results_body.find('input[type=radio]:checked');
      if ($radio[0]) {
        console.log($radio.next().val());
        wavesurfer.seekTo(Number($radio.next().val()) / wavesurfer.getDuration());
      }
    });

    $wave_toggle.click(function(){
      wavesurfer.playPause();
    });

    // update start or end time
    wavesurfer.on('audioprocess', function(event){
      if (can_update_timestamp) {
        update_timestamp(wavesurfer.getCurrentTime());
      }
    });
    wavesurfer.on('seek', function(event){
      if (can_update_timestamp) {
        update_timestamp(wavesurfer.getCurrentTime());
      }
    });
    $('#results_body').on('click', 'input[name*=range_list],input[name=radio]', function(event){
      var $el = $(event.target);
      $el.prev()[0].checked = true;

      if (can_update_timestamp) {
        wavesurfer.seekTo(Number($el.val()) / wavesurfer.getDuration());
      }
    });

    // update region
    $('#results_body').on('change', 'input[name*=range_list]', function(event){
      update_region();
    });

    // operations
    $('#results_body').on('click', 'a.del_range', function(event){
      var no_start_index = Number($no_start_index.val());
      $(event.target).parents('tr:first').remove();
      $range_counter.text(Number($range_counter.text()) - 1);
      $results_body.find('tr').each(function(index, el){
        $(el).find('td:first strong').text(no_start_index + index);
      });
    });
    $('#results_body').on('click', 'a.play_range', function(event){
      var $tr = $(event.target).parents('tr:first');
      update_region($tr);
      can_update_timestamp = false;
      wave_region.play();
    });

    wavesurfer.load(window.AUDIO_SOURCE_SRC);
    window.wavesurfer = wavesurfer;
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
    var no_start_index = Number($no_start_index.val());
    $tr.html(result_tempfile);
    $tr.find('td:first strong').text(no_start_index + $results_body.find('tr').length);
    $tr.find('td input[name*=range_list]').val(wavesurfer.getCurrentTime().toFixed(2));

    $results_body.append($tr);
    $tr.find('td input[name*=range_list]:last').click();

    $range_counter.text(1 + Number($range_counter.text()));
  }

  function update_timestamp(ts){
    if (!can_update_timestamp) { return }
    var $el = $results_body.find('input[type=radio]:checked').next();
    $el.val(ts.toFixed(2));
    $el.change();
  }

  function update_region($tr){
    if (!wave_region) { return }

    if (!$tr) {
      var $radio = $results_body.find('input[type=radio]:checked');
      var $tr = $radio.parents('tr:first');
    }

    var start = $tr.find('input[name*=start_ts]:first').val();
    var end = $tr.find('input[name*=end_ts]:first').val();

    wave_region.update({
      start: Number(start),
      end: Number(end)
    })
  }

  
  if ($results_body.find('tr').length < 1) {
    add_range();
  }
}(window));
