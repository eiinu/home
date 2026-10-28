import React, { useState, useMemo } from "react";
import "./Workspace.css";
import "./ToolsWorkspace.css";
import "./ToolDetails.css";
import { useTheme } from "./ThemeProvider";
import {
  JsonFormatter,
  HtmlFormatter,
  XmlFormatter,
  SseParser,
  KeyboardListener,
  ClipboardManager,
  Button,
  Base64Tool,
  RegexTester,
  CronHelper,
} from "@eiinu/tools";
import { BorderEditor, ColorTool } from "@eiinu/creative";
import { MarkdownRenderer, RemarkRenderer } from "@eiinu/editor";
// import { Game2048 } from '@eiinu/games' // 暂时关闭游戏功能

const Workspace: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("tools");
  const [activeTool, setActiveTool] = useState("base64-tool");
  const [filter, setFilter] = useState("");
  const { theme, setTheme } = useTheme();

  // 使用 useMemo 来保持组件实例，避免重新创建
  const componentInstances = useMemo(
    () => ({
      jsonFormatter: <JsonFormatter />,
      htmlFormatter: <HtmlFormatter />,
      xmlFormatter: <XmlFormatter />,
      sseParser: <SseParser />,
      keyboardListener: <KeyboardListener />,
      clipboardManager: <ClipboardManager />,
      base64Tool: <Base64Tool />,
      regexTester: <RegexTester />,
      cronHelper: <CronHelper />,
      colorTool: <ColorTool />,
      borderEditor: <BorderEditor />,
      markdownRenderer: <MarkdownRenderer />,
      remarkRenderer: <RemarkRenderer />,
      // game2048: <Game2048 /> // 暂时关闭游戏功能
    }),
    [],
  );

  // 主分类配置
  const categories = [
    {
      id: "tools",
      icon: "🛠️",
      label: "工具",
    },
    {
      id: "creative",
      icon: "🎨",
      label: "创意工坊",
    },
    {
      id: "editor",
      icon: "📝",
      label: "编辑器",
    },
    // 暂时关闭游戏功能
    // {
    //   id: 'games',
    //   icon: '🎮',
    //   label: '游戏'
    // },
    {
      id: "settings",
      icon: "⚙️",
      label: "设置",
    },
  ];

  // 工具配置
  const toolsConfig = {
    tools: [
      {
        id: "json-formatter",
        icon: "{}",
        label: "JSON 工具",
        description: "JSON 格式化和验证",
      },
      {
        id: "html-formatter",
        icon: "</>",
        label: "HTML 工具",
        description: "HTML 格式化和美化",
      },
      {
        id: "xml-formatter",
        icon: "🧾",
        label: "XML 工具",
        description: "XML 格式化和美化",
      },
      {
        id: "base64-tool",
        icon: "🔐",
        label: "Base64 工具",
        description: "Base64 编码和解码",
      },
      {
        id: "regex-tester",
        icon: "🔍",
        label: "正则测试器",
        description: "正则表达式测试和验证",
      },
      {
        id: "cron-helper",
        icon: "⏱️",
        label: "Cron 助手",
        description: "生成与解释 Cron 表达式",
      },
      {
        id: "sse-parser",
        icon: "📡",
        label: "SSE 解析器",
        description: "Server-Sent Events 解析",
      },
      {
        id: "keyboard-listener",
        icon: "⌨️",
        label: "键盘监听器",
        description: "监听键盘事件",
      },
      {
        id: "clipboard-manager",
        icon: "📋",
        label: "剪贴板管理",
        description: "剪贴板内容管理",
      },
    ],
    creative: [
      {
        id: "border-editor",
        icon: "🖼️",
        label: "CSS 边框编辑器",
        description: "可视化编辑 CSS 边框样式",
      },
      {
        id: "color-tool",
        icon: "🎨",
        label: "颜色工具",
        description: "颜色选择器和格式转换",
      },
    ],
    editor: [
      {
        id: "markdown-it",
        icon: "📝",
        label: "Markdown-it",
        description: "基于 markdown-it 的 Markdown 编辑与预览",
      },
      {
        id: "remarkjs",
        icon: "🪧",
        label: "RemarkJS",
        description: "基于 remarkjs 的 Markdown 编辑与 AST 展示",
      },
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
        id: "theme-settings",
        icon: "🎨",
        label: "主题设置",
        description: "切换应用主题",
      },
    ],
  };

  // 处理分类点击
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    // 设置该分类下的第一个工具为活跃工具
    const tools = toolsConfig[categoryId as keyof typeof toolsConfig] || [];
    if (tools.length > 0) {
      setActiveTool(tools[0].id);
    }
  };

  // 处理工具点击
  const handleToolClick = (toolId: string, categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveTool(toolId);
  };

  // 处理主题变更
  const handleThemeChange = (newTheme: "light" | "dark" | "auto") => {
    setTheme(newTheme);
  };

  // 获取当前分类的工具列表
  const currentTools =
    toolsConfig[activeCategory as keyof typeof toolsConfig] || [];
  const currentTool = currentTools.find((tool) => tool.id === activeTool);

  // 渲染工具内容
  const renderToolContent = () => {
    switch (activeTool) {
      case "json-formatter":
        return componentInstances.jsonFormatter;
      case "html-formatter":
        return componentInstances.htmlFormatter;
      case "xml-formatter":
        return componentInstances.xmlFormatter;
      case "base64-tool":
        return componentInstances.base64Tool;
      case "regex-tester":
        return componentInstances.regexTester;
      case "cron-helper":
        return componentInstances.cronHelper;
      case "color-tool":
        return componentInstances.colorTool;
      case "sse-parser":
        return componentInstances.sseParser;
      case "keyboard-listener":
        return componentInstances.keyboardListener;
      case "clipboard-manager":
        return componentInstances.clipboardManager;
      case "border-editor":
        return componentInstances.borderEditor;
      case "markdown-it":
        return componentInstances.markdownRenderer;
      case "remarkjs":
        return componentInstances.remarkRenderer;
      // 暂时关闭游戏功能
      // case 'game-2048':
      //   return componentInstances.game2048
      case "theme-settings":
        return (
          <div className="settings-panel">
            <div className="settings-section">
              <div className="theme-options">
                <Button
                  variant={theme === "light" ? "primary" : "secondary"}
                  onClick={() => handleThemeChange("light")}
                >
                  浅色主题
                </Button>
                <Button
                  variant={theme === "dark" ? "primary" : "secondary"}
                  onClick={() => handleThemeChange("dark")}
                >
                  深色主题
                </Button>
                <Button
                  variant={theme === "auto" ? "primary" : "secondary"}
                  onClick={() => handleThemeChange("auto")}
                >
                  跟随系统
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="empty-content">
            <div className="empty-state">
              <div className="empty-icon">🔧</div>
              <h3>选择一个工具开始使用</h3>
              <p>从左侧选择一个工具来开始您的工作</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="workspace workbench">
      <aside className="workbench-sidebar" aria-label="工具目录">
        <h1>我的工具</h1>
        <label className="tool-search">
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="查找工具"
            placeholder="查找工具"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </label>
        <div className="workbench-directory">
          {categories.map((category) => {
            const tools = (
              toolsConfig[category.id as keyof typeof toolsConfig] || []
            ).filter((tool) =>
              `${tool.label} ${tool.description}`
                .toLowerCase()
                .includes(filter.toLowerCase()),
            );
            return (
              tools.length > 0 && (
                <section key={category.id}>
                  <button
                    className={`category-item ${activeCategory === category.id ? "active" : ""}`}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    {category.label}
                  </button>
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      className={`tool-item ${activeTool === tool.id ? "active" : ""}`}
                      aria-current={activeTool === tool.id ? "page" : undefined}
                      onClick={() => handleToolClick(tool.id, category.id)}
                    >
                      <span className="tool-item-marker" aria-hidden="true">
                        {tool.id === "json-formatter"
                          ? "{ }"
                          : tool.id === "html-formatter"
                            ? "〈〉"
                            : tool.id === "markdown-it" ||
                                tool.id === "remarkjs"
                              ? "M↓"
                              : "·"}
                      </span>
                      <span>{tool.label}</span>
                      {activeTool === tool.id && (
                        <span className="tool-active-dot" />
                      )}
                    </button>
                  ))}
                </section>
              )
            );
          })}
          {filter &&
            !Object.values(toolsConfig)
              .flat()
              .some((tool) =>
                `${tool.label} ${tool.description}`
                  .toLowerCase()
                  .includes(filter.toLowerCase()),
              ) && <p className="no-tool-results">没有找到这个工具。</p>}
        </div>
      </aside>
      <div className="workbench-body">
        <label className="workbench-mobile-select">
          <select
            aria-label="选择工具"
            value={activeTool}
            onChange={(event) => {
              const category = Object.entries(toolsConfig).find(([, tools]) =>
                tools.some((tool) => tool.id === event.target.value),
              );
              if (category) handleToolClick(event.target.value, category[0]);
            }}
          >
            {categories.map((category) => (
              <optgroup key={category.id} label={category.label}>
                {(
                  toolsConfig[category.id as keyof typeof toolsConfig] || []
                ).map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <header className="workbench-heading">
          <h2>{currentTool?.label}</h2>
        </header>
        <div className="workspace-content tool-surface">
          {renderToolContent()}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
