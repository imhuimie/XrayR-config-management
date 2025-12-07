# XrayR 配置生成器 - 自动安装脚本 (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  XrayR 配置生成器 - 自动安装脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "[1/4] 检查 Node.js 环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 已安装" -ForegroundColor Green
    Write-Host $nodeVersion -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ 错误: 未检测到 Node.js" -ForegroundColor Red
    Write-Host "请先安装 Node.js 18.0 或更高版本" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "按任意键退出"
    exit 1
}

# 安装后端依赖
Write-Host "[2/4] 安装后端依赖..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 后端依赖安装失败" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}
Write-Host "✅ 后端依赖安装完成" -ForegroundColor Green
Write-Host ""

# 安装前端依赖
Write-Host "[3/4] 安装前端依赖..." -ForegroundColor Yellow
Set-Location client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 前端依赖安装失败" -ForegroundColor Red
    Set-Location ..
    Read-Host "按任意键退出"
    exit 1
}
Set-Location ..
Write-Host "✅ 前端依赖安装完成" -ForegroundColor Green
Write-Host ""

# 创建数据目录
Write-Host "[4/4] 创建数据目录..." -ForegroundColor Yellow
if (-not (Test-Path "data")) {
    New-Item -ItemType Directory -Path "data" | Out-Null
}
Write-Host "✅ 数据目录已创建" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✨ 安装完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "启动方式:" -ForegroundColor White
Write-Host "  方式1 (推荐): npm run dev" -ForegroundColor Gray
Write-Host "  方式2: 分别启动" -ForegroundColor Gray
Write-Host "    - 后端: npm run server" -ForegroundColor Gray
Write-Host "    - 前端: cd client; npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "访问地址:" -ForegroundColor White
Write-Host "  - 前端: http://localhost:61146" -ForegroundColor Cyan
Write-Host "  - 后端: http://localhost:61145" -ForegroundColor Cyan
Write-Host ""
Write-Host "默认登录密码: admin123" -ForegroundColor Yellow
Write-Host ""
Read-Host "按任意键退出"

