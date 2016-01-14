require 'bundler/setup'

require 'sinatra/base'
require 'active_support'
require 'active_support/core_ext'
require 'slim'
require File.expand_path('../cutter', __FILE__)

require 'securerandom'
require 'shellwords'
require 'pry'

class AudioCutter < Sinatra::Base
  set :root, File.dirname(__FILE__)
  set :public_foler, File.join(root, 'public')
  set :server, :thin

  REQ_LOGGER = Logger.new(File.expand_path('../log/req.log', __FILE__))

  helpers do
    def current_id
      params[:id]
    end

    def current_web_root
      "/#{current_id}"
    end

    def current_audios_dir
      File.join(settings.public_folder, 'audios', current_id)
    end

    def current_web_audios_dir
      File.join('/audios', current_id)
    end

    def current_audio_source
      File.join(current_audios_dir, 'source.mp3')
    end

    def current_web_audio_source
      File.join(current_web_audios_dir, 'source.mp3')
    end

    def current_results_dir
      File.join(current_audios_dir, 'cut')
    end

    # [{start_ts: 1, end_ts: 2, filename: fn}]
    def range_list
      @range_list ||= (params[:range_list] || []).each_with_index.map do |range, index|
        {}.tap do |result|
          [:start_ts, :end_ts].each {|key| result[key] = range[key].to_f.round(2) }
          result[:filename] = ((params[:no_start_index] || 1).to_i + index).to_s
        end
      end
    end

    def volume_list
      @volume_list ||= (params[:volume_list] || []).map do |volume|
        volume.to_i
      end
    end

    def current_web_results
      range_list.each_with_index.map do |range, index|
        volume = volume_list[index]
        audio_path = File.join('cut', "#{range[:filename]}.mp3")

        audio_path = if File.exist?(File.join(current_audios_dir, audio_path))
          File.join(current_web_audios_dir, audio_path)
        end

        [range, volume || 0, audio_path, index]
      end
    end


    def check_current_id
      system("mkdir -p #{current_audios_dir}/cut") unless Dir.exist?("#{current_audios_dir}/cut")
    end

    def clean_invalid_results!
      valid_file_names = range_list.map {|range| "#{range[:filename]}.mp3" }

      Dir[File.join(current_results_dir, '*')].each do |path|
        next if valid_file_names.include?(File.basename(path))
        system("rm -f #{Shellwords.escape(path)}")
      end
    end

    def redirect_to_current_web_root
      redirect to(current_web_root + "?" + request_data.to_query)
    end

    def request_data
      @request_data ||= params.slice(
        'range_list', 'volume_list', 'no_start_index'
      )
    end
  end


  before do
    req_data = request.env['rack.request.form_vars'] || request.env['QUERY_STRING']
    REQ_LOGGER.info("#{request.path}?#{req_data}") if req_data.to_s.length > 0
  end


  get '/' do
    redirect to("/#{SecureRandom.uuid}")
  end


  get '/:id' do
    check_current_id
    slim :index
  end

  post '/:id/audio' do
    audio_path = params[:audio][:tempfile].path
    cmd = [
      "ffmpeg -y -i #{audio_path}",
      "-ab 128k -map_metadata 0 -id3v2_version 3 #{current_audio_source}"
    ].join(' ')
    puts cmd
    system(cmd)
    redirect_to_current_web_root
  end

  get '/:id/audio' do
    redirect_to_current_web_root
  end

  post '/:id/results' do
    Cutter.new({
      audio_file: current_audio_source,
      out_dir: current_results_dir,
      range_list: range_list.map {|range| range.values_at(:start_ts, :end_ts, :filename) },
      volume_list: volume_list
    }).cut

    redirect_to_current_web_root
  end

  get '/:id/results_dir' do
    clean_invalid_results!
    system("open #{current_results_dir}")

    redirect_to_current_web_root
  end
end

