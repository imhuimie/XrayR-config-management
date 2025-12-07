/**
 * 面板列表组件
 * 使用 ListCard 通用组件
 */
import ListCard, { ActionButton } from './ListCard';

function PanelList({
  panels,
  selectedPanel,
  onSelectPanel,
  onAddPanel,
  onEditPanel,
  onDeletePanel
}) {
  const renderContent = (panel) => (
    <>
      <h3 className="list-item__title">{panel.name}</h3>
      <p className="list-item__subtitle">🌐 {panel.domain}</p>
      <p className="list-item__meta">🔑 {panel.apiKey.substring(0, 20)}...</p>
    </>
  );

  const renderActions = (panel) => (
    <>
      <ActionButton variant="primary" onClick={() => onEditPanel(panel)}>
        编辑
      </ActionButton>
      <ActionButton variant="danger" onClick={() => onDeletePanel(panel.id)}>
        删除
      </ActionButton>
    </>
  );

  return (
    <ListCard
      title="面板列表"
      icon="📋"
      items={panels}
      selectedItem={selectedPanel}
      onSelect={onSelectPanel}
      onAdd={onAddPanel}
      addButtonText="+ 添加面板"
      renderContent={renderContent}
      renderActions={renderActions}
      emptyText="暂无面板，点击上方按钮添加"
    />
  );
}

export default PanelList;
