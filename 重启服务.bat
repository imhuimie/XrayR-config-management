@echo off
echo 正在停止所有 Node 进程...
taskkill /F /IM node.exe 2>nul

echo.
echo 等待 2 秒...
timeout /t 2 /nobreak >nul

echo.
echo 启动后端服务器...
start "XrayR后端" cmd /k "cd /d %~dp0 && node server/index.js"

echo.
echo 等待 3 秒...
timeout /t 3 /nobreak >nul

echo.
echo 启动前端服务器...
start "XrayR前端" cmd /k "cd /d %~dp0\client && npm run dev"

echo.
echo ========================================
echo 服务启动完成！
echo 后端: http://localhost:3000
echo 前端: http://localhost:5173
echo ========================================
echo.
pause

