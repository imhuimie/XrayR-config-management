import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('password');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 密码修改表单
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 代理设置表单
  const [proxyForm, setProxyForm] = useState({
    useProxy: false,
    proxyType: 'http',
    proxyHost: '127.0.0.1',
    proxyPort: 7890,
    proxyUsername: '',
    proxyPassword: ''
  });

  // 密码可见性
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
    proxy: false
  });

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      setMessage({ type: '', text: '' });
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      setProxyForm(response.data.settings);
    } catch (error) {
      setMessage({ type: 'error', text: '加载设置失败' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的新密码不一致' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: '新密码长度至少为6位' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/settings/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      setMessage({ type: 'success', text: '密码修改成功！请重新登录' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      
      // 3秒后退出登录
      setTimeout(() => {
        localStorage.removeItem('token');
        window.location.reload();
      }, 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || '修改密码失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleProxySubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await api.put('/settings', proxyForm);
      setMessage({ type: 'success', text: '代理设置已保存' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || '保存设置失败' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>⚙️ 系统设置</h2>

        {/* 标签页 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveTab('password')}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'password' ? '2px solid #4299e1' : '2px solid transparent',
              color: activeTab === 'password' ? '#4299e1' : '#718096',
              fontWeight: activeTab === 'password' ? 'bold' : 'normal',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            🔐 修改密码
          </button>
          <button
            onClick={() => setActiveTab('proxy')}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'proxy' ? '2px solid #4299e1' : '2px solid transparent',
              color: activeTab === 'proxy' ? '#4299e1' : '#718096',
              fontWeight: activeTab === 'proxy' ? 'bold' : 'normal',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            🌐 SSH 代理设置
          </button>
        </div>

        {/* 消息提示 */}
        {message.text && (
          <div style={{
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '6px',
            background: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
            color: message.type === 'success' ? '#22543d' : '#742a2a',
            fontSize: '14px'
          }}>
            {message.text}
          </div>
        )}

        {/* 修改密码标签页 */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: '16px' }}>
              <label className="label">原密码</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswords.old ? 'text' : 'password'}
                  className="input"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  {showPasswords.old ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="label">新密码</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  className="input"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  {showPasswords.new ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="label">确认新密码</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  className="input"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  {showPasswords.confirm ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? '修改中...' : '修改密码'}
            </button>
          </form>
        )}

        {/* SSH 代理设置标签页 */}
        {activeTab === 'proxy' && (
          <form onSubmit={handleProxySubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={proxyForm.useProxy}
                  onChange={(e) => setProxyForm({ ...proxyForm, useProxy: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#2d3748' }}>
                  启用 SSH 连接代理
                </span>
              </label>
              <p style={{ fontSize: '12px', color: '#718096', marginTop: '4px', marginLeft: '28px' }}>
                开启后，SSH 连接将通过本地代理进行
              </p>
            </div>

            {proxyForm.useProxy && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label className="label">代理类型</label>
                  <select
                    className="select"
                    value={proxyForm.proxyType}
                    onChange={(e) => setProxyForm({ ...proxyForm, proxyType: e.target.value })}
                  >
                    <option value="http">HTTP</option>
                    <option value="socks5">SOCKS5</option>
                    <option value="socks4">SOCKS4</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <label className="label">代理地址</label>
                    <input
                      type="text"
                      className="input"
                      value={proxyForm.proxyHost}
                      onChange={(e) => setProxyForm({ ...proxyForm, proxyHost: e.target.value })}
                      placeholder="127.0.0.1"
                      required={proxyForm.useProxy}
                    />
                  </div>
                  <div>
                    <label className="label">端口</label>
                    <input
                      type="number"
                      className="input"
                      value={proxyForm.proxyPort}
                      onChange={(e) => setProxyForm({ ...proxyForm, proxyPort: parseInt(e.target.value) || 0 })}
                      placeholder="7890"
                      required={proxyForm.useProxy}
                      min="1"
                      max="65535"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="label">代理用户名（可选）</label>
                  <input
                    type="text"
                    className="input"
                    value={proxyForm.proxyUsername}
                    onChange={(e) => setProxyForm({ ...proxyForm, proxyUsername: e.target.value })}
                    placeholder="留空表示无需认证"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="label">代理密码（可选）</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords.proxy ? 'text' : 'password'}
                      className="input"
                      value={proxyForm.proxyPassword}
                      onChange={(e) => setProxyForm({ ...proxyForm, proxyPassword: e.target.value })}
                      placeholder="留空表示无需认证"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, proxy: !showPasswords.proxy })}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px'
                      }}
                    >
                      {showPasswords.proxy ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  background: '#edf2f7',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#4a5568',
                  marginBottom: '16px'
                }}>
                  <p>💡 常见代理软件端口：</p>
                  <p style={{ marginTop: '4px' }}>• Clash: 7890 (HTTP/SOCKS5)</p>
                  <p style={{ marginTop: '4px' }}>• V2rayN: 10808 (SOCKS5) / 10809 (HTTP)</p>
                  <p style={{ marginTop: '4px' }}>• Shadowsocks: 1080 (SOCKS5)</p>
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? '保存中...' : '保存设置'}
            </button>
          </form>
        )}

        <button
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: '16px' }}
          onClick={onClose}
        >
          关闭
        </button>
      </div>
    </div>
  );
}

export default SettingsModal;

