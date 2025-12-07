import React, { useState, useEffect } from 'react';

function ServerModal({ isOpen, onClose, onSave, server, groupId }) {
  const [formData, setFormData] = useState({
    name: '',
    serverAddress: '',
    serverKey: '',
    configFilePath: '/etc/XrayR/config.yml',
    afterDeployCommand: 'systemctl restart XrayR'
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (server) {
      setFormData({
        name: server.name || '',
        serverAddress: server.serverAddress || '',
        serverKey: server.serverKey || '',
        configFilePath: server.configFilePath || '/etc/XrayR/config.yml',
        afterDeployCommand: server.afterDeployCommand || 'systemctl restart XrayR'
      });
    } else {
      setFormData({
        name: '',
        serverAddress: '',
        serverKey: '',
        configFilePath: '/etc/XrayR/config.yml',
        afterDeployCommand: 'systemctl restart XrayR'
      });
    }
  }, [server, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, groupId });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>
          {server ? '编辑服务器' : '添加服务器'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label className="label">服务器名称 *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如：香港服务器A"
              required
            />
            <small style={{ color: '#718096', fontSize: '12px' }}>
              服务器的名称标识
            </small>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label className="label">服务器地址 *</label>
            <input
              type="text"
              className="input"
              value={formData.serverAddress}
              onChange={(e) => setFormData({ ...formData, serverAddress: e.target.value })}
              placeholder="例如：192.168.1.1:22 或 server.com:22"
              required
            />
            <small style={{ color: '#718096', fontSize: '12px' }}>
              服务器的SSH地址和端口，用于远程部署配置文件
            </small>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label className="label">服务器密钥</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="input"
                value={formData.serverKey}
                onChange={(e) => setFormData({ ...formData, serverKey: e.target.value })}
                placeholder="SSH密钥或密码"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#718096',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={showPassword ? "隐藏密码" : "显示密码"}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <small style={{ color: '#718096', fontSize: '12px' }}>
              用于SSH连接的密钥或密码
            </small>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label className="label">配置文件路径</label>
            <input
              type="text"
              className="input"
              value={formData.configFilePath}
              onChange={(e) => setFormData({ ...formData, configFilePath: e.target.value })}
              placeholder="/etc/XrayR/config.yml"
            />
            <small style={{ color: '#718096', fontSize: '12px' }}>
              服务器上XrayR配置文件的完整路径
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="label">部署后执行命令</label>
            <input
              type="text"
              className="input"
              value={formData.afterDeployCommand}
              onChange={(e) => setFormData({ ...formData, afterDeployCommand: e.target.value })}
              placeholder="systemctl restart XrayR"
            />
            <small style={{ color: '#718096', fontSize: '12px' }}>
              配置文件替换后自动执行的命令（如重启服务）
            </small>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ServerModal;

