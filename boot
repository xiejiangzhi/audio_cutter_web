#! /usr/bin/env ruby

puts "init..."

ROOT_DIR = File.dirname(__FILE__)
Dir.chdir(ROOT_DIR)

pid_file = './server.pid'
old_pid = File.exist?(pid_file) ? File.read(pid_file).to_i : nil

if old_pid
  begin
    Process.getpgid(old_pid)
    puts "kill old pid #{old_pid}"
    Process.kill('KILL', old_pid)
  rescue Errno::ESRCH
    puts "ignore old pid #{old_pid}"
  end
end
pid = Process.pid
puts "pid: #{pid}"
File.open(pid_file, 'w+') {|f| f.write(pid) }


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

