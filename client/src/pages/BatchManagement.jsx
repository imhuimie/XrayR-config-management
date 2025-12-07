import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../utils/api'
import '../styles/BatchManagement.css'

function BatchManagement() {
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedPanelId } = location.state || {}

  const [serverGroups, setServerGroups] = useState([])
  const [servers, setServers] = useState([])
  const [selectedGroupId, setSelectedGroupId] = useState('all')
  const [selectedServers, setSelectedServers] = useState([])
  const [activeTab, setActiveTab] = useState('upload') // 'upload' or 'command'

  // 批量上传相关状态
  const [uploadPath, setUploadPath] = useState('/root/')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  // 批量命令相关状态
  const [command, setCommand] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)

  // 统一的输出结果
  const [outputLog, setOutputLog] = useState('')

  useEffect(() => {
    if (!selectedPanelId) {
      alert('请先在首页选择一个面板')
      navigate('/')
      return
    }
    fetchData()
  }, [selectedPanelId])

  const fetchData = async () => {
    try {
      const [groupsRes, serversRes] = await Promise.all([
        api.get('/server-groups'),
        api.get('/servers')
      ])

      console.log('获取到的分组:', groupsRes.data)
      console.log('获取到的服务器:', serversRes.data)
      console.log('当前面板ID:', selectedPanelId)

      // 过滤当前面板的数据
      const filteredGroups = groupsRes.data.filter(g => g.panelId == selectedPanelId)

      // 注意：服务器数据中使用的是 groupId 而不是 serverGroupId
      const filteredServers = serversRes.data.filter(s => {
        // 服务器可能直接有 groupId 字段
        const group = groupsRes.data.find(g => g.id === s.groupId)
        return group && group.panelId == selectedPanelId
      })

      console.log('过滤后的分组:', filteredGroups)
      console.log('过滤后的服务器:', filteredServers)

      setServerGroups(filteredGroups)
      setServers(filteredServers)
    } catch (error) {
      console.error('获取数据失败:', error)
      alert('获取数据失败: ' + error.message)
    }
  }

  const filteredServers = selectedGroupId === 'all'
    ? servers
    : servers.filter(s => s.groupId === selectedGroupId)

  const toggleServerSelection = (serverId) => {
    setSelectedServers(prev =>
      prev.includes(serverId)
        ? prev.filter(id => id !== serverId)
        : [...prev, serverId]
    )
  }

  const selectAllServers = () => {
    if (selectedServers.length === filteredServers.length) {
      setSelectedServers([])
    } else {
      setSelectedServers(filteredServers.map(s => s.id))
    }
  }

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files))
  }

  const handleBatchUpload = async () => {
    if (selectedServers.length === 0) {
      alert('请至少选择一个服务器')
      return
    }
    if (selectedFiles.length === 0) {
      alert('请选择要上传的文件')
      return
    }
    if (!uploadPath.trim()) {
      alert('请输入上传目录')
      return
    }

    // 确保路径以 / 结尾
    const normalizedPath = uploadPath.endsWith('/') ? uploadPath : uploadPath + '/'

    setIsUploading(true)
    setOutputLog('')

    let log = `开始批量上传文件\n上传目录: ${normalizedPath}\n文件数量: ${selectedFiles.length}\n选中服务器数量: ${selectedServers.length}\n\n`
    setOutputLog(log)

    // 遍历每个服务器
    for (const serverId of selectedServers) {
      const server = servers.find(s => s.id === serverId)
      log += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      log += `📡 服务器: ${server?.name}\n`
      log += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      setOutputLog(log)

      // 遍历每个文件
      for (const file of selectedFiles) {
        log += `  📄 ${file.name} (${(file.size / 1024).toFixed(2)} KB) - 上传中...\n`
        setOutputLog(log)

        try {
          // 读取文件内容
          const fileContent = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target.result)
            reader.onerror = reject
            reader.readAsText(file)
          })

          // 上传文件
          const response = await api.post(`/batch/upload-file`, {
            serverId,
            filePath: normalizedPath + file.name,
            fileContent
          })

          log += `  ✅ ${file.name} - ${response.data.message}\n`
          setOutputLog(log)
        } catch (error) {
          log += `  ❌ ${file.name} - ${error.response?.data?.error || '上传失败'}\n`
          setOutputLog(log)
        }
      }

      log += `\n`
      setOutputLog(log)
    }

    log += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    log += `✨ 批量上传完成！\n`
    log += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    setOutputLog(log)
    setIsUploading(false)
  }

  const handleBatchCommand = async () => {
    if (selectedServers.length === 0) {
      alert('请至少选择一个服务器')
      return
    }
    if (!command.trim()) {
      alert('请输入要执行的命令')
      return
    }

    setIsExecuting(true)
    setOutputLog('')

    let log = `开始批量执行命令: ${command}\n选中服务器数量: ${selectedServers.length}\n\n`
    setOutputLog(log)

    for (const serverId of selectedServers) {
      const server = servers.find(s => s.id === serverId)
      log += `[${server?.name}] 执行中...\n`
      setOutputLog(log)

      try {
        const response = await api.post(`/batch/execute-command`, {
          serverId,
          command
        })

        log += `[${server?.name}] ✅ 执行成功\n`
        log += `输出:\n${response.data.output}\n\n`
        setOutputLog(log)
      } catch (error) {
        log += `[${server?.name}] ❌ ${error.response?.data?.error || '执行失败'}\n\n`
        setOutputLog(log)
      }
    }

    log += `批量执行完成！\n`
    setOutputLog(log)
    setIsExecuting(false)
  }

  return (
    <div className="batch-management">
      <div className="batch-header">
        <h1>📦 批量管理</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/', { state: { selectedPanelId } })}
        >
          ← 返回首页
        </button>
      </div>

      <div className="batch-content">
        {/* 左侧：服务器选择 */}
        <div className="batch-sidebar">
          <div className="server-group-selector">
            <h3>📁 服务器分组</h3>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="form-control"
            >
              <option value="all">全部服务器 ({servers.length})</option>
              {serverGroups.map(group => {
                const groupServerCount = servers.filter(s => s.groupId === group.id).length
                return (
                  <option key={group.id} value={group.id}>
                    {group.name} ({groupServerCount})
                  </option>
                )
              })}
            </select>
          </div>

          <div className="server-list">
            <div className="server-list-header">
              <h3>🖥️ 服务器列表</h3>
              {filteredServers.length > 0 && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={selectAllServers}
                >
                  {selectedServers.length === filteredServers.length && selectedServers.length > 0 ? '取消全选' : '全选'}
                </button>
              )}
            </div>

            <div className="server-items">
              {filteredServers.length === 0 ? (
                <div className="empty-message">
                  {servers.length === 0 ? '当前面板下暂无服务器' : '该分组下暂无服务器'}
                </div>
              ) : (
                filteredServers.map(server => (
                  <div
                    key={server.id}
                    className={`server-item ${selectedServers.includes(server.id) ? 'selected' : ''}`}
                    onClick={() => toggleServerSelection(server.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedServers.includes(server.id)}
                      onChange={() => {}}
                    />
                    <div className="server-info">
                      <div className="server-name">{server.name}</div>
                      <div className="server-address">{server.serverAddress}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="selected-count">
              已选择: {selectedServers.length} / {filteredServers.length}
            </div>
          </div>
        </div>

        {/* 右侧：操作区域 */}
        <div className="batch-main">
          <div className="batch-tabs">
            <button
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('upload')
                setOutputLog('')
              }}
            >
              📤 批量上传文件
            </button>
            <button
              className={`tab-btn ${activeTab === 'command' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('command')
                setOutputLog('')
              }}
            >
              ⚡ 批量执行命令
            </button>
          </div>

          {activeTab === 'upload' && (
            <div className="tab-content">
              <div className="operation-panel">
                <div className="form-row">
                  <div className="form-group-inline">
                    <label>上传目录：</label>
                    <input
                      type="text"
                      className="form-control-inline"
                      value={uploadPath}
                      onChange={(e) => setUploadPath(e.target.value)}
                      placeholder="/root/"
                      disabled={isUploading}
                    />
                  </div>

                  <div className="form-group-inline">
                    <label>选择文件：</label>
                    <input
                      type="file"
                      className="form-control-inline"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                      multiple
                    />
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleBatchUpload}
                    disabled={isUploading || selectedServers.length === 0 || selectedFiles.length === 0}
                  >
                    {isUploading ? '⏳ 上传中...' : '🚀 开始上传'}
                  </button>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="file-info">
                    📄 已选择 {selectedFiles.length} 个文件
                    {selectedFiles.length <= 5 && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                        {selectedFiles.map((file, index) => (
                          <div key={index}>
                            • {file.name} ({(file.size / 1024).toFixed(2)} KB)
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedFiles.length > 5 && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                        总大小: {(selectedFiles.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(2)} KB
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="output-panel">
                <div className="output-header">
                  <span>📋 执行日志</span>
                  {outputLog && (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setOutputLog('')}
                    >
                      清空
                    </button>
                  )}
                </div>
                <textarea
                  className="output-log"
                  value={outputLog || '等待执行...'}
                  readOnly
                />
              </div>
            </div>
          )}

          {activeTab === 'command' && (
            <div className="tab-content">
              <div className="operation-panel">
                <div className="form-row">
                  <div className="form-group-inline" style={{ flex: 1 }}>
                    <label>执行命令：</label>
                    <input
                      type="text"
                      className="form-control-inline"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      placeholder="输入要执行的命令，例如: systemctl status XrayR"
                      disabled={isExecuting}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isExecuting && selectedServers.length > 0 && command.trim()) {
                          handleBatchCommand()
                        }
                      }}
                    />
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleBatchCommand}
                    disabled={isExecuting || selectedServers.length === 0 || !command.trim()}
                  >
                    {isExecuting ? '⏳ 执行中...' : '⚡ 开始执行'}
                  </button>
                </div>
              </div>

              <div className="output-panel">
                <div className="output-header">
                  <span>📋 执行日志</span>
                  {outputLog && (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setOutputLog('')}
                    >
                      清空
                    </button>
                  )}
                </div>
                <textarea
                  className="output-log"
                  value={outputLog || '等待执行...'}
                  readOnly
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BatchManagement

