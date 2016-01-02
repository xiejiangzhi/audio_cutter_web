# Options:
#   audio_file: audio file path
#   out_dir: out dir
#   range_list: [[1,2, filename],[2,3, filename], [2,4, filename]]
#   volume_list: [1, 5, 3]
#
class Cutter
  attr_reader :options

  def initialize(options)
    @options = options
  end

  def cut
    cut_index = 0
    cmd = ['ffmpeg', '-y', "-i #{options[:audio_file]}"]

    options[:range_list].each do |start_ts, end_ts, filename|
      cut_index += 1
      duration = end_ts - start_ts
      volume = options[:volume_list][cut_index - 1]

      cmd << ("-ss %.1f -t %.1f" % [start_ts, duration])
      cmd << ("-af 'volume=%sdB'" % volume) if volume
      cmd << "-write_xing 0"
      cmd << ("#{options[:out_dir]}/%s.mp3" % filename)
    end

    puts cmd.join(' ')
    system(cmd.join(' '))
  end
end

