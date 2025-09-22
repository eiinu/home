import React, { useState } from 'react'
import './Workspace.css'
import Dock from './Dock'
import { useTheme } from './ThemeProvider'
import './Workspace.css'

interface WorkspaceProps {
  jsonFormatter?: React.ReactNode
  sseParser?: React.ReactNode
  keyboardListener?: React.ReactNode
}

const Workspace: React.FC<WorkspaceProps> = ({ jsonFormatter, sseParser, keyboardListener }) => {
  const [activeApp, setActiveApp] = useState('json-formatter')
  const { theme, setTheme, isDark } = useTheme()

  const dockItems = [
    {
      id: 'json-formatter',
      icon: '{}',
      label: 'JSON 格式化',
      active: true
    },
    {
      id: 'sse-parser',
      icon: '📡',
      label: 'SSE 解析器'
    },
    {
      id: 'keyboard-listener',
      icon: '⌨️',
      label: '键盘监听器'
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: '设置'
    }
  ]

  const handleDockItemClick = (id: string) => {
    setActiveApp(id)
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme)
  }

  const renderAppContent = () => {
    switch (activeApp) {
      case 'json-formatter':
        return jsonFormatter
      case 'sse-parser':
        return sseParser
      case 'keyboard-listener':
        return keyboardListener
      case 'settings':
        return (
          <div className="app-placeholder">
            <div className="placeholder-icon">⚙️</div>
            <h2>设置</h2>
            <div className="settings-panel">
              <div className="setting-group">
                <label>主题设置</label>
                <div className="theme-selector">
                  <button
                    className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('light')}
                  >
                    ☀️ 浅色
                  </button>
                  <button
                    className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    🌙 深色
                  </button>
                  <button
                    className={`theme-option ${theme === 'auto' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('auto')}
                  >
                    🔄 自动
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="app-placeholder">
            <div className="placeholder-icon">🔧</div>
            <h2>工具</h2>
            <p>选择左侧的工具开始使用</p>
          </div>
        )
    }
  }

  return (
    <div className="workspace">
      <Dock items={dockItems} onItemClick={handleDockItemClick} />
      <main className="workspace-content">
        <div className="workspace-header">
          <h1 className="workspace-title">
            {dockItems.find(item => item.id === activeApp)?.label || '工作台'}
          </h1>
          <div className="workspace-actions">
            <button className="action-button" title="搜索">
              🔍
            </button>
            <button className="action-button" title="帮助">
              ❓
            </button>
            <button 
              className="action-button" 
              title={`当前主题: ${isDark ? '深色' : '浅色'}`}
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button className="action-button" title="用户菜单">
              👤
            </button>
          </div>
        </div>
        <div className="workspace-main">
          {renderAppContent()}
        </div>
      </main>
    </div>
  )
}

export default Workspace