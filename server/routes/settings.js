import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticateToken } from '../middleware/auth.js';
import { readSettings, writeSettings } from '../utils/dataStore.js';
import { isValidLength } from '../utils/validator.js';

const router = express.Router();

// 获取系统设置
router.get('/', authenticateToken, (req, res) => {
  try {
    const settings = readSettings();
    // 不返回密码哈希
    const { passwordHash, ...safeSettings } = settings;
    res.json({ success: true, settings: safeSettings });
  } catch (error) {
    res.status(500).json({ error: '获取设置失败' });
  }
});

// 更新系统设置
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { useProxy, proxyType, proxyHost, proxyPort, proxyUsername, proxyPassword } = req.body;
    const settings = readSettings();

    // 更新代理设置
    if (useProxy !== undefined) settings.useProxy = useProxy;
    if (proxyType !== undefined) settings.proxyType = proxyType;
    if (proxyHost !== undefined) settings.proxyHost = proxyHost;
    if (proxyPort !== undefined) settings.proxyPort = proxyPort;
    if (proxyUsername !== undefined) settings.proxyUsername = proxyUsername;
    if (proxyPassword !== undefined) settings.proxyPassword = proxyPassword;

    settings.updatedAt = new Date().toISOString();

    writeSettings(settings);
    
    // 不返回密码哈希
    const { passwordHash, ...safeSettings } = settings;
    res.json({ success: true, settings: safeSettings, message: '设置已更新' });
  } catch (error) {
    res.status(500).json({ error: '更新设置失败' });
  }
});

// 修改密码
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 输入验证
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '请提供原密码和新密码' });
    }

    // 类型检查
    if (typeof oldPassword !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ error: '密码格式错误' });
    }

    // 密码长度验证
    if (newPassword.length < 8) {
      return res.status(400).json({ error: '新密码长度至少为 8 位' });
    }

    if (newPassword.length > 128) {
      return res.status(400).json({ error: '新密码长度不能超过 128 位' });
    }

    // 密码强度检查
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({ error: '新密码必须包含字母和数字' });
    }

    const settings = readSettings();

    // 验证原密码
    const isValid = await bcrypt.compare(oldPassword, settings.passwordHash);
    if (!isValid) {
      // 延迟响应，防止时序攻击
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      return res.status(401).json({ error: '原密码错误' });
    }

    // 更新密码（使用更高的 bcrypt 成本因子）
    settings.passwordHash = await bcrypt.hash(newPassword, 12);
    settings.updatedAt = new Date().toISOString();

    writeSettings(settings);

    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error.message);
    res.status(500).json({ error: '修改密码失败' });
  }
});

export default router;

