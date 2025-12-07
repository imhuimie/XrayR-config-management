import React, { useState } from 'react'
import '../styles/ConfirmDialog.css'

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, requireInput = false }) => {
  const [inputValue, setInputValue] = useState('')
  const [showError, setShowError] = useState(false)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (requireInput) {
      if (inputValue === confirmText) {
        onConfirm()
        setInputValue('')
        setShowError(false)
        onClose()
      } else {
        setShowError(true)
      }
    } else {
      onConfirm()
      onClose()
    }
  }

  const handleCancel = () => {
    setInputValue('')
    setShowError(false)
    onClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className="confirm-dialog-overlay" onClick={handleCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={handleCancel}>×</button>
        </div>
        
        <div className="confirm-dialog-body">
          <div className="confirm-message">
            {message.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
          
          {requireInput && (
            <div className="confirm-input-group">
              <label>请输入 "<strong>{confirmText}</strong>" 以确认删除：</label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setShowError(false)
                }}
                onKeyPress={handleKeyPress}
                placeholder={confirmText}
                autoFocus
                className={`confirm-input ${showError ? 'error' : ''}`}
              />
              {showError && (
                <div className="error-message">
                  ❌ 输入不匹配，请输入正确的确认文本: {confirmText}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="confirm-dialog-footer">
          <button className="btn-cancel" onClick={handleCancel}>
            取消
          </button>
          <button 
            className="btn-confirm-delete" 
            onClick={handleConfirm}
            disabled={requireInput && inputValue !== confirmText}
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

