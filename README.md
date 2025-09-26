# 🛠️ Eiinu Tools

一个现代化的开发者工具集合，**完全由 AI Agent 自主开发完成**。

## 🤖 AI 驱动开发

本项目是 AI Agent 自主开发的典型案例，展示了现代 AI 在软件开发中的强大能力：

- **🎯 零人工编码**: 几乎所有代码都由 AI Agent 生成
- **🔄 自动化开发**: 从需求分析到代码实现，全程 AI 驱动
- **🛠️ 智能重构**: AI 自主进行代码优化和架构调整
- **🎨 UI/UX 设计**: 界面设计和用户体验优化均由 AI 完成
- **📦 组件化架构**: AI 自动提取公共组件，优化代码复用

## ✨ 功能特性

### 🔧 开发者工具

#### JSON 格式化器
- 🎨 JSON 数据格式化、压缩和验证
- 🖥️ 基于 CodeMirror 6 的语法高亮编辑器
- 🌓 支持明暗主题自动切换
- 📊 实时字符统计和行数统计

#### HTML 格式化器
- 🏷️ HTML 代码格式化和压缩
- 🔄 HTML 转义和反转义功能
- 🎯 智能缩进和标签配对
- 📝 支持多种 HTML 实体处理

#### SSE 解析器
- 📡 Server-Sent Events 数据流实时解析
- 🔍 自动识别和格式化 JSON 数据
- 📋 支持事件提取和数据路径查询
- 🎛️ 可配置的解析选项

#### 键盘监听器
- ⌨️ 实时键盘事件监控和分析
- 🖥️ 跨平台按键映射对比
- 📊 详细的按键信息展示
- 🎮 支持组合键检测

#### 剪贴板管理器
- 📋 多格式剪贴板内容管理
- 🖼️ 支持文本、HTML、图片等格式
- 👀 实时内容预览和编辑
- 💾 历史记录管理

### 🎨 通用组件

#### CodeMirror 编辑器
- 📝 支持 JSON、HTML、Plain Text 语言
- 🌓 智能主题切换（跟随系统/手动设置）
- 🔢 可配置行号、代码折叠等功能
- 🎯 完整的 TypeScript 类型支持

#### Toast 通知系统
- 🔔 非阻塞式用户通知
- 🎨 多种通知类型（成功、错误、警告、信息）
- ⏰ 自动隐藏和手动关闭
- 🎭 优雅的动画效果

#### 按钮组件
- 🎨 多种样式变体（primary、secondary、danger）
- 📏 多种尺寸选择（small、medium、large）
- 🔄 状态管理（loading、disabled）
- 🌓 主题适配

## 🏗️ 技术架构

### 核心技术栈
- **React 19** - 最新的 React 版本，支持并发特性
- **TypeScript** - 完整的类型安全保障
- **Vite 7** - 极速的构建工具和开发服务器
- **CodeMirror 6** - 现代化的代码编辑器
- **pnpm workspace** - 高效的 monorepo 管理

### 项目结构
```
eiinu/
├── apps/
│   └── web/                 # 主应用
├── packages/
│   └── tools/              # 开发者工具包
└── package.json            # 工作区配置
```

### 包管理
- **@eiinu/tools** - 开发者工具组件库
- **web** - 主应用，整合所有功能

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装与运行
```bash
# 克隆项目
git clone <repository-url>
cd eiinu

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建项目
pnpm build

# 代码检查
pnpm lint
```

### 开发模式
```bash
# 启动主应用开发服务器
pnpm dev

# 构建所有包
pnpm build

# 运行所有包的 lint 检查
pnpm lint
```

## 📦 组件使用

### 安装组件包
```bash
# 安装工具包
pnpm add @eiinu/tools
```

### 使用示例
```tsx
import { JsonFormatter, HtmlFormatter, CodeMirrorEditor } from '@eiinu/tools'
import '@eiinu/tools/style.css'

function App() {
  return (
    <div>
      <JsonFormatter theme="auto" />
      <HtmlFormatter theme="dark" />
      <CodeMirrorEditor 
        language="json" 
        value="{}" 
        onChange={console.log} 
      />
    </div>
  )
}
```

## 🎨 主题系统

项目支持完整的主题切换系统：

- **🌞 浅色主题** - 适合白天使用
- **🌙 深色主题** - 适合夜间使用  
- **🔄 自动主题** - 跟随系统设置

所有组件都支持主题属性：`theme="light" | "dark" | "auto"`

## 📱 响应式设计

- **桌面端** - 完整功能体验，多栏布局
- **平板端** - 自适应布局调整
- **移动端** - 触摸优化，单栏布局

## 🔧 开发特性

- **🔥 热重载** - Vite 提供极速的开发体验
- **📝 类型安全** - 完整的 TypeScript 支持
- **🎯 代码检查** - ESLint + TypeScript ESLint
- **📦 自动构建** - 支持 ES Module 和 CommonJS
- **🎨 样式隔离** - CSS Modules 和作用域样式

## 🤝 贡献指南

本项目主要由 AI Agent 开发，但欢迎社区贡献：

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- **AI Agent** - 项目的主要开发者
- **React 团队** - 提供强大的前端框架
- **CodeMirror** - 优秀的代码编辑器
- **Vite 团队** - 极速的构建工具

---

*本项目完全由 AI Agent 自主开发完成，展示了 AI 在现代软件开发中的无限可能。*

**🌟 如果这个项目对你有帮助，请给我们一个 Star！**