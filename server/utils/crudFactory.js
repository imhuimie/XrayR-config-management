/**
 * CRUD 路由工厂函数
 * 消除重复的 CRUD 路由代码，遵循 DRY 原则
 */
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

/**
 * 创建标准 CRUD 路由
 * @param {Object} options - 配置选项
 * @param {Function} options.readAll - 读取所有数据的函数
 * @param {Function} options.writeAll - 写入所有数据的函数
 * @param {string} options.entityName - 实体名称（用于错误消息）
 * @param {string[]} options.requiredFields - 创建时必需的字段
 * @param {string} [options.parentIdField] - 父级 ID 字段名（如 panelId, groupId）
 * @param {string} [options.parentRoute] - 父级路由路径（如 '/panel/:panelId'）
 * @param {Function} [options.beforeCreate] - 创建前的钩子函数
 * @param {Function} [options.beforeUpdate] - 更新前的钩子函数
 * @returns {express.Router}
 */
export function createCrudRouter(options) {
  const {
    readAll,
    writeAll,
    entityName,
    requiredFields = [],
    parentIdField,
    parentRoute,
    beforeCreate,
    beforeUpdate
  } = options;

  const router = express.Router();

  // GET / - 获取所有
  router.get('/', authenticateToken, (req, res) => {
    try {
      const items = readAll();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: `获取${entityName}列表失败` });
    }
  });

  // GET /parent/:parentId - 根据父级 ID 获取
  if (parentIdField && parentRoute) {
    router.get(parentRoute, authenticateToken, (req, res) => {
      try {
        const parentId = req.params[Object.keys(req.params)[0]];
        const items = readAll();
        const filtered = items.filter(item => item[parentIdField] === parentId);
        res.json(filtered);
      } catch (error) {
        res.status(500).json({ error: `获取${entityName}列表失败` });
      }
    });
  }

  // POST / - 创建
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const data = req.body;

      // 验证必需字段
      const missingFields = requiredFields.filter(field => !data[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `缺少必要字段: ${missingFields.join(', ')}`
        });
      }

      // 执行创建前钩子
      if (beforeCreate) {
        const hookResult = await beforeCreate(data, req);
        if (hookResult?.error) {
          return res.status(hookResult.status || 400).json({ error: hookResult.error });
        }
      }

      const items = readAll();
      const newItem = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString()
      };

      items.push(newItem);
      writeAll(items);

      res.status(201).json({ success: true, [entityName]: newItem });
    } catch (error) {
      res.status(500).json({ error: `创建${entityName}失败` });
    }
  });

  // PUT /:id - 更新
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const items = readAll();
      const index = items.findIndex(item => item.id === id);

      if (index === -1) {
        return res.status(404).json({ error: `${entityName}不存在` });
      }

      // 执行更新前钩子
      if (beforeUpdate) {
        const hookResult = await beforeUpdate(data, items[index], req);
        if (hookResult?.error) {
          return res.status(hookResult.status || 400).json({ error: hookResult.error });
        }
      }

      items[index] = {
        ...items[index],
        ...data,
        id: items[index].id,
        createdAt: items[index].createdAt,
        updatedAt: new Date().toISOString()
      };

      writeAll(items);
      res.json({ success: true, [entityName]: items[index] });
    } catch (error) {
      res.status(500).json({ error: `更新${entityName}失败` });
    }
  });

  // DELETE /:id - 删除
  router.delete('/:id', authenticateToken, (req, res) => {
    try {
      const { id } = req.params;
      const items = readAll();
      const filtered = items.filter(item => item.id !== id);

      if (items.length === filtered.length) {
        return res.status(404).json({ error: `${entityName}不存在` });
      }

      writeAll(filtered);
      res.json({ success: true, message: `${entityName}已删除` });
    } catch (error) {
      res.status(500).json({ error: `删除${entityName}失败` });
    }
  });

  return router;
}

/**
 * 扩展路由器，添加自定义路由
 * @param {express.Router} router - 基础路由器
 * @param {Function} extender - 扩展函数
 * @returns {express.Router}
 */
export function extendRouter(router, extender) {
  extender(router);
  return router;
}
