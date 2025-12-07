import express from 'express';
import { Client } from 'ssh2';
import { SocksClient } from 'socks';
import { authenticateToken } from '../middleware/auth.js';
import { readSettings } from '../utils/dataStore.js';
import { isValidServerAddress } from '../utils/validator.js';

const router = express.Router();

// 创建 SSH 连接（支持代理）
const createSSHConnection = async (host, port, serverKey, settings) => {
  const conn = new Client();

  const sshConfig = {
    host: host,
    port: port,
    username: 'root',
    readyTimeout: 10000
  };

  // 添加认证方式
  if (serverKey) {
    // 判断是密钥还是密码
    if (serverKey.includes('BEGIN') && serverKey.includes('PRIVATE KEY')) {
      sshConfig.privateKey = serverKey;
    } else {
      sshConfig.password = serverKey;
    }
  }

  // 如果启用了代理
  if (settings && settings.useProxy) {
    try {
      const socksOptions = {
        proxy: {
          host: settings.proxyHost,
          port: settings.proxyPort,
          type: settings.proxyType === 'socks4' ? 4 : 5
        },
        command: 'connect',
        destination: {
          host: host,
          port: port
        },
        timeout: 10000 // 10秒超时
      };

      // 如果代理需要认证
      if (settings.proxyUsername && settings.proxyPassword) {
        socksOptions.proxy.userId = settings.proxyUsername;
        socksOptions.proxy.password = settings.proxyPassword;
      }

      const info = await SocksClient.createConnection(socksOptions);

      // 为 socket 添加错误处理器，防止未捕获的异常
      info.socket.on('error', (err) => {
        console.error('代理 socket 错误:', err.message);
      });

      sshConfig.sock = info.socket;
    } catch (error) {
      throw new Error(`代理连接失败: ${error.message}`);
    }
  }

  return { conn, sshConfig };
};

// 测试 SSH 连接
router.post('/test', authenticateToken, async (req, res) => {
  const { serverAddress, serverKey } = req.body;

  // 输入验证
  if (!serverAddress) {
    return res.status(400).json({ error: '缺少服务器地址' });
  }

  // 验证服务器地址格式
  if (!isValidServerAddress(serverAddress)) {
    return res.status(400).json({ error: '无效的服务器地址格式' });
  }

  // 解析服务器地址和端口
  const parseServerAddress = (address) => {
    const parts = address.split(':');
    return {
      host: parts[0] || '',
      port: parseInt(parts[1]) || 22
    };
  };

  const { host, port } = parseServerAddress(serverAddress);

  if (!host) {
    return res.status(400).json({ error: '服务器地址格式错误' });
  }

  try {
    // 读取系统设置
    const settings = readSettings();

    // 创建 SSH 连接
    const { conn, sshConfig } = await createSSHConnection(host, port, serverKey, settings);

    let connected = false;
    let connectionError = null;

    // 设置超时
    const timeout = setTimeout(() => {
      if (!connected) {
        conn.end();
        connectionError = '连接超时（10秒）';
      }
    }, 10000);

    conn.on('ready', () => {
    connected = true;
    clearTimeout(timeout);
    
    // 执行一个简单的命令来验证连接
    conn.exec('echo "SSH连接成功"', (err, stream) => {
      if (err) {
        conn.end();
        return res.status(500).json({ 
          success: false, 
          error: '命令执行失败: ' + err.message 
        });
      }

      let output = '';
      stream.on('data', (data) => {
        output += data.toString();
      });

      stream.on('close', () => {
        conn.end();
        res.json({
          success: true,
          message: 'SSH 连接测试成功！',
          details: {
            host: host,
            port: port,
            output: output.trim()
          }
        });
      });
    });
  });

  conn.on('error', (err) => {
    clearTimeout(timeout);
    connected = true; // 防止超时处理器再次触发

    let errorMessage = 'SSH 连接失败';

    if (err.level === 'client-authentication') {
      errorMessage = '认证失败：用户名或密码错误';
    } else if (err.code === 'ECONNREFUSED') {
      errorMessage = '连接被拒绝：请检查服务器地址和端口';
    } else if (err.code === 'ETIMEDOUT') {
      errorMessage = '连接超时：无法连接到服务器';
    } else if (err.code === 'ENOTFOUND') {
      errorMessage = '主机未找到：请检查服务器地址';
    } else if (err.code === 'ECONNRESET') {
      errorMessage = '连接被重置：可能是代理连接失败';
    } else {
      errorMessage = `连接错误: ${err.message}`;
    }

    // 确保只发送一次响应
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: errorMessage,
        details: {
          code: err.code,
          level: err.level
        }
      });
    }
  });

    conn.on('close', () => {
      clearTimeout(timeout);
      if (!connected && connectionError && !res.headersSent) {
        res.status(500).json({
          success: false,
          error: connectionError
        });
      }
    });

    // 连接 SSH
    try {
      conn.connect(sshConfig);
    } catch (connectError) {
      clearTimeout(timeout);
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          error: `SSH 连接失败: ${connectError.message}`
        });
      }
    }
  } catch (error) {
    // 捕获代理连接等错误
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

export default router;

