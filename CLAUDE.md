# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

XrayR 配置生成器是一个前后端分离的 Web 应用，用于管理和生成 XrayR 代理配置文件。支持多面板、多分组、多服务器、多节点的四层数据架构，以及 SSH 自动部署功能。

## 技术栈

- **前端**: React 18 + Vite + React Router v6 + Axios
- **后端**: Node.js + Express.js + JWT + bcryptjs + ssh2
- **安全**: Helmet + express-rate-limit + 输入验证
- **数据存储**: JSON 文件 (`data/` 目录)

## 常用命令

```bash
# 安装依赖
npm install && cd client && npm install && cd ..

# 开发模式（同时启动前后端）
npm run dev

# 仅启动后端
npm run server

# 仅启动前端
npm run client

# 构建前端
npm run build

# 生产模式启动
npm start
```

**Windows 快捷脚本**:
- `install.bat` - 安装依赖
- `start.bat` - 启动项目
- `start-server.bat` - 仅启动后端
- `start-client.bat` - 仅启动前端

## 端口配置

- 前端开发服务器: `61146` (配置于 `client/vite.config.js`)
- 后端 API 服务器: `61145` (配置于 `.env` 的 `PORT`)
- Vite 自动代理 `/api` 请求到后端

## 架构说明

### 数据层级关系
```
面板 (Panel) → 分组 (ServerGroup) → 服务器 (Server) → 节点 (Node)
```

### 后端结构 (`server/`)
- `index.js` - Express 服务入口（含安全中间件配置）
- `routes/` - API 路由模块
  - `auth.js` - 认证 (登录/验证，含速率限制)
  - `panels.js` - 面板 CRUD
  - `serverGroups.js` - 分组 CRUD
  - `servers.js` - 服务器 CRUD
  - `nodes.js` - 节点 CRUD
  - `config.js` - 配置生成
  - `ssh.js` - SSH 连接与部署
  - `batch.js` - 批量操作
  - `settings.js` - 系统设置
- `middleware/auth.js` - JWT 认证中间件
- `utils/`
  - `dataStore.js` - JSON 文件读写工具（使用工厂模式）
  - `crudFactory.js` - CRUD 路由工厂函数
  - `validator.js` - 输入验证工具（安全模块）

### 前端结构 (`client/src/`)
- `pages/` - 页面组件 (Login, Dashboard, BatchManagement)
- `components/` - UI 组件
  - `ListCard.jsx` - 通用列表卡片组件
  - 各类 Modal、List、Viewer 组件
- `hooks/` - 自定义 Hooks
  - `useToast.js` - Toast 通知管理
  - `useConfirmDialog.js` - 确认对话框管理
  - `useCrudModal.js` - CRUD 模态框状态管理
  - `useApiData.js` - API 数据加载
- `utils/api.js` - Axios 请求封装
- `styles/` - CSS 样式文件

### 数据存储 (`server/data/`)
- `panels.json` - 面板数据
- `serverGroups.json` - 分组数据
- `servers.json` - 服务器数据
- `nodes.json` - 节点数据
- `settings.json` - 系统设置

## API 路由规范

所有 API 以 `/api` 为前缀，除认证接口外均需 JWT Token：

| 模块 | 路径前缀 | 说明 |
|------|----------|------|
| 认证 | `/api/auth` | 登录、Token 验证 |
| 面板 | `/api/panels` | 面板 CRUD |
| 分组 | `/api/server-groups` | 分组 CRUD |
| 服务器 | `/api/servers` | 服务器 CRUD |
| 节点 | `/api/nodes` | 节点 CRUD |
| 配置 | `/api/config` | 配置生成 |
| SSH | `/api/ssh` | SSH 操作 |
| 批量 | `/api/batch` | 批量操作 |
| 设置 | `/api/settings` | 系统设置 |

## 环境变量 (`.env`)

```env
PORT=61145              # 后端端口
JWT_SECRET=xxx          # JWT 密钥（生产环境必须修改）
ADMIN_PASSWORD=xxx      # 管理员密码
DATA_PATH=./data        # 数据存储路径
CORS_ORIGIN=            # CORS 允许来源（生产环境建议设置）
```

## 安全机制

### 已实现的安全特性

1. **HTTP 安全头** (Helmet)
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection
   - 等其他安全响应头

2. **速率限制** (express-rate-limit)
   - 全局限制: 每 15 分钟每 IP 最多 1000 次请求
   - 登录限制: 每 15 分钟每 IP 最多 5 次登录尝试

3. **输入验证** (`server/utils/validator.js`)
   - `isValidFilePath()` - 防止路径遍历攻击
   - `isValidServerAddress()` - 验证服务器地址格式
   - `isValidCommand()` - 检测危险命令模式
   - `isValidId()` - 验证 ID 格式
   - `isValidUrl()` - 验证 URL 格式
   - `isValidLength()` - 验证字符串长度

4. **认证安全**
   - bcrypt 密码加密（成本因子 12）
   - JWT Token 认证（24 小时过期）
   - 登录失败延迟响应（防时序攻击）

5. **请求安全**
   - 请求体大小限制（1MB）
   - CORS 配置（可限制来源）

### 生产环境部署检查清单

- [ ] 修改 `JWT_SECRET` 为强随机字符串（至少 64 字符）
- [ ] 修改管理员密码为强密码（至少 8 位，包含字母和数字）
- [ ] 设置 `CORS_ORIGIN` 为具体域名
- [ ] 使用 HTTPS 反向代理（如 Nginx）
- [ ] 配置防火墙，仅开放必要端口
- [ ] 定期备份 `data/` 目录

## 开发规范

- 使用 ES6+ 语法和 ES Modules (`"type": "module"`)
- React 使用函数式组件和自定义 Hooks
- 异步操作使用 async/await
- 组件命名: PascalCase
- 函数/变量命名: camelCase
- CSS 使用 BEM 命名规范和 CSS 变量
- 遵循 DRY 原则，使用工厂函数和通用组件消除重复代码
- 所有用户输入必须经过验证和清理

## 依赖包说明

### 后端核心依赖
- `express` - Web 框架
- `jsonwebtoken` - JWT 认证
- `bcryptjs` - 密码加密
- `ssh2` - SSH 连接
- `socks` - 代理支持
- `js-yaml` - YAML 处理
- `helmet` - HTTP 安全头
- `express-rate-limit` - 速率限制
- `cors` - 跨域支持
- `dotenv` - 环境变量

### 前端核心依赖
- `react` - UI 框架
- `react-router-dom` - 路由
- `axios` - HTTP 客户端
- `vite` - 构建工具

---

**最后更新**: 2025-12-07
**版本**: 1.1.0 (安全增强版)
