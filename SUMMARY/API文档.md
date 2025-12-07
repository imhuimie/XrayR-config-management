# XrayR 配置生成器 - API 文档

## 📡 基础信息

- **Base URL**: `http://localhost:61145/api`
- **认证方式**: JWT Token (Bearer Token)
- **数据格式**: JSON
- **字符编码**: UTF-8

---

## 🔐 认证接口

### 登录
```http
POST /api/auth/login
```

**请求体**:
```json
{
  "password": "admin123"
}
```

**响应**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📁 面板管理

### 获取所有面板
```http
GET /api/panels
Authorization: Bearer {token}
```

**响应**:
```json
[
  {
    "id": "1763701492052",
    "name": "主面板",
    "domain": "https://panel.example.com",
    "apiKey": "your-api-key",
    "createdAt": "2025-11-21T05:04:52.052Z",
    "updatedAt": "2025-11-21T16:38:35.730Z"
  }
]
```

### 创建面板
```http
POST /api/panels
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "name": "主面板",
  "domain": "https://panel.example.com",
  "apiKey": "your-api-key"
}
```

### 更新面板
```http
PUT /api/panels/:id
Authorization: Bearer {token}
```

### 删除面板
```http
DELETE /api/panels/:id
Authorization: Bearer {token}
```

---

## 📂 服务器分组

### 获取所有分组
```http
GET /api/server-groups
Authorization: Bearer {token}
```

**响应**:
```json
[
  {
    "id": "1763712888349",
    "panelId": "1763701492052",
    "name": "香港节点",
    "description": "香港 CN2 GIA 节点",
    "createdAt": "2025-11-21T08:14:48.349Z"
  }
]
```

### 创建分组
```http
POST /api/server-groups
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "panelId": "1763701492052",
  "name": "香港节点",
  "description": "香港 CN2 GIA 节点"
}
```

### 更新分组
```http
PUT /api/server-groups/:id
Authorization: Bearer {token}
```

### 删除分组
```http
DELETE /api/server-groups/:id
Authorization: Bearer {token}
```

---

## 🖥️ 服务器管理

### 获取所有服务器
```http
GET /api/servers
Authorization: Bearer {token}
```

**响应**:
```json
[
  {
    "id": "1763712896100",
    "groupId": "1763712888349",
    "name": "HK-01",
    "serverAddress": "hk01.example.com:22",
    "serverKey": "your-ssh-password",
    "configFilePath": "/etc/XrayR/config.yml",
    "afterDeployCommand": "systemctl restart XrayR",
    "createdAt": "2025-11-21T08:14:56.100Z",
    "updatedAt": "2025-11-21T15:25:17.640Z"
  }
]
```

### 创建服务器
```http
POST /api/servers
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "groupId": "1763712888349",
  "name": "HK-01",
  "serverAddress": "hk01.example.com:22",
  "serverKey": "your-ssh-password",
  "configFilePath": "/etc/XrayR/config.yml",
  "afterDeployCommand": "systemctl restart XrayR"
}
```

### 更新服务器
```http
PUT /api/servers/:id
Authorization: Bearer {token}
```

### 删除服务器
```http
DELETE /api/servers/:id
Authorization: Bearer {token}
```

### 上传配置到服务器
```http
POST /api/servers/:id/upload-config
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "configContent": "Log:\n  Level: warning\n..."
}
```

---

## 🌐 节点管理

### 获取所有节点
```http
GET /api/nodes
Authorization: Bearer {token}
```

### 创建节点
```http
POST /api/nodes
Authorization: Bearer {token}
```

**请求体 (Shadowsocks)**:
```json
{
  "serverId": "1763712896100",
  "nodeId": 1,
  "nodeType": "Shadowsocks",
  "cipher": "aes-128-gcm",
  "serverPort": 443
}
```

**请求体 (V2ray)**:
```json
{
  "serverId": "1763712896100",
  "nodeId": 2,
  "nodeType": "V2ray",
  "transportProtocol": "ws",
  "enableVless": false,
  "vlessFlow": "",
  "enableTLS": true,
  "certMode": "dns",
  "certDomain": "example.com",
  "provider": "cloudflare",
  "email": "admin@example.com",
  "dnsEnv": "CLOUDFLARE_API_KEY=xxx"
}
```

### 更新节点
```http
PUT /api/nodes/:id
Authorization: Bearer {token}
```

### 删除节点
```http
DELETE /api/nodes/:id
Authorization: Bearer {token}
```

### 导入节点
```http
POST /api/nodes/import
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "serverId": "1763712896100",
  "yamlContent": "Log:\n  Level: warning\n..."
}
```

---

## ⚙️ 配置生成

### 生成配置
```http
POST /api/config/generate
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "nodeId": "1763713000000"
}
```

**响应**:
```json
{
  "config": "Log:\n  Level: warning\n\nNodes:\n  - PanelType: \"V2board\"\n..."
}
```

---

## 🔗 SSH 功能

### 测试 SSH 连接
```http
POST /api/ssh/test-connection
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "serverId": "1763712896100"
}
```

**响应**:
```json
{
  "success": true,
  "message": "SSH 连接成功"
}
```

---

## 📦 批量管理

### 批量上传文件
```http
POST /api/batch/upload-file
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "serverId": "1763712896100",
  "filePath": "/etc/XrayR/config.yml",
  "fileContent": "Log:\n  Level: warning\n..."
}
```

### 批量执行命令
```http
POST /api/batch/execute-command
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "serverId": "1763712896100",
  "command": "systemctl restart XrayR"
}
```

**响应**:
```json
{
  "success": true,
  "output": "● XrayR.service - XrayR Service\n   Loaded: loaded\n..."
}
```

---

## ⚙️ 系统设置

### 获取设置
```http
GET /api/settings
Authorization: Bearer {token}
```

**响应**:
```json
{
  "useProxy": false,
  "proxyType": "http",
  "proxyHost": "127.0.0.1",
  "proxyPort": 7890,
  "proxyUsername": "",
  "proxyPassword": ""
}
```

### 更新设置
```http
PUT /api/settings
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "useProxy": true,
  "proxyType": "socks5",
  "proxyHost": "127.0.0.1",
  "proxyPort": 7890
}
```

### 修改密码
```http
POST /api/settings/change-password
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "oldPassword": "admin123",
  "newPassword": "newpassword123"
}
```

---

## 🔍 健康检查

### 检查服务状态
```http
GET /api/health
```

**响应**:
```json
{
  "status": "ok",
  "message": "XrayR配置生成器运行中"
}
```

---

## ❌ 错误响应

所有错误响应格式统一为:

```json
{
  "error": "错误描述信息"
}
```

### 常见错误码

- `400` - 请求参数错误
- `401` - 未授权（Token 无效或过期）
- `404` - 资源不存在
- `500` - 服务器内部错误

---

## 📝 注意事项

1. **认证**: 除了 `/api/auth/login` 和 `/api/health`，所有接口都需要 JWT Token
2. **Token 格式**: `Authorization: Bearer {token}`
3. **Token 有效期**: 24 小时
4. **ID 格式**: 使用时间戳字符串，例如 `"1763701492052"`
5. **日期格式**: ISO 8601 格式，例如 `"2025-11-21T05:04:52.052Z"`

---

**最后更新**: 2025-11-21

