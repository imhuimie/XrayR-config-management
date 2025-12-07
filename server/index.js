import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import panelRoutes from './routes/panels.js';
import serverGroupRoutes from './routes/serverGroups.js';
import serverRoutes from './routes/servers.js';
import nodeRoutes from './routes/nodes.js';
import configRoutes from './routes/config.js';
import sshRoutes from './routes/ssh.js';
import settingsRoutes from './routes/settings.js';
import batchRoutes from './routes/batch.js';
import { initDataStore } from './utils/dataStore.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 61145;

// 全局错误处理 - 防止未捕获的异常导致进程崩溃
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error.message);
  // 不退出进程，继续运行
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的 Promise 拒绝:', reason instanceof Error ? reason.message : reason);
  // 不退出进程，继续运行
});

// 初始化数据存储
initDataStore();

// 安全中间件 - Helmet 设置安全响应头
app.use(helmet({
  contentSecurityPolicy: false, // 前端可能需要内联脚本
  crossOriginEmbedderPolicy: false
}));

// CORS 配置 - 生产环境应限制来源
const corsOptions = {
  origin: process.env.CORS_ORIGIN || true, // 设置 CORS_ORIGIN 环境变量来限制来源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// 请求体大小限制 - 防止 DoS 攻击
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 全局速率限制 - 防止 DDoS
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 1000, // 每个 IP 最多 1000 次请求
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/panels', panelRoutes);
app.use('/api/server-groups', serverGroupRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/config', configRoutes);
app.use('/api/ssh', sshRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/batch', batchRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'XrayR配置生成器运行中' });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 API文档: http://localhost:${PORT}/api/health`);
});

