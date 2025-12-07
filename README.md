# XrayR 配置生成器

<div align="center">

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

**一个现代化的 XrayR 配置管理系统**

支持多面板、多节点管理，批量操作，SSH 自动部署

[快速开始](#-快速开始) • [功能特性](#-功能特性) • [文档](#-文档)

</div>

---

## 👤 原作者

本项目由 [qianyexiaoqian](https://github.com/qianyexiaoqian) 创建和维护。

---

## ✨ 功能特性

### 🎯 核心功能
- ✅ **四层数据架构**: 面板 → 分组 → 服务器 → 节点
- ✅ **配置生成**: 自动生成 XrayR YAML 配置
- ✅ **SSH 部署**: 一键上传配置到服务器
- ✅ **批量管理**: 批量上传文件、批量执行命令
- ✅ **代理支持**: HTTP/SOCKS4/SOCKS5 代理
- ✅ **多节点类型**: Shadowsocks、V2ray、Trojan

### 🎨 界面特色
- 🌈 现代化紫色渐变设计
- 💎 毛玻璃效果卡片
- ✨ 平滑动画过渡
- 📱 响应式布局
- 🖥️ VS Code 风格日志输出

### 🔒 安全特性
- 🔐 JWT Token 认证（24 小时过期）
- 🔑 密码 bcrypt 加密（成本因子 12）
- 🛡️ HTTP 安全头 (Helmet)
- 🚦 API 速率限制 (express-rate-limit)
- ✅ 输入验证与清理
- 🔒 SSH 密钥支持
- 🛡️ 防路径遍历攻击
- ⏱️ 登录失败延迟响应（防时序攻击）

---

## 🚀 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn

### 一键安装

**Windows**:
```cmd
install.bat
```

**Linux/Mac**:
```bash
chmod +x install.sh
./install.sh
```

**PowerShell**:
```powershell
.\install.ps1
```

### 启动项目

**方式一：一键启动** (推荐):
```cmd
start.bat
```

**方式二：使用 npm**:
```cmd
npm run dev
```

**方式三：分别启动**:
```cmd
# 终端1：启动后端
start-server.bat

# 终端2：启动前端
start-client.bat
```

### 访问系统
- **前端**: http://localhost:61146
- **后端**: http://localhost:61145
- **默认密码**: `admin123`

---

## 📖 文档

### 完整文档
- [项目总结](SUMMARY/项目总结.md) - 完整的项目文档
- [快速使用指南](SUMMARY/快速使用指南.md) - 5分钟快速上手
- [启动脚本说明](SUMMARY/启动脚本说明.md) - 启动脚本详细说明
- [API 文档](SUMMARY/API文档.md) - 完整的 API 接口文档
- [Windows 环境要求](SUMMARY/Windows环境要求.md) - Windows 安装配置

---

## 🎯 使用流程

### 1. 创建面板
```
点击 "➕ 新建面板" → 填写面板信息 → 保存
```

### 2. 创建分组
```
选择面板 → 点击 "➕ 新建分组" → 填写分组信息 → 保存
```

### 3. 添加服务器
```
选择分组 → 点击 "➕ 新建服务器" → 填写服务器信息 → 保存
```

### 4. 添加节点
```
选择服务器 → 点击 "➕ 新建节点" → 选择节点类型 → 填写节点信息 → 保存
```

### 5. 生成配置
```
选择节点 → 点击 "📄 生成配置" → 预览/复制/上传
```

---

## 🏗️ 技术栈

### 前端
- React 18
- React Router v6
- Axios
- Vite

### 后端
- Node.js
- Express.js
- JWT (jsonwebtoken)
- bcryptjs
- ssh2
- socks
- js-yaml
- Helmet (HTTP 安全头)
- express-rate-limit (速率限制)

---

## 📁 项目结构

```
XrayR 配置生成器/
├── client/              # 前端项目
│   └── src/
│       ├── pages/       # 页面组件
│       ├── components/  # UI 组件
│       ├── hooks/       # 自定义 Hooks
│       ├── utils/       # 工具函数
│       └── styles/      # CSS 样式
├── server/              # 后端项目
│   ├── routes/          # API 路由模块
│   ├── middleware/      # 中间件
│   └── utils/           # 工具函数
├── data/                # 数据存储 (JSON)
├── SUMMARY/             # 项目文档
├── install.bat          # Windows 安装脚本
├── install.sh           # Linux/Mac 安装脚本
└── install.ps1          # PowerShell 安装脚本
```

---

## 🔧 配置说明

### 端口配置
- **前端端口**: 61146 (可在 `client/vite.config.js` 修改)
- **后端端口**: 61145 (可在 `.env` 的 `PORT` 修改)

### 环境变量 (`.env`)

```env
PORT=61145              # 后端端口
JWT_SECRET=xxx          # JWT 密钥（生产环境必须修改）
ADMIN_PASSWORD=xxx      # 管理员密码
DATA_PATH=./data        # 数据存储路径
CORS_ORIGIN=            # CORS 允许来源（生产环境建议设置）
```

### 数据存储
- 所有数据存储在 `data/` 目录
- JSON 格式文件
- 建议定期备份

---

## 🔐 安全机制

### 已实现的安全特性

| 特性 | 说明 |
|------|------|
| HTTP 安全头 | Helmet 中间件，包含 X-Content-Type-Options、X-Frame-Options 等 |
| 速率限制 | 全局: 1000次/15分钟/IP，登录: 5次/15分钟/IP |
| 输入验证 | 防路径遍历、验证服务器地址、检测危险命令 |
| 认证安全 | bcrypt 加密、JWT Token、登录失败延迟 |
| 请求安全 | 请求体大小限制 1MB、CORS 配置 |

### 生产环境部署检查清单

- [ ] 修改 `JWT_SECRET` 为强随机字符串（至少 64 字符）
- [ ] 修改管理员密码为强密码（至少 8 位，包含字母和数字）
- [ ] 设置 `CORS_ORIGIN` 为具体域名
- [ ] 使用 HTTPS 反向代理（如 Nginx）
- [ ] 配置防火墙，仅开放必要端口
- [ ] 定期备份 `data/` 目录

---

## 📝 常见问题

### 端口被占用
```cmd
# 查看占用端口的进程
netstat -ano | findstr :61145

# 结束进程
taskkill /PID <进程ID> /F
```

### npm 安装慢
```cmd
# 使用国内镜像
npm config set registry https://registry.npmmirror.com
```

### 更多问题
查看 [Windows 环境要求](SUMMARY/Windows环境要求.md)

---

## 📄 许可证

[MIT License](LICENSE)

---

<div align="center">

**Made with ❤️ by [imhuimie](https://github.com/imhuimie)**

</div>
