/**
 * 数据存储工具模块
 * 使用泛型函数消除重复代码，遵循 DRY 原则
 */
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据目录和文件路径配置
const DATA_DIR = process.env.DATA_PATH || path.join(__dirname, '../../data');

const DATA_FILES = {
  panels: path.join(DATA_DIR, 'panels.json'),
  serverGroups: path.join(DATA_DIR, 'serverGroups.json'),
  servers: path.join(DATA_DIR, 'servers.json'),
  nodes: path.join(DATA_DIR, 'nodes.json'),
  settings: path.join(DATA_DIR, 'settings.json')
};

// 默认设置配置
const getDefaultSettings = () => ({
  passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123456', 10),
  useProxy: false,
  proxyType: 'http',
  proxyHost: '127.0.0.1',
  proxyPort: 7890,
  proxyUsername: '',
  proxyPassword: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

/**
 * 初始化数据存储
 */
export const initDataStore = () => {
  // 创建数据目录
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 初始化数据文件
  const initFiles = [
    { path: DATA_FILES.panels, default: [] },
    { path: DATA_FILES.serverGroups, default: [] },
    { path: DATA_FILES.servers, default: [] },
    { path: DATA_FILES.nodes, default: [] },
    { path: DATA_FILES.settings, default: getDefaultSettings() }
  ];

  initFiles.forEach(({ path: filePath, default: defaultValue }) => {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
    }
  });
};

/**
 * 通用读取函数
 * @param {string} filePath - 文件路径
 * @returns {any} 解析后的 JSON 数据
 */
const readJson = (filePath) => {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

/**
 * 通用写入函数
 * @param {string} filePath - 文件路径
 * @param {any} data - 要写入的数据
 */
const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

/**
 * 创建数据访问器工厂函数
 * @param {string} key - 数据文件键名
 * @returns {{ read: Function, write: Function }}
 */
const createAccessor = (key) => ({
  read: () => readJson(DATA_FILES[key]),
  write: (data) => writeJson(DATA_FILES[key], data)
});

// 导出各实体的读写函数
const panelsAccessor = createAccessor('panels');
const serverGroupsAccessor = createAccessor('serverGroups');
const serversAccessor = createAccessor('servers');
const nodesAccessor = createAccessor('nodes');
const settingsAccessor = createAccessor('settings');

// 面板
export const readPanels = panelsAccessor.read;
export const writePanels = panelsAccessor.write;

// 服务器分组
export const readServerGroups = serverGroupsAccessor.read;
export const writeServerGroups = serverGroupsAccessor.write;

// 服务器
export const readServers = serversAccessor.read;
export const writeServers = serversAccessor.write;

// 节点
export const readNodes = nodesAccessor.read;
export const writeNodes = nodesAccessor.write;

// 设置
export const readSettings = settingsAccessor.read;
export const writeSettings = settingsAccessor.write;
