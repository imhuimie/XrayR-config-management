# ⚡ 快速开始指南

## 🎯 5分钟快速上手

### 第一步：安装依赖（2分钟）

**Windows 用户**：
```bash
双击运行 install.bat
```

**Linux/Mac 用户**：
```bash
npm install
cd client && npm install && cd ..
```

### 第二步：启动服务（1分钟）

**Windows 用户**：
```bash
双击运行 start.bat
```

**Linux/Mac 用户**：
```bash
npm run dev
```

### 第三步：登录系统（30秒）

1. 打开浏览器访问: http://localhost:5173
2. 输入密码: `admin123456`
3. 点击"登录"

### 第四步：添加面板（1分钟）

1. 点击"+ 添加面板"
2. 填写信息：
   - 面板名称: `测试面板`
   - 面板域名: `https://your-panel.com`
   - 通讯密钥: `your-api-key`
3. 点击"保存"

### 第五步：添加节点（1分钟）

1. 选择刚创建的面板
2. 点击"+ 添加节点"
3. 填写基本信息：
   - 节点名称: `香港节点1`
   - 节点ID: `528`
   - 节点类型: `Vless`
4. 配置证书（可选）
5. 点击"保存"

### 第六步：生成配置（30秒）

1. 点击节点的"查看配置"按钮
2. 点击"📋 复制配置"
3. 配置已复制到剪贴板！

## 🎉 完成！

现在你可以：
- 将配置粘贴到 XrayR 的 config.yml 文件
- 重启 XrayR 服务
- 开始使用！

## 📚 下一步

- 阅读 [详细使用教程](USAGE.md)
- 查看 [项目概览](PROJECT_OVERVIEW.md)
- 查看 [配置示例](config-example.yml)

## ❓ 遇到问题？

### 问题1: 端口被占用
**解决**: 编辑 `.env` 文件，修改 `PORT=3000` 为其他端口

### 问题2: 无法启动
**解决**: 
1. 运行 `test-setup.bat` 检查环境
2. 确保 Node.js 已安装
3. 重新运行 `install.bat`

### 问题3: 忘记密码
**解决**: 编辑 `.env` 文件，修改 `ADMIN_PASSWORD`

## 🔒 安全提示

⚠️ **首次使用后请立即修改密码！**

编辑 `.env` 文件：
```env
ADMIN_PASSWORD=your-new-strong-password
JWT_SECRET=your-random-secret-key
```

## 📞 获取帮助

- 查看 [README.md](README.md)
- 查看 [USAGE.md](USAGE.md)
- 提交 Issue

---

**开始使用 XrayR 配置生成器，享受便捷的配置管理体验！** 🚀

