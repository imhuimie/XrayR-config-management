@echo off
chcp 65001 >nul
echo ========================================
echo    XrayR 配置生成器 - 快速启动脚本
echo ========================================
echo.

echo [1/4] 检查并停止占用端口的进程...
echo.

REM 检查并停止占用 61145 端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :61145 ^| findstr LISTENING') do (
    echo 发现端口 61145 被进程 %%a 占用，正在停止...
    taskkill /F /PID %%a >nul 2>&1
)

REM 检查并停止占用 61146 端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :61146 ^| findstr LISTENING') do (
    echo 发现端口 61146 被进程 %%a 占用，正在停止...
    taskkill /F /PID %%a >nul 2>&1
)

echo ✅ 端口检查完成
echo.

echo [2/4] 检查依赖安装...
echo.

REM 检查 node_modules
if not exist node_modules (
    echo 正在安装后端依赖...
    call npm install
    echo.
)

REM 检查前端依赖
if not exist client\node_modules (
    echo 正在安装前端依赖...
    cd client
    call npm install
    cd ..
    echo.
)

echo ✅ 依赖检查完成
echo.

echo [3/4] 启动服务...
echo.
echo 后端服务: http://localhost:61145
echo 前端界面: http://localhost:61146
echo 默认密码: admin123
echo.
echo 按 Ctrl+C 停止服务
echo ========================================
echo.

call npm run dev

