import React, { useState, useMemo } from 'react'
import './Workspace.css'
import CategoryDock from './CategoryDock'
import ToolsList from './ToolsList'
import { useTheme } from './ThemeProvider'
import { JsonFormatter, HtmlFormatter, SseParser, KeyboardListener, ClipboardManager, Button, Base64Tool, RegexTester, ColorTool } from '@eiinu/tools'
import { BorderEditor } from '@eiinu/creative'
// import { Game2048 } from '@eiinu/games' // 暂时关闭游戏功能

const Workspace: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('tools')
  const [activeTool, setActiveTool] = useState('base64-tool')
  const { theme, setTheme } = useTheme()

  // 使用 useMemo 来保持组件实例，避免重新创建
  const componentInstances = useMemo(() => ({
    jsonFormatter: <JsonFormatter />,
    htmlFormatter: <HtmlFormatter />,
    sseParser: <SseParser />,
    keyboardListener: <KeyboardListener />,
    clipboardManager: <ClipboardManager />,
    base64Tool: <Base64Tool />,
    regexTester: <RegexTester />,
    colorTool: <ColorTool />,
    borderEditor: <BorderEditor />,
    // game2048: <Game2048 /> // 暂时关闭游戏功能
  }), [])

  // 主分类配置
  const categories = [
    {
      id: 'tools',
      icon: '🛠️',
      label: '工具'
    },
    {
      id: 'creative',
      icon: '🎨',
      label: '创意工坊'
    },
    // 暂时关闭游戏功能
    // {
    //   id: 'games',
    //   icon: '🎮',
    //   label: '游戏'
    // },
    {
      id: 'settings',
      icon: '⚙️',
      label: '设置'
    }
  ]

  // 工具配置
  const toolsConfig = {
    tools: [
      {
        id: 'json-formatter',
        icon: '{}',
        label: 'JSON 工具',
        description: 'JSON 格式化和验证'
      },
      {
        id: 'html-formatter',
        icon: '</>',
        label: 'HTML 工具',
        description: 'HTML 格式化和美化'
      },
      {
        id: 'base64-tool',
        icon: '🔐',
        label: 'Base64 工具',
        description: 'Base64 编码和解码'
      },
      {
        id: 'regex-tester',
        icon: '🔍',
        label: '正则测试器',
        description: '正则表达式测试和验证'
      },
      {
        id: 'color-tool',
        icon: '🎨',
        label: '颜色工具',
        description: '颜色选择器和格式转换'
      },
      {
        id: 'sse-parser',
        icon: '📡',
        label: 'SSE 解析器',
        description: 'Server-Sent Events 解析'
      },
      {
        id: 'keyboard-listener',
        icon: '⌨️',
        label: '键盘监听器',
        description: '监听键盘事件'
      },
      {
        id: 'clipboard-manager',
        icon: '📋',
        label: '剪贴板管理',
        description: '剪贴板内容管理'
      }
    ],
    creative: [
      {
        id: 'border-editor',
        icon: '🖼️',
        label: 'CSS 边框编辑器',
        description: '可视化编辑 CSS 边框样式'
      }
    ],
    // 暂时关闭游戏功能
    // games: [
    //   {
    //     id: 'game-2048',
    //     icon: '🎯',
    //     label: '2048',
    //     description: '经典数字合成游戏'
    //   }
    // ],
    settings: [
      {
        id: 'theme-settings',
        icon: '🎨',
        label: '主题设置',
        description: '切换应用主题'
      }
    ]
  }

  // 处理分类点击
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId)
    // 设置该分类下的第一个工具为活跃工具
    const tools = toolsConfig[categoryId as keyof typeof toolsConfig] || []
    if (tools.length > 0) {
      setActiveTool(tools[0].id)
    }
  }

  // 处理工具点击
  const handleToolClick = (toolId: string) => {
    setActiveTool(toolId)
  }

  // 处理主题变更
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme)
  }

  // 获取当前分类的工具列表
  const currentTools = toolsConfig[activeCategory as keyof typeof toolsConfig] || []

  // 渲染工具内容
  const renderToolContent = () => {
    switch (activeTool) {
      case 'json-formatter':
        return componentInstances.jsonFormatter
      case 'html-formatter':
        return componentInstances.htmlFormatter
      case 'base64-tool':
        return componentInstances.base64Tool
      case 'regex-tester':
        return componentInstances.regexTester
      case 'color-tool':
        return componentInstances.colorTool
      case 'sse-parser':
        return componentInstances.sseParser
      case 'keyboard-listener':
        return componentInstances.keyboardListener
      case 'clipboard-manager':
        return componentInstances.clipboardManager
      case 'border-editor':
        return componentInstances.borderEditor
      // 暂时关闭游戏功能
      // case 'game-2048':
      //   return componentInstances.game2048
      case 'theme-settings':
        return (
          <div className="settings-panel">
            <div className="settings-section">
              <h3>主题设置</h3>
              <div className="theme-options">
                <Button
                  variant={theme === 'light' ? 'primary' : 'secondary'}
                  onClick={() => handleThemeChange('light')}
                >
                  浅色主题
                </Button>
                <Button
                  variant={theme === 'dark' ? 'primary' : 'secondary'}
                  onClick={() => handleThemeChange('dark')}
                >
                  深色主题
                </Button>
                <Button
                  variant={theme === 'auto' ? 'primary' : 'secondary'}
                  onClick={() => handleThemeChange('auto')}
                >
                  跟随系统
                </Button>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="empty-content">
            <div className="empty-state">
              <div className="empty-icon">🔧</div>
              <h3>选择一个工具开始使用</h3>
              <p>从左侧选择一个工具来开始您的工作</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="workspace">
      {/* 第一列：主分类 */}
      <CategoryDock
        categories={categories}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />

      {/* 第二列：工具列表 */}
      <ToolsList
        tools={currentTools}
        activeTool={activeTool}
        onToolClick={handleToolClick}
        category={activeCategory}
      />

      {/* 第三列：内容面板 */}
      <div className="workspace-content">
        {renderToolContent()}
      </div>
    </div>
  )
}

export default Workspace