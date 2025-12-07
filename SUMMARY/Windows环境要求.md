# Windows 本地运行环境要求

## 📋 必需软件清单

### 1. **Node.js** (必需)
- **版本要求**: 18.0 或更高版本
- **推荐版本**: 20.x LTS (长期支持版本)
- **下载地址**: https://nodejs.org/
- **安装说明**:
  - 下载 Windows Installer (.msi)
  - 运行安装程序，保持默认选项
  - 勾选 "Automatically install the necessary tools" (自动安装必要工具)
  - 安装完成后重启命令行窗口

- **验证安装**:
  ```cmd
  node --version
  npm --version
  ```

### 2. **Git** (可选，推荐)
- **版本要求**: 2.x 或更高
- **下载地址**: https://git-scm.com/download/win
- **用途**: 版本控制、代码更新
- **安装说明**:
  - 下载 Git for Windows
  - 运行安装程序
  - 推荐选项：
    - 使用 Git Bash
    - 使用 Windows 默认控制台窗口
    - 启用文件系统缓存

- **验证安装**:
  ```cmd
  git --version
  ```

### 3. **代码编辑器** (可选，推荐)
推荐以下任一编辑器：

#### Visual Studio Code (推荐)
- **下载地址**: https://code.visualstudio.com/
- **优点**: 
  - 免费开源
  - 强大的插件生态
  - 内置终端
  - Git 集成
- **推荐插件**:
  - ESLint
  - Prettier
  - JavaScript (ES6) code snippets
  - React Extension Pack

#### 其他选择
- **WebStorm**: https://www.jetbrains.com/webstorm/ (付费，功能强大)
- **Sublime Text**: https://www.sublimetext.com/ (轻量级)
- **Notepad++**: https://notepad-plus-plus.org/ (轻量级)

---

## 🔧 可选工具

### 1. **终端工具**
推荐使用以下任一终端：

#### Windows Terminal (推荐)
- **下载地址**: Microsoft Store 搜索 "Windows Terminal"
- **优点**: 
  - 现代化界面
  - 支持多标签
  - 支持 PowerShell、CMD、Git Bash
  - 高度可定制

#### PowerShell 7+
- **下载地址**: https://github.com/PowerShell/PowerShell/releases
- **优点**: 
  - 跨平台
  - 功能强大
  - 更好的脚本支持

### 2. **SSH 客户端** (可选)
如果需要测试 SSH 连接功能：

#### PuTTY
- **下载地址**: https://www.putty.org/
- **用途**: SSH 连接测试

#### OpenSSH (Windows 10/11 内置)
- **启用方法**:
  1. 设置 → 应用 → 可选功能
  2. 添加功能 → OpenSSH 客户端
  3. 安装

---

## 💻 系统要求

### 最低配置
- **操作系统**: Windows 10 (1809 或更高) / Windows 11
- **处理器**: 双核 2.0 GHz
- **内存**: 4 GB RAM
- **硬盘**: 500 MB 可用空间
- **网络**: 互联网连接（用于安装依赖）

### 推荐配置
- **操作系统**: Windows 11
- **处理器**: 四核 2.5 GHz 或更高
- **内存**: 8 GB RAM 或更高
- **硬盘**: 2 GB 可用空间（SSD 推荐）
- **网络**: 稳定的互联网连接

---

## 📦 安装步骤

### 方法 1: 使用自动安装脚本 (推荐)

#### 使用 BAT 脚本
```cmd
install.bat
```

#### 使用 PowerShell 脚本
```powershell
.\install.ps1
```

### 方法 2: 手动安装

1. **安装后端依赖**
   ```cmd
   npm install
   ```

2. **安装前端依赖**
   ```cmd
   cd client
   npm install
   cd ..
   ```

3. **创建数据目录**
   ```cmd
   mkdir data
   ```

---

## 🚀 启动项目

### 方式 1: 同时启动前后端 (推荐)
```cmd
npm run dev
```

### 方式 2: 分别启动

**启动后端**:
```cmd
npm run server
```

**启动前端** (新开一个终端):
```cmd
cd client
npm run dev
```

---

## 🌐 访问地址

- **前端界面**: http://localhost:61146
- **后端 API**: http://localhost:61145
- **默认密码**: admin123

---

## ⚠️ 常见问题

### 1. 端口被占用
如果端口 61145 或 61146 被占用：

**查看占用端口的进程**:
```cmd
netstat -ano | findstr :61145
netstat -ano | findstr :61146
```

**结束进程**:
```cmd
taskkill /PID <进程ID> /F
```

### 2. npm 安装速度慢
使用国内镜像源：

```cmd
npm config set registry https://registry.npmmirror.com
```

### 3. 权限问题
以管理员身份运行命令行：
- 右键点击 CMD 或 PowerShell
- 选择"以管理员身份运行"

### 4. Node.js 版本过低
卸载旧版本，安装最新 LTS 版本：
- 控制面板 → 程序和功能 → 卸载 Node.js
- 下载最新版本重新安装

---

## 📞 技术支持

如遇到问题，请检查：
1. Node.js 版本是否符合要求
2. 网络连接是否正常
3. 防火墙是否阻止了端口
4. 杀毒软件是否误报

---

## 📝 备注

- 首次运行会自动创建 `data` 目录用于存储数据
- 所有数据以 JSON 格式存储在 `data/` 目录下
- 默认密码可在系统设置中修改
- 建议定期备份 `data/` 目录

