import { useState } from 'react'

function ConfigViewer({ isOpen, config, onClose }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(config)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        style={{ maxWidth: '800px' }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#2d3748' }}>
            📄 XrayR 配置文件
          </h2>
          <button 
            className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
            onClick={handleCopy}
          >
            {copied ? '✓ 已复制' : '📋 复制配置'}
          </button>
        </div>

        <div style={{ 
          background: '#2d3748',
          borderRadius: '8px',
          padding: '16px',
          maxHeight: '60vh',
          overflowY: 'auto'
        }}>
          <pre style={{ 
            margin: 0,
            color: '#e2e8f0',
            fontSize: '13px',
            lineHeight: '1.6'
          }}>
            {config}
          </pre>
        </div>

        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: '#edf2f7',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#4a5568'
        }}>
          <p>💡 使用说明：</p>
          <p style={{ marginTop: '4px' }}>1. 点击"复制配置"按钮复制配置内容</p>
          <p style={{ marginTop: '4px' }}>2. 将配置保存为 config.yml 文件</p>
          <p style={{ marginTop: '4px' }}>3. 放置到 XrayR 的配置目录中</p>
          <p style={{ marginTop: '4px' }}>4. 重启 XrayR 服务使配置生效</p>
        </div>

        <button 
          className="btn btn-secondary" 
          style={{ width: '100%', marginTop: '16px' }}
          onClick={onClose}
        >
          关闭
        </button>
      </div>
    </div>
  )
}

export default ConfigViewer

