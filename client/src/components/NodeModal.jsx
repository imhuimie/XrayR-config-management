import { useState, useEffect } from 'react'
import api from '../utils/api'

function NodeModal({ isOpen, onClose, onSave, node, serverId }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    nodeId: '',
    nodeType: 'Vless',
    panelType: 'NewV2board',
    timeout: 30,
    speedLimit: 0,
    deviceLimit: 0,
    listenIP: '0.0.0.0',
    sendIP: '0.0.0.0',
    updatePeriodic: 60,
    enableDNS: false,
    dnsType: 'AsIs',
    enableProxyProtocol: false,
    vlessFlow: 'xtls-rprx-vision',
    certMode: 'file',
    certDomain: '',
    certFile: '',
    keyFile: ''
  })

  useEffect(() => {
    if (node) {
      setFormData({ ...node })
    } else {
      setFormData({
        name: '',
        nodeId: '',
        nodeType: 'Vless',
        panelType: 'NewV2board',
        timeout: 30,
        speedLimit: 0,
        deviceLimit: 0,
        listenIP: '0.0.0.0',
        sendIP: '0.0.0.0',
        updatePeriodic: 60,
        enableDNS: false,
        dnsType: 'AsIs',
        enableProxyProtocol: false,
        vlessFlow: 'xtls-rprx-vision',
        certMode: 'file',
        certDomain: '',
        certFile: '',
        keyFile: ''
      })
    }
  }, [node, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({ ...formData, serverId })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>
          {node ? '编辑节点' : '添加节点'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">节点名称</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如: 香港节点1"
                required
              />
            </div>

            <div>
              <label className="label">节点ID</label>
              <input
                type="number"
                className="input"
                value={formData.nodeId}
                onChange={(e) => setFormData({ ...formData, nodeId: e.target.value })}
                placeholder="面板中的节点ID"
                required
              />
            </div>

            <div>
              <label className="label">节点类型</label>
              <select
                className="select"
                value={formData.nodeType}
                onChange={(e) => setFormData({ ...formData, nodeType: e.target.value })}
              >
                <option value="Vless">Vless</option>
                <option value="Vmess">Vmess</option>
                <option value="Shadowsocks">Shadowsocks</option>
                <option value="Trojan">Trojan</option>
              </select>
            </div>

            <div>
              <label className="label">面板类型</label>
              <select
                className="select"
                value={formData.panelType}
                onChange={(e) => setFormData({ ...formData, panelType: e.target.value })}
              >
                <option value="NewV2board">NewV2board</option>
                <option value="SSpanel">SSpanel</option>
                <option value="V2board">V2board</option>
                <option value="PMpanel">PMpanel</option>
                <option value="Proxypanel">Proxypanel</option>
              </select>
            </div>

            <div>
              <label className="label">超时时间 (秒)</label>
              <input
                type="number"
                className="input"
                value={formData.timeout}
                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="label">速度限制 (Mbps, 0=不限)</label>
              <input
                type="number"
                className="input"
                value={formData.speedLimit}
                onChange={(e) => setFormData({ ...formData, speedLimit: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="label">设备限制 (0=不限)</label>
              <input
                type="number"
                className="input"
                value={formData.deviceLimit}
                onChange={(e) => setFormData({ ...formData, deviceLimit: parseInt(e.target.value) })}
              />
            </div>
          </div>

          {formData.nodeType === 'Vless' && (
            <div>
              <label className="label">Vless Flow</label>
              <select
                className="select"
                value={formData.vlessFlow}
                onChange={(e) => setFormData({ ...formData, vlessFlow: e.target.value })}
              >
                <option value="xtls-rprx-vision">xtls-rprx-vision</option>
                <option value="xtls-rprx-direct">xtls-rprx-direct</option>
                <option value="">无</option>
              </select>
            </div>
          )}

          <div style={{ 
            marginTop: '16px', 
            padding: '16px', 
            background: '#f7fafc', 
            borderRadius: '8px' 
          }}>
            <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#2d3748' }}>
              证书配置
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="label">证书模式</label>
                <select
                  className="select"
                  value={formData.certMode}
                  onChange={(e) => setFormData({ ...formData, certMode: e.target.value })}
                >
                  <option value="file">file</option>
                  <option value="dns">dns</option>
                  <option value="http">http</option>
                  <option value="none">none</option>
                </select>
              </div>

              <div>
                <label className="label">证书域名</label>
                <input
                  type="text"
                  className="input"
                  value={formData.certDomain}
                  onChange={(e) => setFormData({ ...formData, certDomain: e.target.value })}
                  placeholder="example.com"
                />
              </div>
            </div>

            {formData.certMode === 'file' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">证书文件路径</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.certFile}
                    onChange={(e) => setFormData({ ...formData, certFile: e.target.value })}
                    placeholder="/path/to/fullchain.pem"
                  />
                </div>

                <div>
                  <label className="label">密钥文件路径</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.keyFile}
                    onChange={(e) => setFormData({ ...formData, keyFile: e.target.value })}
                    placeholder="/path/to/privkey.pem"
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ flex: 1 }}
              onClick={onClose}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NodeModal

