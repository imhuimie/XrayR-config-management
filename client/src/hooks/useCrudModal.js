/**
 * CRUD 模态框 Hook
 * 统一管理编辑/新增模态框状态
 */
import { useState, useCallback } from 'react';

export function useCrudModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const openForCreate = useCallback(() => {
    setEditingItem(null);
    setIsOpen(true);
  }, []);

  const openForEdit = useCallback((item) => {
    setEditingItem(item);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingItem(null);
  }, []);

  return {
    isOpen,
    editingItem,
    isEditing: editingItem !== null,
    openForCreate,
    openForEdit,
    close
  };
}
