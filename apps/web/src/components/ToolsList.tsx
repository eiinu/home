import React from 'react'
import './ToolsList.css'

interface Tool {
  id: string
  icon: string
  label: string
  description?: string
  badge?: number
}

interface ToolsListProps {
  tools: Tool[]
  activeTool: string
  onToolClick: (id: string) => void
  category: string
}

const ToolsList: React.FC<ToolsListProps> = ({ 
  tools, 
  activeTool, 
  onToolClick, 
  category 
}) => {
  if (tools.length === 0) {
    return (
      <div className="tools-list empty">
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>暂无工具</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tools-list">
      <div className="tools-list-header">
        <h3 className="tools-list-title">
          {getCategoryDisplayName(category)}
        </h3>
      </div>
      <div className="tools-list-content">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`tool-item ${activeTool === tool.id ? 'active' : ''}`}
            onClick={() => onToolClick(tool.id)}
          >
            <div className="tool-item-icon">
              {tool.icon}
              {tool.badge && tool.badge > 0 && (
                <span className="tool-item-badge">{tool.badge > 99 ? '99+' : tool.badge}</span>
              )}
            </div>
            <div className="tool-item-content">
              <span className="tool-item-label">{tool.label}</span>
              {tool.description && (
                <span className="tool-item-description">{tool.description}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function getCategoryDisplayName(categoryId: string): string {
  const categoryNames: Record<string, string> = {
    'tools': '开发工具',
    'settings': '设置选项'
  }
  return categoryNames[categoryId] || '工具'
}

export default ToolsList