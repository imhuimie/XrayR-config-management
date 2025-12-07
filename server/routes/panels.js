import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { readPanels, writePanels } from '../utils/dataStore.js';
import { isValidUrl, isValidLength, isValidId } from '../utils/validator.js';

const router = express.Router();

// 获取所有面板
router.get('/', authenticateToken, (req, res) => {
  try {
    const panels = readPanels();
    res.json(panels);
  } catch (error) {
    res.status(500).json({ error: '读取面板数据失败' });
  }
});

// 创建面板
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, domain, apiKey } = req.body;

    // 基本字段验证
    if (!name || !domain || !apiKey) {
      return res.status(400).json({ error: '请提供完整的面板信息' });
    }

    // 验证名称长度
    if (!isValidLength(name, 100)) {
      return res.status(400).json({ error: '面板名称过长' });
    }

    // 验证域名格式
    if (!isValidUrl(domain)) {
      return res.status(400).json({ error: '无效的面板域名格式，需要完整 URL（如 https://example.com）' });
    }

    // 验证 API Key 长度
    if (!isValidLength(apiKey, 256)) {
      return res.status(400).json({ error: 'API Key 过长' });
    }

    const panels = readPanels();
    const newPanel = {
      id: Date.now().toString(),
      name,
      domain,
      apiKey,
      createdAt: new Date().toISOString()
    };

    panels.push(newPanel);
    writePanels(panels);

    res.json({ success: true, panel: newPanel });
  } catch (error) {
    console.error('创建面板失败:', error.message);
    res.status(500).json({ error: '创建面板失败' });
  }
});

// 更新面板
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { name, domain, apiKey } = req.body;

    const panels = readPanels();
    const index = panels.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: '面板不存在' });
    }

    panels[index] = {
      ...panels[index],
      name: name || panels[index].name,
      domain: domain || panels[index].domain,
      apiKey: apiKey || panels[index].apiKey,
      updatedAt: new Date().toISOString()
    };

    writePanels(panels);
    res.json({ success: true, panel: panels[index] });
  } catch (error) {
    res.status(500).json({ error: '更新面板失败' });
  }
});

// 删除面板
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const panels = readPanels();
    const filteredPanels = panels.filter(p => p.id !== id);

    if (panels.length === filteredPanels.length) {
      return res.status(404).json({ error: '面板不存在' });
    }

    writePanels(filteredPanels);
    res.json({ success: true, message: '面板已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除面板失败' });
  }
});

export default router;

