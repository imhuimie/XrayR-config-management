#!/bin/bash

echo "========================================"
echo "  XrayR 配置生成器 - 自动安装脚本"
echo "========================================"
echo ""

# 检查 Node.js
echo "[1/4] 检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到 Node.js"
    echo "请先安装 Node.js 18.0 或更高版本"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js 已安装"
node --version
echo ""

# 安装后端依赖
echo "[2/4] 安装后端依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ 后端依赖安装失败"
    exit 1
fi
echo "✅ 后端依赖安装完成"
echo ""

# 安装前端依赖
echo "[3/4] 安装前端依赖..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "❌ 前端依赖安装失败"
    cd ..
    exit 1
fi
cd ..
echo "✅ 前端依赖安装完成"
echo ""

# 创建数据目录
echo "[4/4] 创建数据目录..."
mkdir -p data
echo "✅ 数据目录已创建"
echo ""

echo "========================================"
echo "  ✨ 安装完成！"
echo "========================================"
echo ""
echo "启动方式:"
echo "  方式1 (推荐): npm run dev"
echo "  方式2: 分别启动"
echo "    - 后端: npm run server"
echo "    - 前端: cd client && npm run dev"
echo ""
echo "访问地址:"
echo "  - 前端: http://localhost:61146"
echo "  - 后端: http://localhost:61145"
echo ""
echo "默认登录密码: admin123"
echo ""

