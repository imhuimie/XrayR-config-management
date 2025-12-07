import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { readSettings } from '../utils/dataStore.js';

const router = express.Router();

// 登录速率限制 - 防止暴力破解
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 5, // 每个 IP 最多 5 次登录尝试
  message: { error: '登录尝试次数过多，请 15 分钟后再试' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // 成功登录不计入限制
});

// 登录
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { password } = req.body;

    // 输入验证
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: '请提供密码' });
    }

    // 密码长度限制，防止 DoS
    if (password.length > 128) {
      return res.status(400).json({ error: '密码格式错误' });
    }

    const settings = readSettings();
    const isValid = await bcrypt.compare(password, settings.passwordHash);

    if (!isValid) {
      // 延迟响应，防止时序攻击
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      return res.status(401).json({ error: '密码错误' });
    }

    const token = jwt.sign(
      { user: 'admin', timestamp: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      message: '登录成功'
    });
  } catch (error) {
    console.error('登录错误:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 验证token
router.post('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true });
  } catch (error) {
    res.status(403).json({ valid: false });
  }
});

export default router;

