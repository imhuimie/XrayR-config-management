@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   启动后端服务器 (端口 61145)
echo ========================================
echo.

REM 检查并停止占用 61145 端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :61145 ^| findstr LISTENING') do (
    echo 发现端口 61145 被进程 %%a 占用，正在停止...
    taskkill /F /PID %%a >nul 2>&1
)

echo 正在启动后端服务器...
echo 后端服务: http://localhost:61145
echo.
node server/index.js

