# Home

Eiinu 的个人导航主页与浏览器工具集。

**[home.eiinu.me](https://home.eiinu.me/)** · [导航主页](https://home.eiinu.me/#home) · [我的工具](https://home.eiinu.me/#tools)

## 导航与收藏

- Google、Bing、百度搜索，支持输入网址直接访问；`⌘ K` / `Ctrl K` 聚焦搜索框。
- 常用网站快捷入口，以及工作、阅读、生活分类。
- 手机和平板优先通过系统 App 链接打开；Android Chromium 浏览器对已配置网站使用带网页回退的 Intent，桌面端通常在新标签页打开，ChatGPT、Notion 首页优先尝试桌面 App。
- 直接浏览常用网站和分类链接；页面不提供收藏的添加、编辑或删除入口。
- 网站保留站点图标，界面控件和工具导航使用线性 SVG 图标。
- 浅色、深色主题与移动端布局。

导航内容在 [apps/web/src/bookmarks.ts](apps/web/src/bookmarks.ts) 中维护，页面不提供收藏编辑或备份功能，也不依赖账号、数据库或后端。

为保留旧版本中已有的个人收藏，仍兼容读取当前浏览器的 `localStorage`；已下线的站点会从旧收藏中一并过滤。不同浏览器和设备的数据不互通，清理站点数据后将恢复代码中的默认导航。旧版本中保存的自定义图标仍可展示。

## 我的工具

| 分类   | 工具                                           |
| ------ | ---------------------------------------------- |
| 开发   | JSON、HTML、XML、Base64、正则表达式、Cron、SSE |
| 系统   | 键盘监听、剪贴板读写                           |
| 创意   | CSS 边框编辑、颜色转换、调色板、渐变生成       |
| 编辑器 | Markdown-it 预览与 Tokens、RemarkJS 预览与 AST |

工具在浏览器中处理输入内容，无需上传至应用后端。剪贴板功能需要安全上下文（HTTPS 或 localhost）及浏览器授权。

## 本地开发

使用 Node.js 22.12+（已在 Node.js 24 上验证）和 pnpm 10。Vite 7 的实际 Node.js 要求高于根目录 `engines` 中保留的最低声明。

```bash
git clone https://github.com/eiinu/home.git
cd home
pnpm install --frozen-lockfile
pnpm build
pnpm dev
```

首次启动前需要构建工作区组件包，主应用会引用它们的 `dist` 产物。修改组件包后重新构建对应包；修改主应用时由 Vite 提供热更新。

常用命令：

```bash
# 构建全部组件包和主应用
pnpm build

# 启动主应用
pnpm dev

# 检查主应用
pnpm --filter web lint

# 检查全部工作区包
pnpm lint

# 本地预览主应用的生产构建
pnpm --filter web preview
```

目前组件库仍有既有的 ESLint、类型诊断，以及 XML 格式化往返时的文本空白问题。构建完成不代表这些检查全部通过；可通过 `pnpm --filter web test:links` 运行移动端链接策略测试；其余工具尚未配置自动化测试脚本。

## 项目结构

```text
apps/web/             导航主页、收藏展示、工具工作区
  src/bookmarks.ts    默认导航内容、数据校验
  public/icons/       内置网站图标
  src/components/    工具导航与统一视觉样式
packages/tools/       开发工具与通用组件
packages/creative/    颜色、边框等创意工具
packages/editor/      Markdown 编辑与预览
packages/games/       游戏组件包，当前未在界面开放
AGENTS.md             界面设计及提交约定
```

技术栈为 React 19、TypeScript、Vite 7、CodeMirror 6 和 pnpm workspace。工作区组件包供本仓库使用，未作为公开 npm 包发布。

## 部署

当前站点通过 Vercel 关联 GitHub 仓库，推送 `main` 后自动部署。

新建部署时可使用以下配置：

| 配置项           | 值                               |
| ---------------- | -------------------------------- |
| Root Directory   | 仓库根目录                       |
| Install Command  | `pnpm install --frozen-lockfile` |
| Build Command    | `pnpm build`                     |
| Output Directory | `apps/web/dist`                  |
| Node.js          | 24.x                             |

应用是静态站点，无需配置账号服务、数据库或应用环境变量。`#home`、`#tools` 使用哈希导航，无需额外配置路由重写。

## 协作

界面改动遵循 [AGENTS.md](AGENTS.md)：避免不必要的次要标签和描述，让布局本身传达信息。

本项目由 Codex 协助完成的后续提交使用 `Eiinu <eiinu@qq.com>` 作为主要作者，并在提交说明末尾添加：

```text
Co-authored-by: Codex <codex@openai.com>
```

## 移动端 App 跳转

网站链接通过用户直接点击触发，不自动唤起 App。Android Chrome 等 Chromium 浏览器为 GitHub、ChatGPT、Notion、Bilibili、YouTube、Gmail、知乎和 Google 翻译提供定向 Intent，并将原网页地址作为 `browser_fallback_url`。不支持 Intent 的浏览器和内置 WebView 使用当前页 HTTPS 链接。

iPhone/iPad 使用原网页的 HTTPS Universal Links，由系统及 App 的域名关联决定是否打开 App。未安装 App 或链接路径不受支持时继续打开网页；部分站点首页没有 App 关联，因此不能保证所有链接都能唤起 App。除 ChatGPT、Notion 桌面首页入口外，桌面端、修饰键点击和中键点击保留网页打开方式。

参考：[Android Chrome Intents](https://developer.chrome.com/docs/android/intents)、各站点的 `/.well-known/assetlinks.json` 与 `/.well-known/apple-app-site-association`。单元测试和浏览器设备模拟不等同于真机唤起验证，实际行为还受浏览器、系统设置及 App 版本影响。

### 桌面 App

macOS、Windows 下，ChatGPT 和 Notion 的首页快捷入口分别尝试 `chatgpt://`、`notion://www.notion.so/`。其他站点及包含具体路径、参数的收藏保持网页方式，避免丢失目的页面。

普通点击尝试唤起 App；若页面持续处于前台，约 1.8 秒后回退至当前标签页的原网页。若浏览器弹出协议确认框或 App 接管焦点，则停止自动回退，可通过提示中的“打开网页版”手动打开网页。浏览器无法可靠判断 App 是否安装，协议支持和确认提示仍需在安装对应客户端的电脑上验证。Ctrl/⌘、Shift、Alt 及中键点击不尝试桌面 App。
