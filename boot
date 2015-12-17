#! /usr/bin/env ruby

puts "init..."

ROOT_DIR = File.dirname(__FILE__)
Dir.chdir(ROOT_DIR)

unless system('which -s ffmpeg')
  puts "Not found ffmpeg, please install."
  exit
end

system "cd #{ROOT_DIR}; bundle install --path ./gems"

require File.join(ROOT_DIR, 'app')

web_server_thread = Thread.new do
  AudioCutter.run!
end

unless ENV['QUIET']
  sleep 1
  system('open http://localhost:4567')
end

web_server_thread.join

