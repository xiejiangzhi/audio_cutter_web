# Options:
#   audio_file: audio file path
#   out_dir: out dir
#   range_list: [[1,2],[2,3], [2,4]]
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

    options[:range_list].each do |start_ts, end_ts|
      cut_index += 1
      duration = end_ts - start_ts
      volume = options[:volume_list][cut_index - 1]

      cmd << ("-ss %.1f -t %.1f" % [start_ts, duration])
      cmd << ("-af 'volume=%sdB'" % volume) if volume
      cmd << "-write_xing 0"
      cmd << ("#{options[:out_dir]}/%s.mp3" % cut_index.to_s)
    end

    puts cmd.join(' ')
    system(cmd.join(' '))
  end
end

