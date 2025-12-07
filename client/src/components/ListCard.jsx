/**
 * 通用列表卡片组件
 * 统一列表展示样式，遵循 DRY 原则
 */

/**
 * 列表项组件
 */
function ListItem({ item, isSelected, onClick, renderContent, renderActions }) {
  return (
    <div
      className={`list-item ${isSelected ? 'list-item--selected' : ''}`}
      onClick={() => onClick?.(item)}
    >
      <div className="list-item__content">
        <div className="list-item__main">
          {renderContent(item)}
        </div>
        {renderActions && (
          <div className="list-item__actions">
            {renderActions(item)}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 操作按钮组件
 */
export function ActionButton({ onClick, variant = 'primary', children, disabled, title }) {
  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <button
      className={`btn btn-sm btn-${variant}`}
      onClick={handleClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

/**
 * 通用列表卡片组件
 * @param {Object} props
 * @param {string} props.title - 卡片标题
 * @param {string} props.icon - 标题图标
 * @param {Array} props.items - 列表数据
 * @param {Object} props.selectedItem - 当前选中项
 * @param {Function} props.onSelect - 选中回调
 * @param {Function} props.onAdd - 添加按钮回调
 * @param {string} props.addButtonText - 添加按钮文字
 * @param {Function} props.renderContent - 渲染列表项内容
 * @param {Function} props.renderActions - 渲染列表项操作按钮
 * @param {string} props.emptyText - 空列表提示文字
 * @param {React.ReactNode} props.headerActions - 头部额外操作按钮
 * @param {number} props.maxHeight - 列表最大高度
 */
function ListCard({
  title,
  icon = '📋',
  items = [],
  selectedItem,
  onSelect,
  onAdd,
  addButtonText = '+ 添加',
  renderContent,
  renderActions,
  emptyText = '暂无数据',
  headerActions,
  maxHeight = 500
}) {
  return (
    <div className="card">
      {/* 头部 */}
      <div className="list-card__header">
        <h2 className="list-card__title">
          {icon} {title}
        </h2>
        <div className="list-card__header-actions">
          {headerActions}
          {onAdd && (
            <button className="btn btn-primary" onClick={onAdd}>
              {addButtonText}
            </button>
          )}
        </div>
      </div>

      {/* 列表内容 */}
      {items.length === 0 ? (
        <div className="list-card__empty">
          {emptyText}
        </div>
      ) : (
        <div className="list-card__body" style={{ maxHeight }}>
          {items.map(item => (
            <ListItem
              key={item.id}
              item={item}
              isSelected={selectedItem?.id === item.id}
              onClick={onSelect}
              renderContent={renderContent}
              renderActions={renderActions}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ListCard;
