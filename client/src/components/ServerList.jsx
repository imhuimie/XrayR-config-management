/**
 * 服务器列表组件
 * 使用 ListCard 通用组件
 */
import ListCard, { ActionButton } from './ListCard';

function ServerList({
  servers,
  selectedServer,
  onSelectServer,
  onAddServer,
  onEditServer,
  onDeleteServer,
  onViewConfig,
  onConnectSSH
}) {
  const renderContent = (server) => (
    <>
      <h3 className="list-item__title">{server.name}</h3>
      {server.serverAddress && (
        <p className="list-item__subtitle">
          <strong>🖥️ 服务器:</strong> {server.serverAddress}
        </p>
      )}
      {server.configFilePath && (
        <p className="list-item__meta">
          <strong>📄 配置路径:</strong> {server.configFilePath}
        </p>
      )}
    </>
  );

  const renderActions = (server) => (
    <>
      <ActionButton variant="success" onClick={() => onConnectSSH(server)} title="SSH 连接">
        🔗 SSH
      </ActionButton>
      <ActionButton variant="success" onClick={() => onViewConfig(server)}>
        查看配置
      </ActionButton>
      <ActionButton variant="secondary" onClick={() => onEditServer(server)}>
        编辑
      </ActionButton>
      <ActionButton variant="danger" onClick={() => onDeleteServer(server.id)}>
        删除
      </ActionButton>
    </>
  );

  return (
    <ListCard
      title="服务器列表"
      icon="🖥️"
      items={servers}
      selectedItem={selectedServer}
      onSelect={onSelectServer}
      onAdd={onAddServer}
      addButtonText="+ 添加服务器"
      renderContent={renderContent}
      renderActions={renderActions}
      emptyText="暂无服务器，请先添加服务器"
    />
  );
}

export default ServerList;
