/**
 * Toast 通知 Hook
 * 统一管理 Toast 状态
 */
import { useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState({
    isOpen: false,
    message: '',
    type: 'success'
  });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast
  };
}
