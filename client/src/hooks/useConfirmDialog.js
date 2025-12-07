/**
 * 确认对话框 Hook
 * 统一管理确认对话框状态
 */
import { useState, useCallback } from 'react';

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    confirmText: '',
    requireInput: false,
    onConfirm: () => {}
  });

  const showConfirm = useCallback((options) => {
    setConfig({
      title: options.title || '确认',
      message: options.message || '',
      confirmText: options.confirmText || '',
      requireInput: options.requireInput || false,
      onConfirm: options.onConfirm || (() => {})
    });
    setIsOpen(true);
  }, []);

  const hideConfirm = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * 快捷方法：显示删除确认
   */
  const confirmDelete = useCallback((entityName, onConfirm, requireInput = false) => {
    showConfirm({
      title: `⚠️ 删除${entityName}`,
      message: requireInput
        ? `确认要删除${entityName}吗？\n这个操作不可逆，确认删除请输入"确认删除${entityName}"`
        : `确认要删除${entityName}吗？`,
      confirmText: requireInput ? `确认删除${entityName}` : '',
      requireInput,
      onConfirm
    });
  }, [showConfirm]);

  return {
    isOpen,
    config,
    showConfirm,
    hideConfirm,
    confirmDelete
  };
}
