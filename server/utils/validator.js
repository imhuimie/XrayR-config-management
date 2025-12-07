/**
 * 输入验证工具模块
 * 用于验证和清理用户输入，防止注入攻击
 */

/**
 * 验证字符串是否为有效的文件路径（防止路径遍历攻击）
 * @param {string} filePath - 文件路径
 * @returns {boolean}
 */
export const isValidFilePath = (filePath) => {
  if (!filePath || typeof filePath !== 'string') {
    return false;
  }

  // 检查路径遍历攻击
  const normalizedPath = filePath.replace(/\\/g, '/');
  if (normalizedPath.includes('..') || normalizedPath.includes('//')) {
    return false;
  }

  // 必须是绝对路径
  if (!normalizedPath.startsWith('/')) {
    return false;
  }

  // 检查危险字符
  const dangerousChars = /[;&|`$(){}[\]<>!]/;
  if (dangerousChars.test(filePath)) {
    return false;
  }

  return true;
};

/**
 * 清理文件路径，移除危险字符
 * @param {string} filePath - 文件路径
 * @returns {string}
 */
export const sanitizeFilePath = (filePath) => {
  if (!filePath || typeof filePath !== 'string') {
    return '';
  }

  // 移除危险字符
  return filePath
    .replace(/\.\./g, '')
    .replace(/[;&|`$(){}[\]<>!]/g, '')
    .replace(/\/+/g, '/')
    .trim();
};

/**
 * 验证服务器地址格式
 * @param {string} address - 服务器地址 (host:port 或 host)
 * @returns {boolean}
 */
export const isValidServerAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // 基本格式检查
  const parts = address.split(':');
  if (parts.length > 2) {
    return false;
  }

  const host = parts[0];
  const port = parts[1] ? parseInt(parts[1]) : 22;

  // 验证主机名/IP
  const hostPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-\.]*[a-zA-Z0-9])?$/;
  if (!hostPattern.test(host)) {
    return false;
  }

  // 验证端口
  if (isNaN(port) || port < 1 || port > 65535) {
    return false;
  }

  return true;
};

/**
 * 验证命令是否安全（基本检查）
 * @param {string} command - 要执行的命令
 * @returns {boolean}
 */
export const isValidCommand = (command) => {
  if (!command || typeof command !== 'string') {
    return false;
  }

  // 命令长度限制
  if (command.length > 1000) {
    return false;
  }

  // 检查危险的命令模式
  const dangerousPatterns = [
    /rm\s+-rf\s+\/(?!\w)/i,  // rm -rf / (根目录)
    /mkfs/i,                  // 格式化
    /dd\s+if=/i,              // dd 命令
    />\s*\/dev\//i,           // 写入设备
    /chmod\s+777\s+\//i,      // 危险权限
    /wget.*\|\s*sh/i,         // 下载并执行
    /curl.*\|\s*sh/i,         // 下载并执行
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      return false;
    }
  }

  return true;
};

/**
 * 验证字符串长度
 * @param {string} str - 字符串
 * @param {number} maxLength - 最大长度
 * @returns {boolean}
 */
export const isValidLength = (str, maxLength = 1000) => {
  return typeof str === 'string' && str.length <= maxLength;
};

/**
 * 验证 ID 格式（时间戳格式）
 * @param {string} id - ID
 * @returns {boolean}
 */
export const isValidId = (id) => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return /^\d{13,}$/.test(id);
};

/**
 * 清理 HTML 特殊字符，防止 XSS
 * @param {string} str - 字符串
 * @returns {string}
 */
export const escapeHtml = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * 验证 URL 格式
 * @param {string} url - URL
 * @returns {boolean}
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * 验证 API Key 格式
 * @param {string} apiKey - API Key
 * @returns {boolean}
 */
export const isValidApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  // API Key 应该是字母数字组合，长度在 8-128 之间
  return /^[a-zA-Z0-9\-_]{8,128}$/.test(apiKey);
};
