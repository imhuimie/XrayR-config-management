/**
 * Dashboard 主控制台
 * 使用自定义 Hooks 简化状态管理
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useToast, useConfirmDialog, useCrudModal } from '../hooks';

// 组件导入
import PanelList from '../components/PanelList';
import PanelModal from '../components/PanelModal';
import ServerGroupList from '../components/ServerGroupList';
import ServerGroupModal from '../components/ServerGroupModal';
import ServerList from '../components/ServerList';
import ServerModal from '../components/ServerModal';
import NodeList from '../components/NodeList';
import NodeModal from '../components/NodeModal';
import ImportNodesModal from '../components/ImportNodesModal';
import ConfigViewer from '../components/ConfigViewer';
import SSHModal from '../components/SSHModal';
import SettingsModal from '../components/SettingsModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // 数据状态
  const [panels, setPanels] = useState([]);
  const [serverGroups, setServerGroups] = useState([]);
  const [servers, setServers] = useState([]);
  const [nodes, setNodes] = useState([]);

  // 选择状态
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);

  // 使用自定义 Hooks
  const { toast, showToast, hideToast } = useToast();
  const { isOpen: showConfirmDialog, config: confirmConfig, showConfirm, hideConfirm, confirmDelete } = useConfirmDialog();

  // 模态框状态
  const panelModal = useCrudModal();
  const groupModal = useCrudModal();
  const serverModal = useCrudModal();
  const nodeModal = useCrudModal();

  const [showImportModal, setShowImportModal] = useState(false);
  const [showConfigViewer, setShowConfigViewer] = useState(false);
  const [showSSHModal, setShowSSHModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [sshServer, setSSHServer] = useState(null);
  const [configData, setConfigData] = useState('');
  const [configType, setConfigType] = useState('');

  // ========== 数据加载 ==========
  const loadPanels = async () => {
    try {
      const response = await api.get('/panels');
      setPanels(response.data);
    } catch (error) {
      console.error('加载面板失败:', error);
    }
  };

  const loadServerGroups = async (panelId) => {
    try {
      const response = await api.get(`/server-groups/panel/${panelId}`);
      setServerGroups(response.data);
    } catch (error) {
      console.error('加载分组失败:', error);
    }
  };

  const loadServers = async (groupId) => {
    try {
      const response = await api.get(`/servers/group/${groupId}`);
      setServers(response.data);
    } catch (error) {
      console.error('加载服务器失败:', error);
    }
  };

  const loadNodes = async (serverId) => {
    try {
      const response = await api.get(`/nodes/server/${serverId}`);
      setNodes(response.data);
    } catch (error) {
      console.error('加载节点失败:', error);
    }
  };

  // ========== Effects ==========
  useEffect(() => {
    loadPanels();
  }, []);

  useEffect(() => {
    if (location.state?.selectedPanelId && panels.length > 0) {
      const panel = panels.find(p => p.id === location.state.selectedPanelId);
      if (panel) setSelectedPanel(panel);
    }
  }, [location.state, panels]);

  useEffect(() => {
    if (selectedPanel) {
      loadServerGroups(selectedPanel.id);
    } else {
      setServerGroups([]);
      setSelectedGroup(null);
    }
  }, [selectedPanel]);

  useEffect(() => {
    if (selectedGroup) {
      loadServers(selectedGroup.id);
    } else {
      setServers([]);
      setSelectedServer(null);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedServer) {
      loadNodes(selectedServer.id);
    } else {
      setNodes([]);
    }
  }, [selectedServer]);

  // ========== 面板操作 ==========
  const handleSavePanel = async (panelData) => {
    try {
      if (panelModal.editingItem) {
        await api.put(`/panels/${panelModal.editingItem.id}`, panelData);
      } else {
        await api.post('/panels', panelData);
      }
      panelModal.close();
      loadPanels();
    } catch (error) {
      showToast('保存面板失败: ' + (error.response?.data?.error || error.message), 'error');
    }
  };

  const handleDeletePanel = (panelId) => {
    confirmDelete('面板', async () => {
      try {
        await api.delete(`/panels/${panelId}`);
        if (selectedPanel?.id === panelId) setSelectedPanel(null);
        loadPanels();
        showToast('面板删除成功');
      } catch (error) {
        showToast('删除面板失败: ' + (error.response?.data?.error || error.message), 'error');
      }
    }, true);
  };

  // ========== 分组操作 ==========
  const handleAddGroup = () => {
    if (!selectedPanel) {
      showToast('请先选择一个面板', 'warning');
      return;
    }
    groupModal.openForCreate();
  };

  const handleSaveGroup = async (groupData) => {
    try {
      if (groupModal.editingItem) {
        await api.put(`/server-groups/${groupModal.editingItem.id}`, groupData);
      } else {
        await api.post('/server-groups', groupData);
      }
      groupModal.close();
      loadServerGroups(selectedPanel.id);
    } catch (error) {
      showToast('保存分组失败: ' + (error.response?.data?.error || error.message), 'error');
    }
  };

  const handleDeleteGroup = (groupId) => {
    confirmDelete('分组', async () => {
      try {
        await api.delete(`/server-groups/${groupId}`);
        if (selectedGroup?.id === groupId) setSelectedGroup(null);
        loadServerGroups(selectedPanel.id);
        showToast('分组删除成功');
      } catch (error) {
        showToast('删除分组失败: ' + (error.response?.data?.error || error.message), 'error');
      }
    }, true);
  };

  // ========== 服务器操作 ==========
  const handleAddServer = () => {
    if (!selectedGroup) {
      showToast('请先选择一个分组', 'warning');
      return;
    }
    serverModal.openForCreate();
  };

  const handleSaveServer = async (serverData) => {
    try {
      if (serverModal.editingItem) {
        await api.put(`/servers/${serverModal.editingItem.id}`, serverData);
      } else {
        await api.post('/servers', serverData);
      }
      serverModal.close();
      loadServers(selectedGroup.id);
    } catch (error) {
      showToast('保存服务器失败: ' + (error.response?.data?.error || error.message), 'error');
    }
  };

  const handleDeleteServer = (serverId) => {
    showConfirm({
      title: '⚠️ 删除服务器',
      message: '确认要删除服务器吗？\n这个操作将会删除服务器下的所有数据，包括节点等。',
      onConfirm: async () => {
        try {
          await api.delete(`/servers/${serverId}`);
          if (selectedServer?.id === serverId) setSelectedServer(null);
          loadServers(selectedGroup.id);
        } catch (error) {
          showToast('删除服务器失败: ' + (error.response?.data?.error || error.message), 'error');
        }
      }
    });
  };

  const handleViewServerConfig = async (server) => {
    try {
      const response = await api.get(`/config/server/${server.id}`);
      setConfigData(response.data.config);
      setConfigType(`服务器: ${server.name}`);
      setShowConfigViewer(true);
    } catch (error) {
      showToast('获取配置失败: ' + (error.response?.data?.error || error.message), 'error');
    }
  };

  const handleConnectSSH = (server) => {
    setSSHServer(server);
    setShowSSHModal(true);
  };

  // ========== 节点操作 ==========
  const handleAddNode = () => {
    if (!selectedServer) {
      showToast('请先选择一个服务器', 'warning');
      return;
    }
    nodeModal.openForCreate();
  };

  const handleSaveNode = async (nodeData) => {
    try {
      if (nodeModal.editingItem) {
        await api.put(`/nodes/${nodeModal.editingItem.id}`, nodeData);
      } else {
        await api.post('/nodes', nodeData);
      }
      nodeModal.close();
      loadNodes(selectedServer.id);
    } catch (error) {
      showToast('保存节点失败: ' + (error.response?.data?.error || error.message), 'error');
    }
  };

  const handleDeleteNode = (nodeId) => {
    showConfirm({
      title: '⚠️ 删除节点',
      message: '确认要删除节点吗？',
      onConfirm: async () => {
        try {
          await api.delete(`/nodes/${nodeId}`);
          loadNodes(selectedServer.id);
        } catch (error) {
          showToast('删除节点失败: ' + (error.response?.data?.error || error.message), 'error');
        }
      }
    });
  };

  const handleImportNodes = () => {
    if (!selectedServer) {
      showToast('请先选择一个服务器', 'warning');
      return;
    }
    setShowImportModal(true);
  };

  const handleSaveImportedNodes = async (yamlConfig, serverId, panelId) => {
    try {
      const response = await api.post('/nodes/import', {
        yamlConfig,
        serverId,
        panelId: selectedPanel?.id || panelId
      });
      showToast(response.data.message || '导入成功');
      loadNodes(selectedServer.id);
      setShowImportModal(false);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // ========== 渲染 ==========
  return (
    <div className="dashboard">
      {/* 头部 */}
      <div className="dashboard__header">
        <h1 className="dashboard__title">🚀 XrayR 配置生成器</h1>
        <div className="dashboard__actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!selectedPanel) {
                showToast('请先选择一个面板', 'warning');
                return;
              }
              navigate('/batch-management', { state: { selectedPanelId: selectedPanel.id } });
            }}
          >
            📦 批量管理
          </button>
          <button className="btn btn-primary" onClick={() => setShowSettingsModal(true)}>
            ⚙️ 系统设置
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </div>

      {/* 四列布局 */}
      <div className="dashboard__grid">
        {/* 第一列：面板列表 */}
        <PanelList
          panels={panels}
          selectedPanel={selectedPanel}
          onSelectPanel={setSelectedPanel}
          onAddPanel={panelModal.openForCreate}
          onEditPanel={panelModal.openForEdit}
          onDeletePanel={handleDeletePanel}
        />

        {/* 第二列：服务器分组 */}
        {selectedPanel ? (
          <ServerGroupList
            groups={serverGroups}
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
            onAddGroup={handleAddGroup}
            onEditGroup={groupModal.openForEdit}
            onDeleteGroup={handleDeleteGroup}
          />
        ) : (
          <div className="card">
            <p className="dashboard__placeholder">⬅️ 请先选择一个面板</p>
          </div>
        )}

        {/* 第三列：服务器列表 */}
        {selectedGroup ? (
          <ServerList
            servers={servers}
            selectedServer={selectedServer}
            onSelectServer={setSelectedServer}
            onAddServer={handleAddServer}
            onEditServer={serverModal.openForEdit}
            onDeleteServer={handleDeleteServer}
            onViewConfig={handleViewServerConfig}
            onConnectSSH={handleConnectSSH}
          />
        ) : (
          <div className="card">
            <p className="dashboard__placeholder">⬅️ 请先选择一个分组</p>
          </div>
        )}

        {/* 第四列：节点列表 */}
        {selectedServer ? (
          <NodeList
            nodes={nodes}
            selectedServer={selectedServer}
            onAddNode={handleAddNode}
            onEditNode={nodeModal.openForEdit}
            onDeleteNode={handleDeleteNode}
            onImportNodes={handleImportNodes}
          />
        ) : (
          <div className="card">
            <p className="dashboard__placeholder">⬅️ 请先选择一个服务器</p>
          </div>
        )}
      </div>

      {/* 弹窗 */}
      <PanelModal
        isOpen={panelModal.isOpen}
        onClose={panelModal.close}
        onSave={handleSavePanel}
        panel={panelModal.editingItem}
      />

      <ServerGroupModal
        isOpen={groupModal.isOpen}
        onClose={groupModal.close}
        onSave={handleSaveGroup}
        group={groupModal.editingItem}
        panelId={selectedPanel?.id}
      />

      <ServerModal
        isOpen={serverModal.isOpen}
        onClose={serverModal.close}
        onSave={handleSaveServer}
        server={serverModal.editingItem}
        groupId={selectedGroup?.id}
      />

      <NodeModal
        isOpen={nodeModal.isOpen}
        onClose={nodeModal.close}
        onSave={handleSaveNode}
        node={nodeModal.editingItem}
        serverId={selectedServer?.id}
      />

      <ImportNodesModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleSaveImportedNodes}
        serverId={selectedServer?.id}
        panelId={selectedPanel?.id}
      />

      <ConfigViewer
        isOpen={showConfigViewer}
        onClose={() => setShowConfigViewer(false)}
        config={configData}
        title={configType}
      />

      <SSHModal
        isOpen={showSSHModal}
        onClose={() => setShowSSHModal(false)}
        server={sshServer}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={hideConfirm}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        requireInput={confirmConfig.requireInput}
      />

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
}

export default Dashboard;
