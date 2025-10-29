# 🏗️ WebMind 架构设计文档

## 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser UI                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │    Popup     │  │  Side Panel  │  │ Content Script  │   │
│  │   (React)    │  │   (React)    │  │ (Text Selection)│   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘   │
│         │                  │                    │            │
│         └──────────────────┼────────────────────┘            │
│                            │                                 │
│              ┌─────────────▼──────────────┐                 │
│              │  Background Service Worker │                 │
│              │  (Message Router & Logic)  │                 │
│              └─────────────┬──────────────┘                 │
│                            │                                 │
│              ┌─────────────▼──────────────┐                 │
│              │   Offscreen Document       │                 │
│              │   (AI API Caller)          │                 │
│              └─────────────┬──────────────┘                 │
│                            │                                 │
│              ┌─────────────▼──────────────┐                 │
│              │  Chrome Built-in AI        │                 │
│              │  (Gemini Nano)             │                 │
│              └────────────────────────────┘                 │
│                            │                                 │
│              ┌─────────────▼──────────────┐                 │
│              │   chrome.storage.local     │                 │
│              │   (Notes Database)         │                 │
│              └────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## 核心模块详解

### 1. Content Script（内容脚本）

**文件**: `src/content/content.ts`

**职责**:
- 监听用户的文本选择行为
- 显示/隐藏浮动的「用 AI 总结」按钮
- 收集上下文信息（URL、标题、选中文本）
- 向 Background 发送摘要请求
- 显示操作反馈（成功/失败通知）

**关键技术**:
```typescript
// 监听文本选择
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('selectionchange', handleSelectionChange);

// 获取选中文本
const selection = window.getSelection();
const selectedText = selection?.toString().trim();

// 发送消息到 Background
chrome.runtime.sendMessage({
  type: MessageType.SUMMARIZE_TEXT,
  payload: { text, url, title }
});
```

**注意事项**:
- 需要避免在特殊页面（chrome://、about: 等）注入
- 按钮定位需要考虑页面滚动和视窗边界
- 避免与页面原有的选择监听器冲突

---

### 2. Background Service Worker（后台服务）

**文件**: `src/background/service-worker.ts`

**职责**:
- 作为消息路由中心，处理各组件的通信
- 协调 AI 调用流程
- 管理笔记的 CRUD 操作
- 处理扩展安装和更新事件
- 管理 Offscreen Document 的生命周期

**消息处理流程**:
```typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case MessageType.SUMMARIZE_TEXT:
      // 1. 接收文本和上下文
      // 2. 创建/获取 Offscreen Document
      // 3. 转发 AI 请求
      // 4. 保存生成的笔记
      // 5. 返回结果
      
    case MessageType.GET_NOTES:
      // 从 storage 读取所有笔记
      
    case MessageType.DELETE_NOTE:
      // 删除指定笔记
      
    case MessageType.OPEN_SIDEPANEL:
      // 打开侧边栏
  }
});
```

**设计要点**:
- Service Worker 是无状态的，可能随时被销毁
- 长时间运行的任务需要使用 Promise 保持活跃
- 不能直接访问 DOM，因此需要 Offscreen Document

---

### 3. Offscreen Document（离屏文档）

**文件**: `src/background/offscreen.html`, `src/background/offscreen.ts`

**为什么需要？**
Chrome Built-in AI API 只能在页面上下文（有 DOM 的环境）中调用，而 Service Worker 没有 DOM 环境。因此需要创建一个不可见的页面来调用 AI API。

**工作流程**:
```typescript
// 1. Background 创建 Offscreen Document
await chrome.offscreen.createDocument({
  url: 'offscreen.html',
  reasons: ['DOM_SCRAPING'],
  justification: '使用 Chrome Built-in AI 生成摘要'
});

// 2. 发送消息给 Offscreen
chrome.runtime.sendMessage({ 
  type: 'AI_SUMMARIZE', 
  payload: { text } 
});

// 3. Offscreen 中调用 AI API
const summarizer = await window.ai.summarizer.create({
  type: 'tl;dr',
  format: 'plain-text',
  length: 'medium'
});

const summary = await summarizer.summarize(text);
```

**优化策略**:
- 复用已创建的 Offscreen Document
- 及时销毁不再使用的 Document
- 处理 AI 模型下载状态

---

### 4. Popup（弹出窗口）

**文件**: `src/popup/Popup.tsx`

**功能**:
- 显示扩展状态（AI 可用性）
- 展示最近的 3 条笔记
- 提供快速访问侧边栏的入口
- 显示使用提示

**技术栈**:
- React 18
- Zustand（状态管理）
- 纯 CSS（渐变样式）

**性能优化**:
- 只加载必要的笔记（最近 3 条）
- 使用 React.memo 避免不必要的重渲染
- 小体积，快速加载

---

### 5. Side Panel（侧边栏）

**文件**: `src/sidepanel/SidePanel.tsx`

**核心功能**:
1. **笔记列表视图**
   - 网格布局展示所有笔记
   - 搜索过滤功能
   - 笔记详情弹窗
   - 删除操作

2. **思维导图视图**
   - D3.js 力导向图
   - 节点拖拽
   - 缩放平移
   - 关键词连接可视化

**状态管理**:
```typescript
// 使用 Zustand 集中管理状态
const useStore = create<AppState>((set) => ({
  notes: [],
  loading: false,
  loadNotes: async () => { /* ... */ },
  addNote: async (note) => { /* ... */ },
  removeNote: async (id) => { /* ... */ }
}));
```

---

### 6. Mind Map（思维导图）

**文件**: `src/sidepanel/MindMap.tsx`

**算法流程**:

1. **数据准备**
   ```typescript
   // 从笔记中提取关键词
   notes.forEach(note => {
     const keywords = extractKeywords(note.summary);
     // 每个关键词成为一个节点
   });
   ```

2. **构建图数据**
   ```typescript
   // 节点：关键词
   // 边：共同出现在同一笔记中的关键词
   if (keyword1 和 keyword2 在同一笔记中) {
     links.push({ source: keyword1, target: keyword2 });
   }
   ```

3. **力导向布局**
   ```typescript
   const simulation = d3.forceSimulation(nodes)
     .force('link', d3.forceLink(links).distance(150))
     .force('charge', d3.forceManyBody().strength(-500))
     .force('center', d3.forceCenter(width/2, height/2))
     .force('collision', d3.forceCollide().radius(60));
   ```

4. **交互功能**
   - 拖拽节点
   - 鼠标滚轮缩放
   - 平移画布

**优化方向**:
- 限制节点数量（避免性能问题）
- 使用 Canvas 渲染大规模图（替代 SVG）
- 实现虚拟滚动
- 增加节点聚类

---

## 数据流设计

### 创建笔记流程

```
用户选中文本
    ↓
Content Script 捕获
    ↓
发送消息 → Background Service Worker
    ↓
创建/获取 Offscreen Document
    ↓
Offscreen 调用 AI API
    ↓
生成摘要
    ↓
Background 保存到 Storage
    ↓
通知 Content Script 完成
    ↓
显示成功提示
```

### 查看笔记流程

```
用户打开 Popup/SidePanel
    ↓
React 组件 mount
    ↓
useEffect 触发 loadNotes()
    ↓
发送 GET_NOTES 消息
    ↓
Background 从 Storage 读取
    ↓
返回笔记数据
    ↓
更新 Zustand Store
    ↓
React 重新渲染
```

### 生成思维导图流程

```
用户切换到思维导图标签
    ↓
传入 notes 数组到 MindMap 组件
    ↓
extractKeywords() 提取关键词
    ↓
构建图数据 { nodes, links }
    ↓
D3.js 初始化 simulation
    ↓
力导向算法计算节点位置
    ↓
SVG 渲染节点和连线
    ↓
绑定交互事件（drag, zoom）
```

---

## 存储设计

### 数据模型

```typescript
interface Note {
  id: string;              // 唯一标识
  content: string;         // 原始选中文本
  summary: string;         // AI 生成的摘要
  url: string;             // 来源页面 URL
  title: string;           // 来源页面标题
  timestamp: number;       // 创建时间戳
  tags?: string[];         // 标签（未来功能）
}
```

### 存储方案

使用 `chrome.storage.local`：
- 容量：无限制（相比 `sync` 的 100KB）
- 速度：快速
- 同步：不跨设备（保护隐私）

```typescript
// 保存
await chrome.storage.local.set({ 
  webmind_notes: notes 
});

// 读取
const result = await chrome.storage.local.get('webmind_notes');

// 监听变化
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.webmind_notes) {
    // 更新 UI
  }
});
```

### 未来扩展

- 支持 IndexedDB（更大容量、更复杂查询）
- 导出/导入功能（JSON、Markdown）
- 可选的云同步（需用户授权）

---

## 安全与隐私

### 权限最小化

只请求必需的权限：
```json
{
  "permissions": [
    "storage",      // 本地存储笔记
    "sidePanel",    // 显示侧边栏
    "activeTab",    // 获取当前标签页 URL
    "offscreen"     // 创建离屏文档调用 AI
  ]
}
```

### 数据隐私

- ✅ 所有数据保存在本地
- ✅ 不发送任何数据到外部服务器
- ✅ AI 处理完全在设备上进行
- ✅ 不收集用户行为数据
- ✅ 不使用第三方分析工具

### 内容安全策略（CSP）

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

---

## 性能优化

### 1. 代码分割

Vite 自动进行代码分割：
- Popup 独立打包（小体积）
- SidePanel 独立打包（按需加载）
- 共享代码提取到 chunks

### 2. 懒加载

```typescript
// 延迟加载 D3.js（仅在思维导图视图时）
const MindMap = lazy(() => import('./MindMap'));

// 使用 Suspense
<Suspense fallback={<Loading />}>
  <MindMap notes={notes} />
</Suspense>
```

### 3. 虚拟化列表

对于大量笔记，使用虚拟滚动：
```typescript
import { FixedSizeList } from 'react-window';
```

### 4. 防抖和节流

```typescript
// 搜索输入防抖
const debouncedSearch = useMemo(
  () => debounce(setSearchQuery, 300),
  []
);
```

---

## 测试策略

### 单元测试

```bash
# 使用 Vitest
npm install -D vitest @testing-library/react

# 测试工具函数
describe('extractKeywords', () => {
  it('应该提取前5个高频词', () => {
    const text = '...';
    const keywords = extractKeywords(text);
    expect(keywords).toHaveLength(5);
  });
});
```

### 集成测试

```typescript
// 测试消息传递
chrome.runtime.sendMessage = jest.fn((msg, cb) => {
  cb({ success: true });
});
```

### E2E 测试

使用 Puppeteer + Chrome Extension Testing Library

---

## 部署与发布

### 构建检查清单

- [ ] 运行 `npm run build`
- [ ] 检查 `dist` 目录大小（< 5MB）
- [ ] 确认所有图标文件存在
- [ ] 测试所有核心功能
- [ ] 检查 Console 无错误
- [ ] 验证隐私政策合规

### 发布到 Chrome Web Store

1. 创建开发者账号（$5 一次性费用）
2. 准备宣传材料：
   - 截图（1280×800 或 640×400）
   - 图标（128×128）
   - 宣传图（440×280）
   - 简短描述（132 字符）
   - 详细描述（支持 Markdown）
3. 上传 ZIP 包
4. 填写隐私政策
5. 提交审核（通常 1-3 天）

---

## 路线图

### v1.0（当前）
- ✅ 基础摘要功能
- ✅ 笔记管理
- ✅ 思维导图可视化

### v1.1
- [ ] 标签系统
- [ ] 高级搜索（全文、标签、日期）
- [ ] Markdown 导出

### v1.2
- [ ] 笔记编辑
- [ ] 手动连接思维导图节点
- [ ] 主题定制

### v2.0
- [ ] 多语言支持
- [ ] 协作功能（可选）
- [ ] 插件系统

---

## 贡献指南

查看主 README.md 中的贡献部分。

---

**文档版本**: 1.0  
**最后更新**: 2024-10-21

