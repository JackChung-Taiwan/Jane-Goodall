@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js 22+ is required. Install from https://nodejs.org/
  pause
  exit /b 1
)
echo Installing dependencies...
call npm install
if errorlevel 1 (
  echo Cannot install dependencies. Check network and npm registry access.
  pause
  exit /b 1
)
echo Starting interactive forest website...
call npm run dev
pause
