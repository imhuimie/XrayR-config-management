/**
 * 服务器分组列表组件
 * 使用 ListCard 通用组件
 */
import ListCard, { ActionButton } from './ListCard';

function ServerGroupList({
  groups,
  selectedGroup,
  onSelectGroup,
  onAddGroup,
  onEditGroup,
  onDeleteGroup
}) {
  const renderContent = (group) => (
    <>
      <h3 className="list-item__title">{group.name}</h3>
      {group.description && (
        <p className="list-item__subtitle">{group.description}</p>
      )}
    </>
  );

  const renderActions = (group) => (
    <>
      <ActionButton variant="secondary" onClick={() => onEditGroup(group)}>
        编辑
      </ActionButton>
      <ActionButton variant="danger" onClick={() => onDeleteGroup(group.id)}>
        删除
      </ActionButton>
    </>
  );

  return (
    <ListCard
      title="服务器分组"
      icon="📁"
      items={groups}
      selectedItem={selectedGroup}
      onSelect={onSelectGroup}
      onAdd={onAddGroup}
      addButtonText="+ 添加分组"
      renderContent={renderContent}
      renderActions={renderActions}
      emptyText="暂无分组，请先添加分组"
    />
  );
}

export default ServerGroupList;
