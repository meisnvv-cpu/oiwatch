@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
set "XDG_CONFIG_HOME=%~dp0..\.wrangler-auth"
call "%~dp0..\node_modules\.bin\wrangler.cmd" login --no-use-keyring
