import React, { useState, useEffect } from 'react';

function ServerGroupModal({ isOpen, onClose, onSave, group, panelId }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
  }, [group, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, panelId });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{group ? '编辑服务器分组' : '添加服务器分组'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label className="label">分组名称 *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如：香港机房"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="label">分组描述</label>
            <textarea
              className="input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="可选：分组的描述信息"
              rows="3"
            />
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

export default ServerGroupModal;

