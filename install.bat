@echo off
chcp 65001 >nul
echo ========================================
echo    XrayR 配置生成器 - 安装脚本
echo ========================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [信息] Node.js 版本:
node --version
echo.

REM 创建数据目录
if not exist "data" (
    mkdir data
    echo [成功] 已创建数据目录
    echo.
)

REM 安装后端依赖
echo [步骤 1/2] 正在安装后端依赖...
call npm install
if %errorlevel% neq 0 (
    echo [错误] 后端依赖安装失败
    pause
    exit /b 1
)
echo [成功] 后端依赖安装完成
echo.

REM 安装前端依赖
echo [步骤 2/2] 正在安装前端依赖...
cd client
call npm install
if %errorlevel% neq 0 (
    echo [错误] 前端依赖安装失败
    pause
    exit /b 1
)
cd ..
echo [成功] 前端依赖安装完成
echo.

echo ========================================
echo    ✨ 安装完成！
echo ========================================
echo.
echo 启动方式:
echo   方式1 (推荐): npm run dev
echo   方式2: 分别启动
echo     - 后端: npm run server
echo     - 前端: cd client ^&^& npm run dev
echo.
echo 访问地址:
echo   - 前端: http://localhost:61146
echo   - 后端: http://localhost:61145
echo.
echo 默认登录密码: admin123
echo.
pause

