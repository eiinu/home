// 主分类配置
export const toolCategories = [
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
export const toolsConfig = {
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

export const defaultToolId = "base64-tool";

export function toolHref(toolId: string) {
  return `#tools/${toolId}`;
}

export function resolveRoute(hash: string) {
  if (hash === "#tools" || hash.startsWith("#tools/")) {
    const requested = hash.slice("#tools/".length);
    const tool = Object.values(toolsConfig)
      .flat()
      .find((item) => item.id === requested);
    const toolId = tool?.id ?? defaultToolId;
    return { view: "tools" as const, toolId, hash: toolHref(toolId) };
  }
  return { view: "home" as const, toolId: defaultToolId, hash: "#home" };
}
