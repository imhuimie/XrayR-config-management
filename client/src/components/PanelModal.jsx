import { useState, useEffect } from 'react'
import api from '../utils/api'

function PanelModal({ isOpen, panel, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    apiKey: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (panel) {
      setFormData({
        name: panel.name,
        domain: panel.domain,
        apiKey: panel.apiKey
      })
    } else {
      setFormData({
        name: '',
        domain: '',
        apiKey: ''
      })
    }
  }, [panel, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      alert('操作失败: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>
          {panel ? '编辑面板' : '添加面板'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label className="label">面板名称</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如: 主面板"
              required
            />
          </div>

          <div>
            <label className="label">面板域名</label>
            <input
              type="text"
              className="input"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="例如: https://panel.example.com"
              required
            />
          </div>

          <div>
            <label className="label">通讯密钥 (API Key)</label>
            <input
              type="text"
              className="input"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="面板的API密钥"
              required
            />
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

export default PanelModal

