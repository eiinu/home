import React from 'react'
import './SecondaryTabs.css'

interface SecondaryTab {
  id: string
  label: string
  icon?: string
}

interface SecondaryTabsProps {
  tabs: SecondaryTab[]
  activeTab: string
  onTabClick: (id: string) => void
  parentTool: string
}

const SecondaryTabs: React.FC<SecondaryTabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabClick, 
  parentTool 
}) => {
  if (tabs.length === 0) {
    return null
  }

  return (
    <div className="secondary-tabs">
      <div className="secondary-tabs-header">
        <h3 className="secondary-tabs-title">
          {getToolDisplayName(parentTool)}
        </h3>
      </div>
      <div className="secondary-tabs-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`secondary-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabClick(tab.id)}
          >
            {tab.icon && <span className="secondary-tab-icon">{tab.icon}</span>}
            <span className="secondary-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function getToolDisplayName(toolId: string): string {
  const toolNames: Record<string, string> = {
    'json-formatter': 'JSON 工具',
    'html-formatter': 'HTML 工具',
    'sse-parser': 'SSE 解析器',
    'keyboard-listener': '键盘监听器',
    'clipboard-manager': '剪贴板管理',
    'settings': '设置'
  }
  return toolNames[toolId] || '工具'
}

export default SecondaryTabs