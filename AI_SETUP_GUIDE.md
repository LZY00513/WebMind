# Chrome Built-in AI 配置指南

本扩展使用 Chrome 内置的 Summarizer API 来生成高质量的文本摘要。按照以下步骤配置 AI 功能。

## 📋 前提条件

### 1. Chrome 版本要求
- **Chrome Canary** 或 **Chrome Dev** 版本（推荐）
- 最低版本：Chrome 120+
- 下载地址：
  - [Chrome Canary](https://www.google.com/chrome/canary/)
  - [Chrome Dev](https://www.google.com/chrome/dev/)

### 2. 系统要求
- **足够的存储空间**：至少 2GB 空闲空间（用于下载 Gemini Nano 模型）
- **良好的网络连接**：首次使用时需要下载模型

## 🔧 配置步骤

### 步骤 1：启用 AI 功能标志

1. 在 Chrome 地址栏输入：`chrome://flags/`
2. 搜索并启用以下标志：

   **方式 A：使用 Gemini Nano（推荐）**
   ```
   #optimization-guide-on-device-model
   → 选择 "Enabled BypassPerfRequirement"
   
   #summarization-api-for-gemini-nano
   → 选择 "Enabled"
   
   #prompt-api-for-gemini-nano
   → 选择 "Enabled"
   ```

   **方式 B：使用多模态输入**
   ```
   #prompt-api-for-gemini-nano-multimodal-input
   → 选择 "Enabled"
   ```

3. 点击页面底部的 **"Relaunch"** 按钮重启 Chrome

### 步骤 2：验证 AI 功能

1. 打开 Chrome 开发者工具（F12）
2. 在控制台（Console）中输入：
   ```javascript
   await Summarizer.availability();
   ```
3. 应该返回以下值之一：
   - `"available"` ✅ - 模型已就绪，可以使用
   - `"downloadable"` ⬇️ - 需要下载模型
   - `"downloading"` ⏳ - 正在下载模型
   - `"unavailable"` ❌ - 设备不支持

### 步骤 3：下载模型（如需要）

如果返回 `"downloadable"`，需要触发模型下载：

```javascript
// 在任意网页的控制台中执行
const summarizer = await Summarizer.create();
console.log('模型下载已开始...');
```

**注意：**
- 模型大小约 1-2GB
- 首次下载可能需要几分钟
- 下载进度会在控制台显示

### 步骤 4：检查模型状态

访问 `chrome://on-device-internals/` 查看模型状态：
1. 点击 **"模型状态"** 标签页
2. 确认没有错误信息
3. 查看模型下载进度

## 🧪 测试 AI 功能

### 在 localhost 测试

1. 前往 `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`
2. 选择 **"Enabled"**
3. 点击 **"Relaunch"** 重启 Chrome
4. 在本地网页控制台测试：
   ```javascript
   await Summarizer.availability(); // 应返回 "available"
   ```

### 测试摘要生成

```javascript
// 创建摘要生成器
const summarizer = await Summarizer.create({
  type: 'tldr',
  format: 'plain-text',
  length: 'medium'
});

// 生成摘要
const text = "这是一段很长的文本内容...";
const summary = await summarizer.summarize(text);
console.log('摘要:', summary);

// 清理资源
summarizer.destroy();
```

## 📊 API 使用说明

### 摘要类型

| 类型 | 说明 | 长度选项 |
|------|------|----------|
| `tldr` | 简短明了的概览 | short: 1句 / medium: 3句 / long: 5句 |
| `key-points` | 重要要点列表 | short: 3项 / medium: 5项 / long: 7项 |
| `teaser` | 吸引人的引言 | short: 1句 / medium: 3句 / long: 5句 |
| `headline` | 标题式摘要 | short: 12词 / medium: 17词 / long: 22词 |

### 创建选项

```javascript
const summarizer = await Summarizer.create({
  type: 'key-points',                    // 摘要类型
  format: 'markdown',                    // 格式：markdown 或 plain-text
  length: 'medium',                      // 长度：short、medium、long
  sharedContext: '这是科技文章',         // 共享上下文
  expectedInputLanguages: ['zh', 'en'],  // 预期输入语言
  outputLanguage: 'zh',                  // 输出语言
  monitor(m) {                           // 监听下载进度
    m.addEventListener('downloadprogress', (e) => {
      console.log(`已下载 ${e.loaded * 100}%`);
    });
  }
});
```

## 🔍 故障排查

### 问题 1：API 不可用

**症状：** `Summarizer.availability()` 返回 `"unavailable"`

**解决方案：**
1. 确认使用 Chrome Canary/Dev 版本
2. 检查 flags 是否正确启用
3. 重启 Chrome
4. 检查设备是否有足够存储空间
5. 查看 `chrome://on-device-internals/` 是否有错误

### 问题 2：模型下载失败

**症状：** 下载卡住或失败

**解决方案：**
1. 重启 Chrome
2. 清除浏览器缓存
3. 检查网络连接
4. 确保有足够存储空间（2GB+）
5. 等待一段时间后重试

### 问题 3：扩展中无法使用

**症状：** 在网页中可以使用，但扩展中失败

**解决方案：**
1. 确认扩展使用 Offscreen Document
2. 检查 manifest.json 中的权限配置
3. 查看 Background Service Worker 控制台日志
4. 确认 `background/offscreen.html` 路径正确

### 问题 4：需要用户激活

**症状：** 错误提示 "需要用户交互"

**解决方案：**
- 确保在用户点击事件中调用 API
- 检查 `navigator.userActivation.isActive` 状态
- 在按钮点击处理器中创建 summarizer

## 📚 相关资源

- [Chrome Built-in AI 官方文档](https://developer.chrome.com/docs/ai/built-in)
- [Summarizer API 文档](https://developer.chrome.com/docs/ai/summarizer-api)
- [Chrome AI Origin Trial](https://developer.chrome.com/origintrials/#/view_trial/2766524551846264833)

## ✅ 验证清单

使用前请确认：
- [ ] 使用 Chrome Canary 或 Chrome Dev
- [ ] 已启用所有必需的 flags
- [ ] 已重启 Chrome
- [ ] `Summarizer.availability()` 返回 `"available"`
- [ ] 模型已下载完成（检查 `chrome://on-device-internals/`）
- [ ] 扩展已正确加载
- [ ] 可以在测试页面选中文本并保存笔记

## 🎯 WebMind 扩展使用流程

1. **保存笔记**：选中网页文字 → 点击"添加到笔记"
2. **查看笔记**：点击扩展图标打开侧边栏
3. **生成摘要**：选中笔记 → 点击"生成摘要"按钮
4. **查看结果**：AI 会自动生成摘要并更新笔记

---

**注意：** Chrome Built-in AI 目前处于实验阶段，API 可能会有变化。请关注官方文档获取最新信息。

