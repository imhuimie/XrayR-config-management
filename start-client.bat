@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   启动前端开发服务器 (端口 61146)
echo ========================================
echo.

REM 检查并停止占用 61146 端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :61146 ^| findstr LISTENING') do (
    echo 发现端口 61146 被进程 %%a 占用，正在停止...
    taskkill /F /PID %%a >nul 2>&1
)

echo 正在启动前端服务器...
echo 前端界面: http://localhost:61146
echo.
cd client
npm run dev

