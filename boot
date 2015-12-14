#! /usr/bin/env ruby

puts "init..."

unless system('which -s ffmpeg')
  puts "Not found ffmpeg, please install."
  exit
end

system 'bundle install'

require './app'

web_server_thread = Thread.new do
  AudioCutter.run!
end

unless ENV['QUIET']
  sleep 1
  system('open http://localhost:4567')
end

web_server_thread.join

