/**
 * 节点列表组件
 * 使用 ListCard 通用组件
 */
import ListCard, { ActionButton } from './ListCard';

function NodeList({
  nodes,
  selectedServer,
  onAddNode,
  onEditNode,
  onDeleteNode,
  onImportNodes
}) {
  const renderContent = (node) => (
    <>
      <h3 className="list-item__title">{node.name}</h3>
      <p className="list-item__subtitle">
        📡 节点ID: {node.nodeId} | 类型: {node.nodeType}
      </p>
      {node.certDomain && (
        <p className="list-item__meta">🔒 {node.certDomain}</p>
      )}
    </>
  );

  const renderActions = (node) => (
    <>
      <ActionButton variant="primary" onClick={() => onEditNode(node)}>
        编辑
      </ActionButton>
      <ActionButton variant="danger" onClick={() => onDeleteNode(node.id)}>
        删除
      </ActionButton>
    </>
  );

  // 头部额外操作按钮
  const headerActions = (
    <button
      className="btn btn-success"
      onClick={onImportNodes}
      disabled={!selectedServer}
    >
      📥 导入节点
    </button>
  );

  // 未选择服务器时显示提示
  if (!selectedServer) {
    return (
      <div className="card">
        <div className="list-card__header">
          <h2 className="list-card__title">🖥️ 节点列表</h2>
        </div>
        <div className="list-card__empty">请先选择一个服务器</div>
      </div>
    );
  }

  return (
    <ListCard
      title="节点列表"
      icon="🖥️"
      items={nodes}
      onAdd={onAddNode}
      addButtonText="+ 添加节点"
      renderContent={renderContent}
      renderActions={renderActions}
      emptyText="该服务器下暂无节点，点击上方按钮添加"
      headerActions={headerActions}
    />
  );
}

export default NodeList;
