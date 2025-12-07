import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { readServerGroups, writeServerGroups } from '../utils/dataStore.js';

const router = express.Router();

// 获取所有服务器分组
router.get('/', authenticateToken, (req, res) => {
  try {
    const groups = readServerGroups();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: '获取分组列表失败' });
  }
});

// 获取指定面板的服务器分组
router.get('/panel/:panelId', authenticateToken, (req, res) => {
  try {
    const groups = readServerGroups();
    const panelGroups = groups.filter(g => g.panelId === req.params.panelId);
    res.json(panelGroups);
  } catch (error) {
    res.status(500).json({ error: '获取分组列表失败' });
  }
});

// 创建服务器分组
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { panelId, name, description } = req.body;
    
    if (!panelId || !name) {
      return res.status(400).json({ error: '缺少必要字段' });
    }

    const groups = await readServerGroups();
    const newGroup = {
      id: Date.now().toString(),
      panelId,
      name,
      description: description || '',
      createdAt: new Date().toISOString()
    };

    groups.push(newGroup);
    await writeServerGroups(groups);
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ error: '创建分组失败' });
  }
});

// 更新服务器分组
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const groups = await readServerGroups();
    const index = groups.findIndex(g => g.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '分组不存在' });
    }

    groups[index] = {
      ...groups[index],
      name: name !== undefined ? name : groups[index].name,
      description: description !== undefined ? description : groups[index].description,
      updatedAt: new Date().toISOString()
    };

    await writeServerGroups(groups);
    res.json(groups[index]);
  } catch (error) {
    res.status(500).json({ error: '更新分组失败' });
  }
});

// 删除服务器分组
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const groups = await readServerGroups();
    const filteredGroups = groups.filter(g => g.id !== req.params.id);

    if (groups.length === filteredGroups.length) {
      return res.status(404).json({ error: '分组不存在' });
    }

    await writeServerGroups(filteredGroups);
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除分组失败' });
  }
});

export default router;

