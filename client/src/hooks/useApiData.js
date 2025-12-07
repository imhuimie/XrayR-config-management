/**
 * API 数据加载 Hook
 * 统一管理数据加载、选择状态
 */
import { useState, useCallback, useEffect } from 'react';
import api from '../utils/api';

/**
 * 通用数据加载 Hook
 * @param {string} endpoint - API 端点
 * @param {Object} options - 配置选项
 * @param {boolean} options.autoLoad - 是否自动加载
 * @param {any} options.initialData - 初始数据
 */
export function useApiData(endpoint, options = {}) {
  const { autoLoad = false, initialData = [] } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const url = params.id ? `${endpoint}/${params.id}` : endpoint;
      const response = await api.get(url);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      console.error(`加载数据失败 (${endpoint}):`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const create = useCallback(async (itemData) => {
    const response = await api.post(endpoint, itemData);
    return response.data;
  }, [endpoint]);

  const update = useCallback(async (id, itemData) => {
    const response = await api.put(`${endpoint}/${id}`, itemData);
    return response.data;
  }, [endpoint]);

  const remove = useCallback(async (id) => {
    const response = await api.delete(`${endpoint}/${id}`);
    return response.data;
  }, [endpoint]);

  useEffect(() => {
    if (autoLoad) {
      load();
    }
  }, [autoLoad, load]);

  return {
    data,
    setData,
    loading,
    error,
    load,
    create,
    update,
    remove
  };
}

/**
 * 带选择功能的数据 Hook
 */
export function useSelectableData(endpoint, options = {}) {
  const apiData = useApiData(endpoint, options);
  const [selectedItem, setSelectedItem] = useState(null);

  const select = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItem(null);
  }, []);

  return {
    ...apiData,
    selectedItem,
    select,
    clearSelection
  };
}
