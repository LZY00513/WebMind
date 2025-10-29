# 📂 WebMind 项目文件结构

```
Chrome Challenge/
│
├── 📄 manifest.json                 # Chrome 扩展配置清单（Manifest V3）
├── 📄 package.json                  # NPM 依赖和脚本配置
├── 📄 tsconfig.json                 # TypeScript 编译配置
├── 📄 tsconfig.node.json            # Node 环境的 TypeScript 配置
├── 📄 vite.config.ts                # Vite 构建工具配置
├── 📄 .gitignore                    # Git 忽略文件配置
│
├── 📖 README.md                     # 项目主文档
├── 📖 SETUP.md                      # 详细安装配置指南
├── 📖 ARCHITECTURE.md               # 系统架构设计文档
├── 📖 PROJECT_STRUCTURE.md          # 本文件：项目结构说明
│
├── 📁 public/                       # 公共资源文件夹
│   └── 📁 icons/                    # 扩展图标目录
│       ├── 📄 README.md             # 图标使用说明
│       ├── 🖼️ icon16.png            # 16x16 工具栏图标（需添加）
│       ├── 🖼️ icon48.png            # 48x48 管理页图标（需添加）
│       └── 🖼️ icon128.png           # 128x128 商店图标（需添加）
│
├── 📁 src/                          # 源代码目录
│   │
│   ├── 📁 background/               # 后台服务（Service Worker）
│   │   ├── 📄 service-worker.ts     # 主后台脚本，消息路由和逻辑处理
│   │   ├── 📄 offscreen.html        # 离屏文档 HTML（用于调用 AI API）
│   │   └── 📄 offscreen.ts          # 离屏文档脚本（AI API 调用实现）
│   │
│   ├── 📁 content/                  # 内容脚本（注入到网页）
│   │   ├── 📄 content.ts            # 文本选择监听和浮动按钮逻辑
│   │   └── 📄 content.css           # 浮动按钮样式
│   │
│   ├── 📁 popup/                    # 弹出窗口（点击扩展图标）
│   │   ├── 📄 index.html            # Popup HTML 模板
│   │   ├── 📄 index.tsx             # React 入口文件
│   │   ├── 📄 Popup.tsx             # Popup 主组件（显示笔记和状态）
│   │   └── 📄 popup.css             # Popup 样式（渐变主题）
│   │
│   ├── 📁 sidepanel/                # 侧边栏面板
│   │   ├── 📄 index.html            # SidePanel HTML 模板
│   │   ├── 📄 index.tsx             # React 入口文件
│   │   ├── 📄 SidePanel.tsx         # 侧边栏主组件（笔记列表和切换）
│   │   ├── 📄 MindMap.tsx           # 思维导图组件（D3.js 可视化）
│   │   └── 📄 sidepanel.css         # 侧边栏样式
│   │
│   └── 📁 shared/                   # 共享模块（所有组件共用）
│       ├── 📄 types.ts              # TypeScript 类型定义
│       ├── 📄 store.ts              # Zustand 状态管理 Store
│       └── 📁 utils/                # 工具函数
│           ├── 📄 storage.ts        # 本地存储工具（CRUD 操作）
│           └── 📄 ai.ts             # AI 功能工具（摘要和关键词提取）
│
└── 📁 dist/                         # 构建输出目录（运行 npm run build 后生成）
    ├── 📄 manifest.json             # 复制的清单文件
    ├── 📁 background/               # 打包后的后台脚本
    ├── 📁 content/                  # 打包后的内容脚本
    ├── 📁 assets/                   # 打包后的资源文件
    ├── 📁 src/                      # HTML 和 React 组件
    └── 📁 icons/                    # 图标文件
```

## 📊 文件功能详解

### 核心配置文件

| 文件 | 作用 | 关键配置 |
|------|------|----------|
| `manifest.json` | Chrome 扩展配置 | permissions, background, content_scripts, side_panel |
| `package.json` | NPM 依赖管理 | react, d3, zustand, typescript, vite |
| `vite.config.ts` | 构建配置 | 多入口打包，输出路径映射 |
| `tsconfig.json` | TypeScript 配置 | 严格模式，React JSX 支持 |

### 源代码模块

#### 🔧 Background（后台）
- **service-worker.ts**: 消息中心，协调各组件通信
- **offscreen.ts**: 在页面上下文调用 Chrome Built-in AI

#### 📝 Content（内容脚本）
- **content.ts**: 监听文本选择，显示 AI 摘要按钮
- **content.css**: 浮动按钮和通知样式

#### 🎨 Popup（弹出窗口）
- **Popup.tsx**: 快速查看最近笔记和 AI 状态
- **popup.css**: 紫色渐变主题样式

#### 📊 SidePanel（侧边栏）
- **SidePanel.tsx**: 笔记管理主界面
- **MindMap.tsx**: D3.js 力导向图可视化
- **sidepanel.css**: 现代化 UI 样式

#### 🔗 Shared（共享）
- **types.ts**: 全局类型定义（Note, Message, AI 接口）
- **store.ts**: Zustand 状态管理（笔记 CRUD）
- **utils/storage.ts**: Chrome Storage API 封装
- **utils/ai.ts**: AI 功能封装（摘要、关键词提取）

## 📦 构建产物（dist 目录）

运行 `npm run build` 后生成：

```
dist/
├── manifest.json                    # 清单文件
├── background/
│   ├── service-worker.js            # 打包后的 Service Worker
│   ├── offscreen.js                 # 打包后的 Offscreen 脚本
│   └── offscreen.html               # Offscreen 页面
├── content/
│   ├── content.js                   # 打包后的 Content Script
│   └── content.css                  # Content Script 样式
├── src/
│   ├── popup/
│   │   └── index.html               # Popup 页面（包含打包后的 JS/CSS）
│   └── sidepanel/
│       └── index.html               # SidePanel 页面
├── assets/
│   ├── popup-[hash].js              # Popup React 代码
│   ├── sidepanel-[hash].js          # SidePanel React 代码
│   ├── [name]-[hash].css            # 样式文件
│   └── ...                          # 其他资源
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🔄 数据流向

```
网页文本选择
    ↓
content.ts (捕获)
    ↓
service-worker.ts (处理)
    ↓
offscreen.ts (调用 AI)
    ↓
window.ai.summarizer (生成摘要)
    ↓
storage.ts (保存笔记)
    ↓
store.ts (更新状态)
    ↓
Popup/SidePanel (显示)
```

## 📏 代码规模

| 模块 | 文件数 | 代码行数（估算） |
|------|--------|------------------|
| Background | 3 | ~350 行 |
| Content | 2 | ~250 行 |
| Popup | 3 | ~300 行 |
| SidePanel | 3 | ~800 行 |
| Shared | 4 | ~400 行 |
| 配置 | 4 | ~150 行 |
| **总计** | **19** | **~2250 行** |

## 🎯 关键依赖

### 生产依赖
- `react` ^18.2.0 - UI 框架
- `react-dom` ^18.2.0 - React DOM 渲染
- `d3` ^7.8.5 - 思维导图可视化
- `zustand` ^4.4.7 - 轻量级状态管理

### 开发依赖
- `typescript` ^5.3.3 - 类型安全
- `vite` ^5.0.8 - 快速构建工具
- `@vitejs/plugin-react` ^4.2.1 - React 插件
- `@types/chrome` ^0.0.254 - Chrome API 类型

## 🚀 开发工作流

```bash
# 1. 安装依赖
npm install

# 2. 开发模式（自动重新构建）
npm run dev

# 3. 在 chrome://extensions/ 加载 dist 目录

# 4. 修改代码后，手动刷新扩展

# 5. 生产构建
npm run build
```

## 📝 命名约定

- **文件名**: PascalCase（组件），kebab-case（配置）
- **组件**: PascalCase（`Popup.tsx`, `MindMap.tsx`）
- **工具**: camelCase（`storage.ts`, `ai.ts`）
- **类型**: PascalCase（`Note`, `MessageType`）
- **常量**: UPPER_SNAKE_CASE（`STORAGE_KEY`）

## 🔍 查找代码

| 需求 | 查找位置 |
|------|----------|
| 修改浮动按钮样式 | `src/content/content.css` |
| 调整 AI 参数 | `src/background/offscreen.ts` |
| 修改笔记卡片布局 | `src/sidepanel/SidePanel.tsx` |
| 调整思维导图算法 | `src/sidepanel/MindMap.tsx` |
| 添加新的存储字段 | `src/shared/types.ts` + `src/shared/utils/storage.ts` |
| 修改主题颜色 | `*.css` 文件（搜索 `#667eea` 和 `#764ba2`） |

---

**提示**: 使用 VS Code 的「Go to Symbol」（Cmd/Ctrl + Shift + O）快速定位函数和组件

