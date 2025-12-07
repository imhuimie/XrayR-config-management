import { useState } from 'react'

function ImportNodesModal({ isOpen, onClose, onImport, serverId, panelId }) {
  const [yamlConfig, setYamlConfig] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!yamlConfig.trim()) {
      alert('请输入配置内容')
      return
    }

    setLoading(true)
    try {
      await onImport(yamlConfig, serverId, panelId)
      setYamlConfig('')
      onClose()
    } catch (error) {
      alert('导入失败: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        style={{ maxWidth: '800px' }}
      >
        <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>
          📥 导入节点配置
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: '#4a5568',
              fontWeight: '500'
            }}>
              粘贴 YAML 配置内容
            </label>
            <textarea
              value={yamlConfig}
              onChange={(e) => setYamlConfig(e.target.value)}
              placeholder="请粘贴完整的 XrayR 配置文件内容..."
              style={{
                width: '100%',
                minHeight: '400px',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ 
            marginBottom: '16px',
            padding: '12px',
            background: '#edf2f7',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#4a5568'
          }}>
            <p style={{ marginBottom: '8px', fontWeight: '500' }}>💡 导入说明：</p>
            <p style={{ marginTop: '4px' }}>1. 粘贴包含 Nodes 数组的完整 YAML 配置</p>
            <p style={{ marginTop: '4px' }}>2. 系统会自动解析配置中的所有节点</p>
            <p style={{ marginTop: '4px' }}>3. 节点名称为空时，将使用节点ID作为名称</p>
            <p style={{ marginTop: '4px' }}>4. 导入的节点将关联到当前选择的服务器</p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !yamlConfig.trim()}
              style={{ flex: 1 }}
            >
              {loading ? '导入中...' : '开始导入'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
              style={{ flex: 1 }}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ImportNodesModal

