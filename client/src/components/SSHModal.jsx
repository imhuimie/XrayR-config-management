import React, { useState } from 'react';
import api from '../utils/api';

function SSHModal({ isOpen, onClose, server }) {
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  if (!isOpen || !server) return null;

  const parseServerAddress = (address) => {
    if (!address) return { host: '', port: '22' };
    const parts = address.split(':');
    return {
      host: parts[0] || '',
      port: parts[1] || '22'
    };
  };

  const { host, port } = parseServerAddress(server.serverAddress);
  const sshCommand = `ssh root@${host} -p ${port}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await api.post('/ssh/test', {
        serverAddress: server.serverAddress,
        serverKey: server.serverKey
      });

      setTestResult({
        success: true,
        message: response.data.message,
        details: response.data.details
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.error || '连接测试失败',
        details: error.response?.data?.details
      });
    } finally {
      setTesting(false);
    }
  };

  const uploadConfig = async () => {
    setUploading(true);
    setUploadResult(null);

    try {
      const response = await api.post(`/servers/${server.id}/upload-config`);

      setUploadResult({
        success: true,
        message: response.data.message,
        details: response.data.details
      });
    } catch (error) {
      setUploadResult({
        success: false,
        message: error.response?.data?.error || '上传配置文件失败',
        details: error.response?.data?.details
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
      <div className="modal" style={{ maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>
          🔗 SSH 连接信息
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', color: '#4a5568', marginBottom: '10px' }}>
            服务器：{server.name}
          </h3>
        </div>

        <div style={{ backgroundColor: '#f7fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '5px' }}>
              主机地址
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                value={host}
                readOnly
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}
              />
              <button className="btn btn-secondary" onClick={() => copyToClipboard(host)} style={{ padding: '8px 12px', fontSize: '13px' }}>
                📋 复制
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '5px' }}>
              端口
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                value={port}
                readOnly
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}
              />
              <button className="btn btn-secondary" onClick={() => copyToClipboard(port)} style={{ padding: '8px 12px', fontSize: '13px' }}>
                📋 复制
              </button>
            </div>
          </div>

          {server.serverKey && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '5px' }}>
                密码/密钥
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="password"
                  value={server.serverKey}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    fontFamily: 'monospace'
                  }}
                />
                <button className="btn btn-secondary" onClick={() => copyToClipboard(server.serverKey)} style={{ padding: '8px 12px', fontSize: '13px' }}>
                  📋 复制
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: '#edf2f7', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '8px' }}>
            SSH 连接命令
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <code style={{
              flex: 1,
              display: 'block',
              padding: '10px 12px',
              backgroundColor: '#2d3748',
              color: '#48bb78',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'monospace',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}>
              {sshCommand}
            </code>
            <button className="btn btn-primary" onClick={() => copyToClipboard(sshCommand)} style={{ padding: '8px 12px', fontSize: '13px' }}>
              {copied ? '✅ 已复制' : '📋 复制'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-primary"
            onClick={testConnection}
            disabled={testing || uploading}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {testing ? '🔄 测试中...' : '🧪 测试 SSH 连接'}
          </button>
          <button
            className="btn"
            onClick={uploadConfig}
            disabled={uploading || testing}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: '#805ad5',
              color: 'white',
              border: 'none'
            }}
          >
            {uploading ? '⏫ 上传中...' : '📤 上传配置文件'}
          </button>
        </div>

        {testResult && (
          <div style={{
            backgroundColor: testResult.success ? '#f0fff4' : '#fff5f5',
            border: `1px solid ${testResult.success ? '#9ae6b4' : '#feb2b2'}`,
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            animation: 'fadeIn 0.3s ease-in'
          }}>
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: testResult.success ? '#22543d' : '#c53030',
              lineHeight: '1.6',
              fontWeight: '600'
            }}>
              {testResult.success ? '✅ ' : '❌ '}{testResult.message}
            </p>
            {testResult.details && (
              <p style={{
                margin: '8px 0 0 0',
                fontSize: '12px',
                color: testResult.success ? '#2f855a' : '#9b2c2c',
                fontFamily: 'monospace'
              }}>
                {testResult.details.host && `主机: ${testResult.details.host}:${testResult.details.port}`}
                {testResult.details.output && ` | 输出: ${testResult.details.output}`}
                {testResult.details.code && ` | 错误代码: ${testResult.details.code}`}
              </p>
            )}
          </div>
        )}

        {uploadResult && (
          <div style={{
            backgroundColor: uploadResult.success ? '#f0fff4' : '#fff5f5',
            border: `1px solid ${uploadResult.success ? '#9ae6b4' : '#feb2b2'}`,
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            animation: 'fadeIn 0.3s ease-in'
          }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: uploadResult.success ? '#22543d' : '#c53030',
              lineHeight: '1.6',
              fontWeight: '600'
            }}>
              {uploadResult.success ? '✅ ' : '❌ '}{uploadResult.message}
            </p>
            {uploadResult.details && (
              <div style={{
                marginTop: '10px',
                fontSize: '12px',
                color: uploadResult.success ? '#2f855a' : '#9b2c2c',
                fontFamily: 'monospace',
                lineHeight: '1.8'
              }}>
                {uploadResult.details.host && (
                  <div>📍 服务器: {uploadResult.details.host}:{uploadResult.details.port}</div>
                )}
                {uploadResult.details.configPath && (
                  <div>📁 配置路径: {uploadResult.details.configPath}</div>
                )}
                {uploadResult.details.command && (
                  <div>⚙️ 执行命令: {uploadResult.details.command}</div>
                )}
                {uploadResult.details.commandOutput && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: uploadResult.success ? '#e6fffa' : '#fff5f5',
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}>
                    💬 命令输出: {uploadResult.details.commandOutput}
                  </div>
                )}
                {uploadResult.details.commandExitCode !== undefined && (
                  <div style={{ marginTop: '5px' }}>
                    🔢 退出代码: {uploadResult.details.commandExitCode}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default SSHModal;
