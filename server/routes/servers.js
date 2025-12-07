import express from 'express';
import { Client } from 'ssh2';
import { SocksClient } from 'socks';
import yaml from 'js-yaml';
import { authenticateToken } from '../middleware/auth.js';
import { readServers, writeServers, readNodes, readServerGroups, readPanels, readSettings } from '../utils/dataStore.js';
import { isValidFilePath, isValidServerAddress, isValidCommand, isValidId, isValidLength } from '../utils/validator.js';

const router = express.Router();

// 获取所有服务器
router.get('/', authenticateToken, async (req, res) => {
  try {
    const servers = await readServers();
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: '获取服务器列表失败' });
  }
});

// 获取指定分组的服务器
router.get('/group/:groupId', authenticateToken, async (req, res) => {
  try {
    const servers = await readServers();
    const groupServers = servers.filter(s => s.groupId === req.params.groupId);
    res.json(groupServers);
  } catch (error) {
    res.status(500).json({ error: '获取服务器列表失败' });
  }
});

// 创建服务器
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { groupId, name, serverAddress, serverKey, configFilePath, afterDeployCommand } = req.body;

    // 基本字段验证
    if (!groupId || !name || !serverAddress) {
      return res.status(400).json({ error: '缺少必要字段' });
    }

    // 验证 groupId 格式
    if (!isValidId(groupId)) {
      return res.status(400).json({ error: '无效的分组 ID' });
    }

    // 验证名称长度
    if (!isValidLength(name, 100)) {
      return res.status(400).json({ error: '服务器名称过长' });
    }

    // 验证服务器地址格式
    if (!isValidServerAddress(serverAddress)) {
      return res.status(400).json({ error: '无效的服务器地址格式' });
    }

    // 验证配置文件路径
    const finalConfigPath = configFilePath || '/etc/XrayR/config.yml';
    if (configFilePath && !isValidFilePath(configFilePath)) {
      return res.status(400).json({ error: '无效的配置文件路径' });
    }

    // 验证部署命令
    const finalCommand = afterDeployCommand || 'systemctl restart XrayR';
    if (afterDeployCommand && !isValidCommand(afterDeployCommand)) {
      return res.status(400).json({ error: '部署命令包含不安全的内容' });
    }

    const servers = await readServers();
    const newServer = {
      id: Date.now().toString(),
      groupId,
      name,
      serverAddress,
      serverKey: serverKey || '',
      configFilePath: finalConfigPath,
      afterDeployCommand: finalCommand,
      createdAt: new Date().toISOString()
    };

    servers.push(newServer);
    await writeServers(servers);
    res.status(201).json(newServer);
  } catch (error) {
    console.error('创建服务器失败:', error.message);
    res.status(500).json({ error: '创建服务器失败' });
  }
});

// 更新服务器（节点分组）
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, serverAddress, serverKey, configFilePath, afterDeployCommand } = req.body;
    const servers = await readServers();
    const index = servers.findIndex(s => s.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '服务器不存在' });
    }

    servers[index] = {
      ...servers[index],
      name: name !== undefined ? name : servers[index].name,
      serverAddress: serverAddress !== undefined ? serverAddress : servers[index].serverAddress,
      serverKey: serverKey !== undefined ? serverKey : servers[index].serverKey,
      configFilePath: configFilePath !== undefined ? configFilePath : servers[index].configFilePath,
      afterDeployCommand: afterDeployCommand !== undefined ? afterDeployCommand : servers[index].afterDeployCommand,
      updatedAt: new Date().toISOString()
    };

    await writeServers(servers);
    res.json(servers[index]);
  } catch (error) {
    res.status(500).json({ error: '更新服务器失败' });
  }
});

// 删除服务器
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const servers = await readServers();
    const filteredServers = servers.filter(s => s.id !== req.params.id);

    if (servers.length === filteredServers.length) {
      return res.status(404).json({ error: '服务器不存在' });
    }

    await writeServers(filteredServers);
    res.json({ message: '服务器删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除服务器失败' });
  }
});

// 生成XrayR配置
const generateXrayRConfig = (nodes, servers, groups, panels) => {
  const config = {
    Log: {
      Level: 'warning'
    },
    ConnectionConfig: {
      Handshake: 4,
      ConnIdle: 30,
      UplinkOnly: 2,
      DownlinkOnly: 4,
      BufferSize: 64
    },
    Nodes: []
  };

  nodes.forEach(node => {
    const server = servers.find(s => s.id === node.serverId);
    if (!server) return;

    const group = groups.find(g => g.id === server.groupId);
    if (!group) return;

    const panel = panels.find(p => p.id === group.panelId);
    if (!panel) return;

    const nodeConfig = {
      PanelType: node.panelType || 'NewV2board',
      ApiConfig: {
        ApiHost: panel.domain,
        ApiKey: panel.apiKey,
        NodeID: parseInt(node.nodeId),
        NodeType: node.nodeType,
        Timeout: node.timeout || 30,
        SpeedLimit: node.speedLimit || 0,
        DeviceLimit: node.deviceLimit || 0
      },
      ControllerConfig: {
        ListenIP: node.listenIP || '0.0.0.0',
        SendIP: node.sendIP || '0.0.0.0',
        UpdatePeriodic: node.updatePeriodic || 60,
        EnableDNS: node.enableDNS || false,
        DNSType: node.dnsType || 'AsIs',
        EnableProxyProtocol: node.enableProxyProtocol || false
      }
    };

    // 只有 Vless 类型才添加 VlessFlow
    if (node.nodeType === 'Vless') {
      nodeConfig.ApiConfig.VlessFlow = node.vlessFlow || 'xtls-rprx-vision';
    }

    // 添加证书配置（只有在有实际配置时才添加）
    if (node.certMode && node.certDomain && node.certFile && node.keyFile) {
      nodeConfig.ControllerConfig.CertConfig = {
        CertMode: node.certMode,
        CertDomain: node.certDomain,
        CertFile: node.certFile,
        KeyFile: node.keyFile
      };

      // 如果是 DNS 模式，添加 Provider 和 DNSEnv
      if (node.certMode === 'dns' && node.certProvider) {
        nodeConfig.ControllerConfig.CertConfig.Provider = node.certProvider;
        nodeConfig.ControllerConfig.CertConfig.Email = node.certEmail || '';
        if (node.certDNSEnv) {
          try {
            nodeConfig.ControllerConfig.CertConfig.DNSEnv = JSON.parse(node.certDNSEnv);
          } catch (e) {
            // 如果解析失败，使用默认值
            nodeConfig.ControllerConfig.CertConfig.DNSEnv = {};
          }
        }
      }
    }

    config.Nodes.push(nodeConfig);
  });

  return config;
};

// 上传配置文件到服务器
router.post('/:id/upload-config', authenticateToken, async (req, res) => {
  try {
    const serverId = req.params.id;
    const servers = await readServers();
    const server = servers.find(s => s.id === serverId);

    if (!server) {
      return res.status(404).json({ error: '服务器不存在' });
    }

    // 获取服务器的所有节点
    const nodes = await readNodes();
    const serverNodes = nodes.filter(n => n.serverId === serverId);

    if (serverNodes.length === 0) {
      return res.status(400).json({ error: '该服务器下没有节点，无法生成配置文件' });
    }

    // 生成配置文件
    const groups = await readServerGroups();
    const panels = await readPanels();
    const config = generateXrayRConfig(serverNodes, servers, groups, panels);
    const yamlConfig = yaml.dump(config, {
      indent: 2,
      lineWidth: -1
    });

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

    // SSH连接配置
    const conn = new Client();
    let uploadSuccess = false;
    let uploadError = null;
    let commandOutput = '';

    const timeout = setTimeout(() => {
      if (!uploadSuccess) {
        conn.end();
        uploadError = '连接超时（30秒）';
      }
    }, 30000);

    conn.on('ready', () => {
      clearTimeout(timeout);

      // 获取配置文件的目录路径
      const configDir = server.configFilePath.substring(0, server.configFilePath.lastIndexOf('/'));

      // 检测并创建目录
      conn.exec(`mkdir -p ${configDir}`, (err, stream) => {
        if (err) {
          conn.end();
          return res.status(500).json({
            success: false,
            error: '创建目录失败: ' + err.message
          });
        }

        let mkdirOutput = '';
        stream.on('data', (data) => {
          mkdirOutput += data.toString();
        });

        stream.stderr.on('data', (data) => {
          mkdirOutput += data.toString();
        });

        stream.on('close', (code) => {
          if (code !== 0) {
            conn.end();
            return res.status(500).json({
              success: false,
              error: '创建目录失败，退出代码: ' + code,
              details: mkdirOutput
            });
          }

          // 上传配置文件
          conn.exec(`cat > ${server.configFilePath}`, (err, stream) => {
            if (err) {
              conn.end();
              return res.status(500).json({
                success: false,
                error: '上传配置文件失败: ' + err.message
              });
            }

            // 写入配置内容
            stream.write(yamlConfig);
            stream.end();

            let uploadOutput = '';
            stream.on('data', (data) => {
              uploadOutput += data.toString();
            });

            stream.stderr.on('data', (data) => {
              uploadOutput += data.toString();
            });

            stream.on('close', (code) => {
              if (code !== 0) {
                conn.end();
                return res.status(500).json({
                  success: false,
                  error: '上传配置文件失败，退出代码: ' + code,
                  details: uploadOutput
                });
              }

              // 执行部署后命令
              if (server.afterDeployCommand) {
                conn.exec(server.afterDeployCommand, (err, stream) => {
                  if (err) {
                    conn.end();
                    return res.status(500).json({
                      success: false,
                      error: '执行部署命令失败: ' + err.message
                    });
                  }

                  stream.on('data', (data) => {
                    commandOutput += data.toString();
                  });

                  stream.stderr.on('data', (data) => {
                    commandOutput += data.toString();
                  });

                  stream.on('close', (code) => {
                    uploadSuccess = true;
                    conn.end();
                    res.json({
                      success: true,
                      message: '配置文件上传成功并执行了部署命令',
                      details: {
                        host: host,
                        port: port,
                        configPath: server.configFilePath,
                        command: server.afterDeployCommand,
                        commandOutput: commandOutput.trim(),
                        commandExitCode: code
                      }
                    });
                  });
                });
              } else {
                uploadSuccess = true;
                conn.end();
                res.json({
                  success: true,
                  message: '配置文件上传成功',
                  details: {
                    host: host,
                    port: port,
                    configPath: server.configFilePath
                  }
                });
              }
            });
          });
        });
      });
    });

    conn.on('error', (err) => {
      clearTimeout(timeout);
      uploadSuccess = true; // 防止其他处理器再次触发

      let errorMessage = '上传失败: ';

      if (err.level === 'client-authentication') {
        errorMessage += '认证失败，请检查服务器密钥';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage += '连接被拒绝，请检查服务器地址和端口';
      } else if (err.code === 'ETIMEDOUT') {
        errorMessage += '连接超时，请检查服务器地址';
      } else if (err.code === 'ENOTFOUND') {
        errorMessage += '主机未找到，请检查服务器地址';
      } else if (err.code === 'ECONNRESET') {
        errorMessage += '连接被重置，可能是代理连接失败';
      } else {
        errorMessage += err.message;
      }

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
      if (!uploadSuccess && !res.headersSent && uploadError) {
        res.status(500).json({
          success: false,
          error: uploadError
        });
      }
    });

    // SSH连接配置
    const sshConfig = {
      host: host,
      port: port,
      username: 'root',
      readyTimeout: 30000
    };

    if (server.serverKey) {
      if (server.serverKey.includes('BEGIN') && server.serverKey.includes('PRIVATE KEY')) {
        sshConfig.privateKey = server.serverKey;
      } else {
        sshConfig.password = server.serverKey;
      }
    }

    // 读取系统设置，检查是否启用代理
    const settings = readSettings();
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
          timeout: 30000 // 30秒超时
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
        clearTimeout(timeout);
        return res.status(500).json({
          success: false,
          error: `代理连接失败: ${error.message}`
        });
      }
    }

    // 连接 SSH
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
    res.status(500).json({
      success: false,
      error: '上传配置文件失败: ' + error.message
    });
  }
});

export default router;

