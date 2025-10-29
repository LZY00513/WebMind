# 🚀 WebMind 安装与配置指南

## 第一步：启用 Chrome Built-in AI

WebMind 需要使用 Chrome 的实验性 AI 功能。请按照以下步骤启用：

### 1. 检查 Chrome 版本

确保你的 Chrome 版本 >= 120。访问 `chrome://version` 查看当前版本。

### 2. 启用实验性功能

1. 在地址栏输入：`chrome://flags`
2. 搜索并启用以下功能：

#### 必需的功能标志：

- **Prompt API for Gemini Nano**
  - 标志名：`#prompt-api-for-gemini-nano`
  - 设置为：`Enabled`

- **Summarization API for Gemini Nano**
  - 标志名：`#summarization-api-for-gemini-nano`
  - 设置为：`Enabled`

- **Enables optimization guide on device**
  - 标志名：`#optimization-guide-on-device-model`
  - 设置为：`Enabled BypassPerfRequirement`

3. 点击右下角的 **Relaunch** 按钮重启浏览器

### 3. 下载 AI 模型

首次使用时，Chrome 需要下载 Gemini Nano 模型（约 1.5GB）：

1. 打开开发者工具（F12）
2. 在 Console 中输入：
```javascript
await ai.languageModel.create();
```

3. 如果返回错误说明模型未下载，请等待几分钟后重试
4. 模型下载完成后，会自动保存在本地

## 第二步：安装项目依赖

```bash
# 进入项目目录
cd "Chrome Challenge"

# 安装依赖
npm install
```

## 第三步：构建扩展

### 开发模式（推荐）

```bash
npm run dev
```

这会启动 watch 模式，文件修改会自动重新构建。

### 生产模式

```bash
npm run build
```

构建完成后，所有文件会输出到 `dist` 目录。

## 第四步：加载扩展到 Chrome

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 打开右上角的 **开发者模式** 开关
4. 点击 **加载已解压的扩展程序**
5. 选择项目的 `dist` 目录

## 第五步：添加扩展图标

在首次加载扩展前，需要添加图标文件：

1. 在 `public/icons/` 目录下放置以下图标：
   - `icon16.png`（16×16 像素）
   - `icon48.png`（48×48 像素）
   - `icon128.png`（128×128 像素）

2. 如果暂时没有图标，可以使用任何 PNG 图片作为占位符

## 🧪 验证安装

### 1. 检查 AI 功能是否可用

打开扩展的 Popup（点击工具栏图标），查看 AI 状态：
- ✅ 绿色「✓ 可用」- 一切正常
- ⬇️ 黄色「⬇ 下载中」- 正在下载模型
- ❌ 红色「✗ 不可用」- 需要重新配置

### 2. 测试文本摘要功能

1. 访问任意网页（如维基百科）
2. 选中一段文本（至少 10 个字符）
3. 应该会看到「用 AI 总结」按钮弹出
4. 点击按钮，等待摘要生成

### 3. 查看思维导图

1. 创建 3-5 条笔记
2. 点击扩展图标
3. 点击「查看所有笔记与思维导图」
4. 切换到「思维导图」标签
5. 应该能看到自动生成的知识图谱

## ⚠️ 常见问题

### Q: AI 状态显示「不可用」

**A:** 请确保：
1. Chrome 版本 >= 120
2. 已启用所有必需的实验性功能
3. 已重启浏览器
4. 尝试在开发者工具中手动触发模型下载

### Q: 选中文本后没有弹出按钮

**A:** 请检查：
1. 选中的文本长度是否 > 10 个字符
2. 打开开发者工具查看 Console 是否有错误
3. 确认 content script 已正确注入（在扩展管理页面查看）

### Q: 构建失败

**A:** 尝试：
```bash
# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 清理缓存
npm cache clean --force
```

### Q: 侧边栏无法打开

**A:** 
1. 确认 Chrome 支持 Side Panel API（Chrome >= 114）
2. 检查 manifest.json 中的 `sidePanel` 权限
3. 尝试重新加载扩展

### Q: 思维导图没有显示

**A:**
1. 确保至少创建了 2 条笔记
2. 检查浏览器控制台是否有 JavaScript 错误
3. 尝试切换到笔记列表再切换回来

## 🔍 开发者工具

### 调试 Content Script
右键点击网页 → 检查 → Console

### 调试 Background Service Worker
chrome://extensions/ → WebMind → Service Worker → inspect

### 调试 Popup
右键点击扩展图标 → 检查弹出内容

### 调试 Side Panel
打开侧边栏 → 右键点击 → 检查

## 📚 更多资源

- [Chrome Extensions 官方文档](https://developer.chrome.com/docs/extensions/)
- [Chrome Built-in AI 文档](https://developer.chrome.com/docs/ai/built-in)
- [Manifest V3 迁移指南](https://developer.chrome.com/docs/extensions/mv3/intro/)

## 💡 开发提示

1. **修改代码后**：在开发模式下，Vite 会自动重新构建，但需要在 `chrome://extensions/` 手动点击刷新按钮

2. **查看日志**：
   - Content Script 日志在网页的 Console
   - Background 日志在 Service Worker 的 Console
   - Popup/SidePanel 日志在各自的 Console

3. **热重载**：考虑使用 `chrome-extension-reloader` 实现真正的热重载

---

如有其他问题，请提交 Issue 或查阅 README.md

