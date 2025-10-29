# 🧠 WebMind - AI 智能笔记与思维导图助手

WebMind 是一个基于 Chrome 浏览器的 AI 驱动的笔记和思维导图扩展，使用 **Gemini Nano（Chrome Built-in AI）** 技术，让你可以在浏览网页时轻松捕捉知识并自动生成可视化的思维导图。

## ✨ 核心特性

- 🎯 **智能文本摘要**：选中任何网页文本，使用 AI 自动生成摘要
- 📝 **本地笔记存储**：所有数据保存在本地，完全隐私安全
- 🗺️ **智能思维导图**：自动分析笔记关联性，生成交互式知识图谱
- 🚀 **零延迟**：使用 Chrome 内置 AI，无需联网即可工作
- 💎 **现代化 UI**：精美的设计，流畅的交互体验
- 🔒 **隐私友好**：不依赖外部服务器，所有处理在本地完成

## 🏗️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 5
- **状态管理**：Zustand
- **数据可视化**：D3.js
- **AI 引擎**：Chrome Built-in AI (Gemini Nano)
- **存储方案**：Chrome Storage API
- **扩展标准**：Manifest V3

## 📁 项目结构

```
WebMind/
├── src/
│   ├── background/           # Background Service Worker
│   │   ├── service-worker.ts # 消息处理和 AI 调用
│   │   ├── offscreen.html    # Offscreen document
│   │   └── offscreen.ts      # AI API 调用（页面上下文）
│   ├── content/              # Content Scripts
│   │   ├── content.ts        # 文本选择监听
│   │   └── content.css       # 浮动按钮样式
│   ├── popup/                # Popup 界面
│   │   ├── Popup.tsx         # Popup 组件
│   │   ├── index.tsx         # 入口文件
│   │   ├── index.html        # HTML 模板
│   │   └── popup.css         # 样式
│   ├── sidepanel/            # 侧边栏
│   │   ├── SidePanel.tsx     # 侧边栏主组件
│   │   ├── MindMap.tsx       # 思维导图组件
│   │   ├── index.tsx         # 入口文件
│   │   ├── index.html        # HTML 模板
│   │   └── sidepanel.css     # 样式
│   └── shared/               # 共享模块
│       ├── types.ts          # TypeScript 类型定义
│       ├── store.ts          # Zustand 状态管理
│       └── utils/
│           ├── storage.ts    # 存储工具函数
│           └── ai.ts         # AI 工具函数
├── public/
│   └── icons/                # 扩展图标
├── manifest.json             # Chrome 扩展清单
├── package.json              # 依赖配置
├── tsconfig.json             # TypeScript 配置
├── vite.config.ts            # Vite 构建配置
└── README.md                 # 项目文档
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18
- Chrome >= 120（需支持 Chrome Built-in AI）
- 启用 Chrome 实验性功能

### 启用 Chrome Built-in AI

1. 在 Chrome 地址栏输入 `chrome://flags`
2. 搜索并启用以下功能：
   - `Summarization API for Gemini Nano`
   - `Prompt API for Gemini Nano`
3. 重启浏览器

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 加载扩展

1. 打开 Chrome，访问 `chrome://extensions/`
2. 开启右上角的「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择项目的 `dist` 目录

## 📖 使用指南

### 创建笔记

1. 在任何网页上选中你感兴趣的文本
2. 点击弹出的「用 AI 总结」按钮
3. AI 会自动生成摘要并保存为笔记

### 查看笔记

- 点击扩展图标查看最近的笔记
- 点击「查看所有笔记与思维导图」打开侧边栏
- 在侧边栏中可以搜索、浏览和管理所有笔记

### 生成思维导图

1. 创建多条笔记后，在侧边栏切换到「思维导图」标签
2. 系统会自动分析笔记内容，提取关键词
3. 生成交互式的知识图谱，展示主题之间的关联
4. 可以拖动节点、缩放视图进行探索

### 导出笔记

- 在侧边栏点击右上角的导出按钮
- 所有笔记会以 JSON 格式下载到本地

## 🔧 核心功能实现

### 消息传递机制

```typescript
// Content Script → Background
chrome.runtime.sendMessage({
  type: MessageType.SUMMARIZE_TEXT,
  payload: { text, url, title }
});

// Background → Offscreen Document
chrome.runtime.sendMessage({
  type: 'AI_SUMMARIZE',
  payload: { text }
});
```

### AI 摘要调用

```typescript
// 在 Offscreen Document 中调用 AI
const summarizer = await window.ai.summarizer.create({
  type: 'tl;dr',
  format: 'plain-text',
  length: 'medium',
});

const summary = await summarizer.summarize(text);
summarizer.destroy();
```

### 本地存储

```typescript
// 保存笔记
await chrome.storage.local.set({ 
  webmind_notes: notes 
});

// 读取笔记
const result = await chrome.storage.local.get('webmind_notes');
const notes = result.webmind_notes || [];
```

### 思维导图生成

使用 D3.js 力导向图算法：
- 从笔记中提取关键词作为节点
- 分析关键词共现关系生成边
- 使用力导向布局自动排列
- 支持拖拽和缩放交互

## 🎨 UI 设计理念

- **渐变色主题**：紫色渐变传达智能和创新
- **卡片式布局**：清晰的信息层次
- **流畅动画**：提升用户体验
- **响应式设计**：适配不同尺寸的侧边栏

## 🔐 隐私与安全

- ✅ 所有数据存储在本地
- ✅ 不发送任何数据到外部服务器
- ✅ 使用 Chrome 内置 AI，无需 API key
- ✅ 符合 Manifest V3 安全标准
- ✅ 最小化权限请求

## 🐛 已知限制

- Chrome Built-in AI 目前处于实验阶段，需要启用实验性功能
- Gemini Nano 模型可能需要下载（首次使用）
- 不同 Chrome 版本对 AI 功能的支持程度可能不同
- 思维导图生成效果取决于笔记数量和内容相关性

## 🛣️ 未来规划

- [ ] 支持标签分类和过滤
- [ ] 增加笔记编辑功能
- [ ] 支持导入/导出 Markdown
- [ ] 添加搜索高亮显示
- [ ] 思维导图主题定制
- [ ] 支持更多 AI 功能（翻译、问答等）
- [ ] 多设备同步（可选）

## 📝 开发命令

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 类型检查
npm run type-check

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

- Chrome Built-in AI Team
- React 和 Vite 社区
- D3.js 可视化库
- 所有贡献者

---

**由 ❤️ 和 ☕ 驱动** | Made with React + TypeScript + Gemini Nano

