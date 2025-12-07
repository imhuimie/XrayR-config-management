import express from 'express';
import { Client } from 'ssh2';
import { SocksClient } from 'socks';
import { authenticateToken } from '../middleware/auth.js';
import { readServers, readSettings } from '../utils/dataStore.js';
import { isValidFilePath, isValidCommand, isValidId, sanitizeFilePath } from '../utils/validator.js';

const router = express.Router();

// 创建 SSH 连接（支持代理）
const createSSHConnection = async (host, port, serverKey, settings) => {
  const conn = new Client();

  const sshConfig = {
    host: host,
    port: port,
    username: 'root',
    readyTimeout: 30000
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
      timeout: 30000
    };

    // 如果代理需要认证
    if (settings.proxyUsername && settings.proxyPassword) {
      socksOptions.proxy.userId = settings.proxyUsername;
      socksOptions.proxy.password = settings.proxyPassword;
    }

    const info = await SocksClient.createConnection(socksOptions);
    
    // 为 socket 添加错误处理器
    info.socket.on('error', (err) => {
      console.error('代理 socket 错误:', err.message);
    });

    sshConfig.sock = info.socket;
  }

  return { conn, sshConfig };
};

// 批量上传文件
router.post('/upload-file', authenticateToken, async (req, res) => {
  const { serverId, filePath, fileContent } = req.body;

  // 输入验证
  if (!serverId || !filePath || !fileContent) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  // 验证 serverId 格式
  if (!isValidId(serverId)) {
    return res.status(400).json({ error: '无效的服务器 ID' });
  }

  // 验证文件路径安全性
  if (!isValidFilePath(filePath)) {
    return res.status(400).json({ error: '无效的文件路径' });
  }

  // 文件内容大小限制 (1MB)
  if (typeof fileContent !== 'string' || fileContent.length > 1024 * 1024) {
    return res.status(400).json({ error: '文件内容过大或格式错误' });
  }

  try {
    const servers = await readServers();
    const server = servers.find(s => s.id === serverId);

    if (!server) {
      return res.status(404).json({ error: '服务器不存在' });
    }

    // 解析服务器地址
    const parseServerAddress = (address) => {
      const parts = address.split(':');
      return {
        host: parts[0] || '',
        port: parseInt(parts[1]) || 22
      };
    };

    const { host, port } = parseServerAddress(server.serverAddress);

    if (!host) {
      return res.status(400).json({ error: '服务器地址格式错误' });
    }

    // 读取系统设置
    const settings = readSettings();
    
    // 创建 SSH 连接
    const { conn, sshConfig } = await createSSHConnection(host, port, server.serverKey, settings);

    let uploadSuccess = false;
    let uploadError = null;

    const timeout = setTimeout(() => {
      if (!uploadSuccess) {
        conn.end();
        uploadError = '连接超时（30秒）';
      }
    }, 30000);

    conn.on('ready', () => {
      clearTimeout(timeout);

      // 获取文件的目录路径
      const fileDir = filePath.substring(0, filePath.lastIndexOf('/'));

      // 创建目录并上传文件（mkdir -p 会自动创建所有父目录）
      conn.exec(`mkdir -p "${fileDir}"`, (err, stream) => {
        if (err) {
          conn.end();
          uploadError = '创建目录失败: ' + err.message;
          if (!res.headersSent) {
            return res.status(500).json({ error: uploadError });
          }
          return;
        }

        let mkdirError = '';

        stream.on('close', (code) => {
          if (code !== 0 && mkdirError) {
            conn.end();
            uploadError = '创建目录失败: ' + mkdirError;
            if (!res.headersSent) {
              return res.status(500).json({ error: uploadError });
            }
            return;
          }

          // 上传文件内容（使用引号包裹路径以支持空格）
          conn.exec(`cat > "${filePath}" << 'BATCH_EOF'\n${fileContent}\nBATCH_EOF`, (err, stream) => {
            if (err) {
              conn.end();
              uploadError = '上传文件失败: ' + err.message;
              if (!res.headersSent) {
                return res.status(500).json({ error: uploadError });
              }
              return;
            }

            let uploadErr = '';

            stream.on('close', (code) => {
              uploadSuccess = true;
              conn.end();

              if (code !== 0 && uploadErr) {
                uploadError = '上传文件失败: ' + uploadErr;
                if (!res.headersSent) {
                  return res.status(500).json({ error: uploadError });
                }
                return;
              }

              if (!res.headersSent) {
                res.json({
                  success: true,
                  message: '文件上传成功'
                });
              }
            });

            stream.on('data', () => {});
            stream.stderr.on('data', (data) => {
              uploadErr += data.toString();
            });
          });
        });

        stream.on('data', () => {});
        stream.stderr.on('data', (data) => {
          mkdirError += data.toString();
        });
      });
    });

    conn.on('error', (err) => {
      clearTimeout(timeout);
      uploadSuccess = true;

      let errorMessage = '上传失败: ';
      if (err.level === 'client-authentication') {
        errorMessage += '认证失败';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage += '连接被拒绝';
      } else if (err.code === 'ECONNRESET') {
        errorMessage += '连接被重置，可能是代理问题';
      } else {
        errorMessage += err.message;
      }

      if (!res.headersSent) {
        res.status(500).json({ success: false, error: errorMessage });
      }
    });

    conn.on('close', () => {
      clearTimeout(timeout);
      if (!uploadSuccess && !res.headersSent && uploadError) {
        res.status(500).json({ success: false, error: uploadError });
      }
    });

    try {
      conn.connect(sshConfig);
    } catch (connectError) {
      clearTimeout(timeout);
      return res.status(500).json({
        success: false,
        error: `SSH 连接失败: ${connectError.message}`
      });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: '上传文件失败: ' + error.message
      });
    }
  }
});

// 批量执行命令
router.post('/execute-command', authenticateToken, async (req, res) => {
  const { serverId, command } = req.body;

  // 输入验证
  if (!serverId || !command) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  // 验证 serverId 格式
  if (!isValidId(serverId)) {
    return res.status(400).json({ error: '无效的服务器 ID' });
  }

  // 验证命令安全性
  if (!isValidCommand(command)) {
    return res.status(400).json({ error: '命令包含不安全的内容或过长' });
  }

  try {
    const servers = await readServers();
    const server = servers.find(s => s.id === serverId);

    if (!server) {
      return res.status(404).json({ error: '服务器不存在' });
    }

    // 解析服务器地址
    const parseServerAddress = (address) => {
      const parts = address.split(':');
      return {
        host: parts[0] || '',
        port: parseInt(parts[1]) || 22
      };
    };

    const { host, port } = parseServerAddress(server.serverAddress);

    if (!host) {
      return res.status(400).json({ error: '服务器地址格式错误' });
    }

    // 读取系统设置
    const settings = readSettings();

    // 创建 SSH 连接
    const { conn, sshConfig } = await createSSHConnection(host, port, server.serverKey, settings);

    let commandExecuted = false;
    let commandError = null;

    const timeout = setTimeout(() => {
      if (!commandExecuted) {
        conn.end();
        commandError = '执行超时（30秒）';
      }
    }, 30000);

    conn.on('ready', () => {
      clearTimeout(timeout);

      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          return res.status(500).json({ error: '命令执行失败: ' + err.message });
        }

        let output = '';
        let errorOutput = '';

        stream.on('data', (data) => {
          output += data.toString();
        });

        stream.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        stream.on('close', (code) => {
          commandExecuted = true;
          conn.end();

          const fullOutput = output + (errorOutput ? '\n[stderr]:\n' + errorOutput : '');

          res.json({
            success: true,
            output: fullOutput || '(命令执行完成，无输出)',
            exitCode: code
          });
        });
      });
    });

    conn.on('error', (err) => {
      clearTimeout(timeout);
      commandExecuted = true;

      let errorMessage = '执行失败: ';
      if (err.level === 'client-authentication') {
        errorMessage += '认证失败';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage += '连接被拒绝';
      } else if (err.code === 'ECONNRESET') {
        errorMessage += '连接被重置，可能是代理问题';
      } else {
        errorMessage += err.message;
      }

      if (!res.headersSent) {
        res.status(500).json({ success: false, error: errorMessage });
      }
    });

    conn.on('close', () => {
      clearTimeout(timeout);
      if (!commandExecuted && !res.headersSent && commandError) {
        res.status(500).json({ success: false, error: commandError });
      }
    });

    try {
      conn.connect(sshConfig);
    } catch (connectError) {
      clearTimeout(timeout);
      return res.status(500).json({
        success: false,
        error: `SSH 连接失败: ${connectError.message}`
      });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: '执行命令失败: ' + error.message
      });
    }
  }
});

export default router;

