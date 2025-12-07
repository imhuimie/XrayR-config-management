import express from 'express';
import yaml from 'js-yaml';
import { authenticateToken } from '../middleware/auth.js';
import { readNodes, writeNodes } from '../utils/dataStore.js';

const router = express.Router();

// 获取所有节点
router.get('/', authenticateToken, (req, res) => {
  try {
    const nodes = readNodes();
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: '读取节点数据失败' });
  }
});

// 根据服务器ID获取节点
router.get('/server/:serverId', authenticateToken, (req, res) => {
  try {
    const { serverId } = req.params;
    const nodes = readNodes();
    const serverNodes = nodes.filter(n => n.serverId === serverId);
    res.json(serverNodes);
  } catch (error) {
    res.status(500).json({ error: '读取节点数据失败' });
  }
});

// 创建节点
router.post('/', authenticateToken, (req, res) => {
  try {
    const nodeData = req.body;

    if (!nodeData.serverId || !nodeData.name || !nodeData.nodeId || !nodeData.nodeType) {
      return res.status(400).json({ error: '请提供完整的节点信息' });
    }

    const nodes = readNodes();
    const newNode = {
      id: Date.now().toString(),
      ...nodeData,
      createdAt: new Date().toISOString()
    };

    nodes.push(newNode);
    writeNodes(nodes);

    res.json({ success: true, node: newNode });
  } catch (error) {
    res.status(500).json({ error: '创建节点失败' });
  }
});

// 更新节点
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const nodeData = req.body;

    const nodes = readNodes();
    const index = nodes.findIndex(n => n.id === id);

    if (index === -1) {
      return res.status(404).json({ error: '节点不存在' });
    }

    nodes[index] = {
      ...nodes[index],
      ...nodeData,
      id: nodes[index].id,
      createdAt: nodes[index].createdAt,
      updatedAt: new Date().toISOString()
    };

    writeNodes(nodes);
    res.json({ success: true, node: nodes[index] });
  } catch (error) {
    res.status(500).json({ error: '更新节点失败' });
  }
});

// 删除节点
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const nodes = readNodes();
    const filteredNodes = nodes.filter(n => n.id !== id);

    if (nodes.length === filteredNodes.length) {
      return res.status(404).json({ error: '节点不存在' });
    }

    writeNodes(filteredNodes);
    res.json({ success: true, message: '节点已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除节点失败' });
  }
});

// 批量导入节点
router.post('/import', authenticateToken, (req, res) => {
  try {
    const { yamlConfig, serverId, panelId } = req.body;

    if (!yamlConfig || !serverId) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 解析 YAML 配置
    let config;
    try {
      config = yaml.load(yamlConfig);
    } catch (yamlError) {
      return res.status(400).json({ error: 'YAML 格式错误: ' + yamlError.message });
    }

    // 检查是否有 Nodes 数组
    if (!config.Nodes || !Array.isArray(config.Nodes)) {
      return res.status(400).json({ error: '配置中未找到 Nodes 数组' });
    }

    const nodes = readNodes();
    const importedNodes = [];

    // 遍历配置中的节点
    config.Nodes.forEach((nodeConfig, index) => {
      const apiConfig = nodeConfig.ApiConfig || {};
      const controllerConfig = nodeConfig.ControllerConfig || {};
      // CertConfig 可能在 ControllerConfig 里面，也可能在节点根级别
      const certConfig = controllerConfig.CertConfig || nodeConfig.CertConfig || {};

      // 创建节点对象
      const newNode = {
        id: Date.now().toString() + '_' + index,
        serverId: serverId,
        panelId: panelId || '',
        name: `节点${apiConfig.NodeID || index + 1}`, // 使用节点ID作为默认名称
        nodeId: apiConfig.NodeID?.toString() || '',
        nodeType: apiConfig.NodeType || 'Vless',
        timeout: parseInt(apiConfig.Timeout) || 30,
        speedLimit: parseInt(apiConfig.SpeedLimit) || 0,
        deviceLimit: parseInt(apiConfig.DeviceLimit) || 0,
        listenIP: String(controllerConfig.ListenIP || '0.0.0.0'),
        sendIP: String(controllerConfig.SendIP || '0.0.0.0'),
        updatePeriodic: parseInt(controllerConfig.UpdatePeriodic) || 60,
        enableDNS: Boolean(controllerConfig.EnableDNS),
        dnsType: String(controllerConfig.DNSType || 'AsIs'),
        enableProxyProtocol: Boolean(controllerConfig.EnableProxyProtocol),
        vlessFlow: String(apiConfig.VlessFlow || 'xtls-rprx-vision'),
        certMode: certConfig.CertMode ? String(certConfig.CertMode) : 'file',
        certDomain: certConfig.CertDomain ? String(certConfig.CertDomain) : '',
        certFile: certConfig.CertFile ? String(certConfig.CertFile) : '',
        keyFile: certConfig.KeyFile ? String(certConfig.KeyFile) : '',
        createdAt: new Date().toISOString()
      };

      nodes.push(newNode);
      importedNodes.push(newNode);
    });

    writeNodes(nodes);

    res.json({
      success: true,
      message: `成功导入 ${importedNodes.length} 个节点`,
      nodes: importedNodes
    });
  } catch (error) {
    console.error('导入节点失败:', error);
    res.status(500).json({ error: '导入节点失败: ' + error.message });
  }
});

export default router;

