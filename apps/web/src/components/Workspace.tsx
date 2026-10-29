import React, { useState, useMemo } from "react";
import "./Workspace.css";
import "./ToolsWorkspace.css";
import "./ToolDetails.css";
import UiIcon from "./UiIcon";
import { toolCategories as categories, toolsConfig, toolHref } from "../toolRoutes";
import type { UiIconName } from "./UiIcon";
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

const toolGlyphs: Record<string, UiIconName> = {
  "json-formatter": "brackets",
  "html-formatter": "code",
  "xml-formatter": "code",
  "base64-tool": "article",
  "regex-tester": "regex",
  "cron-helper": "clock",
  "sse-parser": "stream",
  "keyboard-listener": "keyboard",
  "clipboard-manager": "clipboard",
  "border-editor": "border",
  "color-tool": "palette",
  "markdown-it": "markdown",
  remarkjs: "markdown",
  "theme-settings": "settings",
};
const Workspace: React.FC<{ activeTool: string }> = ({ activeTool }) => {
  const activeCategory =
    Object.entries(toolsConfig).find(([, tools]) =>
      tools.some((tool) => tool.id === activeTool),
    )?.[0] ?? "tools";
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("eiinu-sidebar-collapsed") === "true"; }
    catch { return false; }
  });
  function toggleSidebar() {
    setCollapsed(value => {
      try { localStorage.setItem("eiinu-sidebar-collapsed", String(!value)); } catch { /* optional preference */ }
      return !value;
    });
  }
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
    <div className={`workspace workbench ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="workbench-sidebar" aria-label="工具目录">
        <div className="workbench-sidebar-heading">
          <h1>我的工具</h1>
          <button className="sidebar-toggle" onClick={toggleSidebar} aria-label={collapsed ? "展开工具目录" : "收起工具目录"} aria-expanded={!collapsed} title={collapsed ? "展开工具目录" : "收起工具目录"}><UiIcon name="sidebar" size={18} /></button>
        </div>
        <label className="tool-search">
          <span>
            <UiIcon name="search" size={16} />
          </span>
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
              collapsed || `${tool.label} ${tool.description}`
                .toLowerCase()
                .includes(filter.toLowerCase()),
            );
            return (
              tools.length > 0 && (
                <section key={category.id}>
                  <a
                    className={`category-item ${activeCategory === category.id ? "active" : ""}`}
                    href={toolHref(
                      toolsConfig[category.id as keyof typeof toolsConfig][0].id,
                    )}
                  >
                    {category.label}
                  </a>
                  {tools.map((tool) => (
                    <a
                      key={tool.id}
                      className={`tool-item ${activeTool === tool.id ? "active" : ""}`}
                      aria-current={activeTool === tool.id ? "page" : undefined}
                      aria-label={tool.label}
                      title={collapsed ? tool.label : undefined}
                      href={toolHref(tool.id)}
                    >
                      <span className="tool-item-marker">
                        <UiIcon
                          name={toolGlyphs[tool.id] || "tools"}
                          size={16}
                        />
                      </span>
                      <span className="tool-item-label">{tool.label}</span>
                      {activeTool === tool.id && (
                        <span className="tool-active-dot" />
                      )}
                    </a>
                  ))}
                </section>
              )
            );
          })}
          {!collapsed && filter &&
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
              window.location.hash = toolHref(event.target.value);
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
