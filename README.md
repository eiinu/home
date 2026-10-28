# Home

Eiinu 的个人导航主页与浏览器工具集。

**[home.eiinu.me](https://home.eiinu.me/)** · [导航主页](https://home.eiinu.me/#home) · [我的工具](https://home.eiinu.me/#tools)

## 导航与收藏

- Google、Bing、百度搜索，支持输入网址直接访问；`⌘ K` / `Ctrl K` 聚焦搜索框。
- 常用网站快捷入口，以及工作、阅读、生活分类。
- 添加、编辑、删除收藏，设置分类和是否显示在常用网站中。
- 图标支持内置网站图标、名称首字、HTTPS 图片地址和图片上传。上传格式为 PNG、JPEG、WebP，大小不超过 128 KB。
- JSON 备份导入、导出；浅色、深色主题与移动端布局。

收藏保存在当前浏览器的 `localStorage` 中，不依赖账号、数据库或后端。不同浏览器、设备和站点地址之间的数据不互通，清理站点数据也会删除收藏，请定期使用「导出备份」。

导入备份会合并收藏：相同 ID 使用备份中的版本，其余本地收藏保留。备份文件不超过 2 MB，上传的图标图片也会包含在 JSON 中。外部图片链接仍依赖原站可用性。

默认网站和分类在 [apps/web/src/bookmarks.ts](apps/web/src/bookmarks.ts) 中维护。修改默认值不会覆盖浏览器中已有的收藏；本机调整也不会自动提交到 Git。

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

目前组件库仍有既有的 ESLint、类型诊断，以及 XML 格式化往返时的文本空白问题。构建完成不代表这些检查全部通过；各子包尚未配置自动化测试脚本。

## 项目结构

```text
apps/web/             导航主页、收藏管理、工具工作区
  public/icons/       内置网站图标
  src/bookmarks.ts    默认收藏、数据校验
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
