import React, { useState, useMemo } from 'react'
import './Workspace.css'
import Dock from './Dock'
import { useTheme } from './ThemeProvider'
import { JsonFormatter, SseParser, KeyboardListener, ClipboardManager, Button } from '@eiinu/tools'
import './Workspace.css'

const Workspace: React.FC = () => {
  const [activeApp, setActiveApp] = useState('json-formatter')
  const { theme, setTheme, isDark } = useTheme()

  // 使用 useMemo 来保持组件实例，避免重新创建
  const componentInstances = useMemo(() => ({
    jsonFormatter: <JsonFormatter />,
    sseParser: <SseParser />,
    keyboardListener: <KeyboardListener />,
    clipboardManager: <ClipboardManager />
  }), [])

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
      id: 'clipboard-manager',
      icon: '📋',
      label: '剪贴板管理'
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

  return (
    <div className="workspace">
      <Dock items={dockItems} onItemClick={handleDockItemClick} />
      <main className="workspace-content">
        <div className="workspace-header">
          <h1 className="workspace-title">
            {dockItems.find(item => item.id === activeApp)?.label || '工作台'}
          </h1>
          <div className="workspace-actions">
            <Button 
              variant="default"
              size="small"
              title={`当前主题: ${isDark ? '深色' : '浅色'}`}
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              icon={isDark ? '☀️' : '🌙'}
            />
          </div>
        </div>
        <div className="workspace-main">
          <div style={{ display: activeApp === 'json-formatter' ? 'block' : 'none' }}>
            {componentInstances.jsonFormatter}
          </div>
          <div style={{ display: activeApp === 'sse-parser' ? 'block' : 'none' }}>
            {componentInstances.sseParser}
          </div>
          <div style={{ display: activeApp === 'keyboard-listener' ? 'block' : 'none' }}>
            {componentInstances.keyboardListener}
          </div>
          <div style={{ display: activeApp === 'clipboard-manager' ? 'block' : 'none' }}>
            {componentInstances.clipboardManager}
          </div>
          {activeApp === 'settings' && (
            <div className="app-placeholder">
              <div className="placeholder-icon">⚙️</div>
              <h2>设置</h2>
              <div className="settings-panel">
                <div className="setting-group">
                  <label>主题设置</label>
                  <div className="theme-selector">
                    <Button
                      variant="default"
                      size="small"
                      active={theme === 'light'}
                      onClick={() => handleThemeChange('light')}
                      icon="☀️"
                    >
                      浅色
                    </Button>
                    <Button
                      variant="default"
                      size="small"
                      active={theme === 'dark'}
                      onClick={() => handleThemeChange('dark')}
                      icon="🌙"
                    >
                      深色
                    </Button>
                    <Button
                      variant="default"
                      size="small"
                      active={theme === 'auto'}
                      onClick={() => handleThemeChange('auto')}
                      icon="🔄"
                    >
                      自动
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!['json-formatter', 'sse-parser', 'keyboard-listener', 'clipboard-manager', 'settings'].includes(activeApp) && (
            <div className="app-placeholder">
              <div className="placeholder-icon">🔧</div>
              <h2>工具</h2>
              <p>选择左侧的工具开始使用</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Workspace