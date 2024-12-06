@echo off
cd %~dp0
start cmd /k "pm2 link 1pdcydomgncdibm adwbcn03whx33cs && pm2 start server.js -i 6 --name Memoriter && pm2 monit"
echo