import express from 'express';
import yaml from 'js-yaml';
import { authenticateToken } from '../middleware/auth.js';
import { readNodes, readServers, readServerGroups, readPanels } from '../utils/dataStore.js';

const router = express.Router();

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

// 获取指定节点的配置
router.get('/node/:nodeId', authenticateToken, (req, res) => {
  try {
    const { nodeId } = req.params;
    const nodes = readNodes();
    const servers = readServers();
    const groups = readServerGroups();
    const panels = readPanels();

    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      return res.status(404).json({ error: '节点不存在' });
    }

    const config = generateXrayRConfig([node], servers, groups, panels);
    const yamlConfig = yaml.dump(config, {
      indent: 2,
      lineWidth: -1
    });

    res.json({
      success: true,
      config: yamlConfig,
      configObject: config
    });
  } catch (error) {
    res.status(500).json({ error: '生成配置失败' });
  }
});

// 获取指定服务器下所有节点的配置
router.get('/server/:serverId', authenticateToken, (req, res) => {
  try {
    const { serverId } = req.params;
    const nodes = readNodes();
    const servers = readServers();
    const groups = readServerGroups();
    const panels = readPanels();

    const serverNodes = nodes.filter(n => n.serverId === serverId);
    if (serverNodes.length === 0) {
      return res.status(404).json({ error: '该服务器下没有节点' });
    }

    const config = generateXrayRConfig(serverNodes, servers, groups, panels);
    const yamlConfig = yaml.dump(config, {
      indent: 2,
      lineWidth: -1
    });

    res.json({
      success: true,
      config: yamlConfig,
      configObject: config
    });
  } catch (error) {
    res.status(500).json({ error: '生成配置失败' });
  }
});

// 获取所有节点的配置
router.get('/all', authenticateToken, (req, res) => {
  try {
    const nodes = readNodes();
    const servers = readServers();
    const groups = readServerGroups();
    const panels = readPanels();

    if (nodes.length === 0) {
      return res.status(404).json({ error: '没有可用的节点' });
    }

    const config = generateXrayRConfig(nodes, servers, groups, panels);
    const yamlConfig = yaml.dump(config, {
      indent: 2,
      lineWidth: -1
    });

    res.json({
      success: true,
      config: yamlConfig,
      configObject: config
    });
  } catch (error) {
    res.status(500).json({ error: '生成配置失败' });
  }
});

export default router;

