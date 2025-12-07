# 📖 XrayR 配置生成器 - 详细使用教程

## 🚀 快速开始

### Windows 用户

1. **安装依赖**
   ```bash
   双击运行 install.bat
   ```

2. **启动服务**
   ```bash
   双击运行 start.bat
   ```

3. **访问系统**
   - 打开浏览器访问: http://localhost:5173
   - 默认密码: `admin123456`

### Linux/Mac 用户

1. **安装依赖**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **配置环境**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件修改密码
   ```

3. **启动服务**
   ```bash
   npm run dev
   ```

## 📋 详细操作指南

### 一、登录系统

1. 访问 http://localhost:5173
2. 输入管理员密码（默认: admin123456）
3. 点击"登录"按钮

> 💡 **安全提示**: 首次使用后请立即修改 `.env` 文件中的 `ADMIN_PASSWORD`

### 二、管理面板

#### 添加面板

1. 点击左侧"📋 面板列表"区域的"+ 添加面板"按钮
2. 填写面板信息：
   - **面板名称**: 自定义名称，如"主面板"、"备用面板"
   - **面板域名**: XB面板的完整URL，如 `https://panel.example.com`
   - **通讯密钥**: 在XB面板后台获取的API Key
3. 点击"保存"按钮

#### 编辑面板

1. 在面板列表中找到要编辑的面板
2. 点击"编辑"按钮
3. 修改信息后点击"保存"

#### 删除面板

1. 点击面板的"删除"按钮
2. 确认删除操作

> ⚠️ **注意**: 删除面板不会删除该面板下的节点数据

#### 查看面板配置

点击面板的"查看配置"按钮，可以查看该面板下所有节点的完整配置。

### 三、管理节点

#### 添加节点

1. **选择面板**: 在左侧面板列表中点击选择一个面板
2. **添加节点**: 点击右侧"🖥️ 节点列表"区域的"+ 添加节点"按钮
3. **填写基础信息**:
   - **节点名称**: 如"香港节点1"、"美国节点2"
   - **节点ID**: 在XB面板中创建节点后获得的唯一ID（数字）
   - **节点类型**: 选择协议类型（Vless/Vmess/Shadowsocks/Trojan）
   - **超时时间**: 默认30秒
   - **速度限制**: 单位Mbps，0表示不限速
   - **设备限制**: 0表示不限制设备数

4. **配置协议参数**:
   - **Vless**: 选择 Flow 类型（xtls-rprx-vision 推荐）
   - **其他协议**: 根据需要配置

5. **配置证书**:
   - **证书模式**: 
     - `file`: 使用已有证书文件（需填写证书路径）
     - `dns`: DNS验证自动申请
     - `http`: HTTP验证自动申请
     - `none`: 不使用证书
   - **证书域名**: 节点的域名
   - **证书文件路径**: 如 `/root/cert/fullchain.pem`
   - **密钥文件路径**: 如 `/root/cert/privkey.pem`

6. 点击"保存"按钮

#### 编辑节点

1. 在节点列表中找到要编辑的节点
2. 点击"编辑"按钮
3. 修改信息后点击"保存"

#### 删除节点

1. 点击节点的"删除"按钮
2. 确认删除操作

#### 查看节点配置

点击节点的"查看配置"按钮，可以查看该节点的完整配置。

### 四、生成和使用配置

#### 方式一：单节点配置

1. 点击节点的"查看配置"按钮
2. 在弹出的配置查看器中点击"📋 复制配置"
3. 配置已复制到剪贴板

#### 方式二：面板配置（推荐）

1. 点击面板的"查看配置"按钮
2. 系统会生成该面板下所有节点的配置
3. 点击"📋 复制配置"复制完整配置

#### 部署配置到服务器

1. **复制配置**: 使用上述方式复制配置
2. **登录服务器**: SSH登录到XrayR服务器
3. **创建配置文件**:
   ```bash
   nano /etc/XrayR/config.yml
   # 或
   vim /etc/XrayR/config.yml
   ```
4. **粘贴配置**: 将复制的配置粘贴到文件中
5. **保存文件**: 
   - nano: Ctrl+O 保存，Ctrl+X 退出
   - vim: 按ESC，输入 `:wq` 保存退出
6. **重启服务**:
   ```bash
   systemctl restart XrayR
   # 或
   xrayr restart
   ```
7. **查看状态**:
   ```bash
   systemctl status XrayR
   # 或
   xrayr status
   ```

## 🔧 配置示例

### Vless 节点配置示例

```yaml
- PanelType: "NewV2board"
  ApiConfig:
    ApiHost: "https://panel.example.com"
    ApiKey: "your-api-key-here"
    NodeID: 528
    NodeType: Vless
    Timeout: 30
    VlessFlow: "xtls-rprx-vision"
    SpeedLimit: 0
    DeviceLimit: 0
  ControllerConfig:
    ListenIP: 0.0.0.0
    SendIP: 0.0.0.0
    UpdatePeriodic: 60
    EnableDNS: false
    DNSType: AsIs
    EnableProxyProtocol: false
  CertConfig:
    CertMode: file
    CertDomain: "node.example.com"
    CertFile: /root/cert/fullchain.pem
    KeyFile: /root/cert/privkey.pem
```

### Shadowsocks 节点配置示例

```yaml
- PanelType: "NewV2board"
  ApiConfig:
    ApiHost: "https://panel.example.com"
    ApiKey: "your-api-key-here"
    NodeID: 527
    NodeType: Shadowsocks
    Timeout: 30
    SpeedLimit: 0
    DeviceLimit: 0
  ControllerConfig:
    ListenIP: 0.0.0.0
    SendIP: 0.0.0.0
    UpdatePeriodic: 60
    EnableDNS: false
    DNSType: AsIs
    EnableProxyProtocol: false
```

## 💡 使用技巧

### 1. 批量管理节点

- 为同一面板添加多个节点
- 使用面板配置功能一次性生成所有节点配置
- 适合管理多台服务器

### 2. 节点命名规范

建议使用清晰的命名规则，例如：
- `HK-01-Vless` (香港节点1-Vless协议)
- `US-02-SS` (美国节点2-Shadowsocks协议)
- `JP-03-Trojan` (日本节点3-Trojan协议)

### 3. 证书管理

- 使用 `file` 模式时，确保证书文件路径正确
- 使用 `dns` 或 `http` 模式时，XrayR会自动申请证书
- 定期检查证书有效期

### 4. 性能优化

- 根据服务器性能调整 `SpeedLimit`
- 合理设置 `DeviceLimit` 防止滥用
- 调整 `UpdatePeriodic` 控制更新频率

## 🔒 安全建议

1. **修改默认密码**
   ```bash
   # 编辑 .env 文件
   ADMIN_PASSWORD=your-strong-password-here
   ```

2. **保护 JWT 密钥**
   ```bash
   # 使用强随机字符串
   JWT_SECRET=your-random-secret-key-here
   ```

3. **定期备份数据**
   ```bash
   # 备份 data 目录
   cp -r data data_backup_$(date +%Y%m%d)
   ```

4. **使用 HTTPS**
   - 生产环境建议使用 Nginx 反向代理
   - 配置 SSL 证书

5. **限制访问**
   - 使用防火墙限制访问IP
   - 不要将管理面板暴露在公网

## ❓ 常见问题

### Q1: 忘记管理员密码怎么办？

A: 编辑 `.env` 文件，修改 `ADMIN_PASSWORD`，然后重启服务。

### Q2: 配置生成后XrayR无法启动？

A: 检查以下几点：
- 节点ID是否正确
- 面板域名和API Key是否正确
- 证书文件路径是否存在
- YAML格式是否正确（注意缩进）

### Q3: 如何备份配置？

A: 备份 `data` 目录即可，包含所有面板和节点数据。

### Q4: 可以在多台服务器上使用吗？

A: 可以。每台服务器运行一个实例，或者使用网络共享存储。

### Q5: 支持哪些面板？

A: 目前支持 NewV2board 类型的面板，兼容大多数V2board面板。

## 📞 获取帮助

如遇到问题：
1. 查看控制台日志
2. 检查 `.env` 配置
3. 查看 `data` 目录权限
4. 提交 Issue 到项目仓库

## 🎉 开始使用

现在你已经了解了所有功能，开始使用 XrayR 配置生成器吧！

1. 添加你的第一个面板
2. 为面板添加节点
3. 生成配置并部署到服务器
4. 享受便捷的配置管理体验！

