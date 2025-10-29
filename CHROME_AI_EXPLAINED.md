# 🤖 Chrome Built-in AI 详解

## 什么是 Chrome Built-in AI？

Chrome Built-in AI 是 Google 在 Chrome 浏览器中内置的 **Gemini Nano** 人工智能模型。

### 核心概念

```
传统 AI 方案：
┌─────────┐     互联网      ┌──────────────┐
│ 浏览器  │ ─────────────> │ OpenAI 服务器 │
│         │ <───────────── │ (需要 API Key)│
└─────────┘   返回结果      └──────────────┘
   ❌ 需要 API Key
   ❌ 需要付费（$0.002/1K tokens）
   ❌ 数据发送到云端
   ❌ 需要稳定网络

Chrome Built-in AI：
┌─────────────────────────────┐
│        Chrome 浏览器         │
│  ┌──────┐    ┌───────────┐ │
│  │ 网页 │───>│ Gemini    │ │
│  │      │<───│ Nano 模型 │ │
│  └──────┘    └───────────┘ │
│    (本地调用，无需联网)      │
└─────────────────────────────┘
   ✅ 不需要 API Key
   ✅ 完全免费
   ✅ 数据不出本地
   ✅ 可离线使用
```

---

## 🎯 WebMind 如何使用 Chrome AI？

### 第一步：检查 AI 是否可用

```typescript
// src/shared/utils/ai.ts
export async function checkAIAvailability() {
  if (!window.ai) {
    return { summarizer: 'no' };
  }
  
  const status = await window.ai.summarizer?.capabilities();
  return {
    summarizer: status?.available || 'no'
    // 'readily' = 可用
    // 'after-download' = 需要下载模型
    // 'no' = 不可用
  };
}
```

### 第二步：创建 AI 摘要器

```typescript
// src/background/offscreen.ts
const summarizer = await window.ai.summarizer.create({
  type: 'tl;dr',      // 摘要类型：简短总结
  format: 'plain-text', // 输出格式：纯文本
  length: 'medium'    // 长度：中等
});
```

### 第三步：生成摘要

```typescript
const text = "用户选中的一大段文本...";
const summary = await summarizer.summarize(text);
// summary: "这段文本的简短摘要..."
```

### 第四步：清理资源

```typescript
summarizer.destroy(); // 释放内存
```

---

## 🔐 为什么这个方案更好？

### 隐私保护 ⭐⭐⭐⭐⭐

```
传统 AI API：
你的笔记内容 → 发送到 OpenAI 服务器 → 被记录/分析
❌ 数据隐私风险
❌ 可能被用于训练模型
❌ 受服务条款约束

Chrome Built-in AI：
你的笔记内容 → 在你的电脑上处理 → 不离开设备
✅ 完全隐私
✅ 数据不上传
✅ 你完全掌控
```

### 成本 ⭐⭐⭐⭐⭐

```
OpenAI GPT-4:
- $0.03 / 1K tokens (输入)
- $0.06 / 1K tokens (输出)
- 1000 次摘要 ≈ $30-50

Chrome Built-in AI:
- $0 (完全免费)
- 无限次使用
- 无需信用卡
```

### 速度 ⭐⭐⭐⭐⭐

```
API 调用：
发送请求 (50ms) + 网络延迟 (100-500ms) + 服务器处理 (1-3s)
总计：1.5-3.5 秒

Chrome AI：
本地处理 (200-800ms)
总计：0.2-0.8 秒
```

---

## 🛠️ 如何启用 Chrome Built-in AI？

### 第一步：检查 Chrome 版本

访问 `chrome://version`，确保版本 ≥ 120

### 第二步：启用实验性功能

1. 打开 `chrome://flags`
2. 搜索并启用以下功能：

```
🔧 Prompt API for Gemini Nano
   chrome://flags/#prompt-api-for-gemini-nano
   设置为：Enabled

🔧 Summarization API for Gemini Nano  
   chrome://flags/#summarization-api-for-gemini-nano
   设置为：Enabled

🔧 Optimization Guide On Device Model
   chrome://flags/#optimization-guide-on-device-model
   设置为：Enabled BypassPerfRequirement
```

3. 点击 **Relaunch** 重启浏览器

### 第三步：下载 AI 模型

首次使用时，Chrome 会自动下载 Gemini Nano 模型：

```javascript
// 在浏览器控制台（F12）测试：
await ai.languageModel.create();
```

如果返回错误，说明模型还在下载中，等待几分钟。

下载完成后会自动保存在：
- Windows: `%LOCALAPPDATA%\Google\Chrome\User Data\OptimizationGuidePredictionModels`
- Mac: `~/Library/Application Support/Google/Chrome/OptimizationGuidePredictionModels`
- Linux: `~/.config/google-chrome/OptimizationGuidePredictionModels`

**大小约 1.5GB**，只需下载一次。

---

## 🧪 测试 AI 功能

### 在控制台测试（最简单）

打开任意网页，按 F12 打开控制台，输入：

```javascript
// 测试 1：检查是否可用
console.log(await ai.summarizer.capabilities());
// 输出：{ available: 'readily' } ✅

// 测试 2：创建摘要器
const summarizer = await ai.summarizer.create({
  type: 'tl;dr',
  format: 'plain-text',
  length: 'medium'
});

// 测试 3：生成摘要
const text = `
人工智能（Artificial Intelligence，AI）是计算机科学的一个分支，
致力于创建能够执行通常需要人类智能的任务的系统。
AI 包括机器学习、深度学习、自然语言处理等多个子领域。
近年来，大型语言模型如 GPT 和 Gemini 取得了突破性进展。
`;

const summary = await summarizer.summarize(text);
console.log(summary);
// 输出：AI是计算机科学分支，用于创建智能系统。包括机器学习和自然语言处理等领域。

// 测试 4：清理
summarizer.destroy();
```

### 在 WebMind 中测试

1. 构建并加载扩展
2. 访问任意网页
3. 选中一段文本（至少 10 个字符）
4. 点击「用 AI 总结」按钮
5. 查看生成的摘要

---

## 📊 API 对比

| 特性 | OpenAI API | Claude API | Chrome Built-in AI |
|------|-----------|-----------|-------------------|
| 需要 API Key | ✅ 必需 | ✅ 必需 | ❌ 不需要 |
| 费用 | 💰 按量付费 | 💰 按量付费 | 🆓 免费 |
| 隐私 | ⚠️ 数据上传 | ⚠️ 数据上传 | ✅ 本地处理 |
| 速度 | 🐢 1-3秒 | 🐢 1-3秒 | 🚀 0.2-0.8秒 |
| 离线使用 | ❌ 不支持 | ❌ 不支持 | ✅ 支持 |
| 模型大小 | - | - | 1.5GB |
| 能力 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 适用场景 | 复杂任务 | 复杂任务 | 简单摘要 |

---

## 🔮 未来展望

Chrome Built-in AI 目前支持：
- ✅ 文本摘要（summarizer）
- ✅ 文本生成（languageModel）
- 🔜 翻译
- 🔜 问答
- 🔜 分类
- 🔜 情感分析

---

## ❓ 常见问题

### Q: 真的不需要任何 API Key？
**A**: 是的！完全不需要。Chrome Built-in AI 是浏览器自带的功能。

### Q: 需要联网吗？
**A**: 只在第一次下载模型时需要联网（约 1.5GB）。之后完全离线可用。

### Q: 会被收费吗？
**A**: 不会。这是 Chrome 提供的免费功能。

### Q: 我的数据会被上传吗？
**A**: 不会。所有处理都在你的电脑上本地进行。

### Q: 为什么需要启用实验性功能？
**A**: 因为 Chrome Built-in AI 目前还是实验性功能，预计未来会成为正式功能。

### Q: 摘要质量如何？
**A**: 对于简单摘要任务（如网页内容总结）非常好。但不如 GPT-4 等大模型强大。

### Q: 支持中文吗？
**A**: 支持！Gemini Nano 支持多种语言，包括中文。

### Q: 有使用限制吗？
**A**: 没有。可以无限次调用，没有速率限制。

---

## 🎓 技术细节

### API 接口定义

```typescript
interface Window {
  ai?: {
    // 摘要 API
    summarizer?: {
      create(options?: {
        type?: 'key-points' | 'tl;dr' | 'teaser' | 'headline';
        format?: 'plain-text' | 'markdown';
        length?: 'short' | 'medium' | 'long';
      }): Promise<AISummarizer>;
      
      capabilities(): Promise<{
        available: 'readily' | 'after-download' | 'no';
      }>;
    };
    
    // 语言模型 API
    languageModel?: {
      create(): Promise<AISession>;
      capabilities(): Promise<{
        available: 'readily' | 'after-download' | 'no';
      }>;
    };
  };
}

interface AISummarizer {
  summarize(text: string): Promise<string>;
  destroy(): void;
}

interface AISession {
  prompt(text: string): Promise<string>;
  destroy(): void;
}
```

### 在 WebMind 中的使用

查看这些文件了解实现细节：
- `src/background/offscreen.ts` - AI 调用实现
- `src/shared/utils/ai.ts` - AI 工具函数
- `src/shared/types.ts` - 类型定义

---

## 🌐 参考资源

- [Chrome Built-in AI 官方文档](https://developer.chrome.com/docs/ai/built-in)
- [Gemini Nano 介绍](https://deepmind.google/technologies/gemini/nano/)
- [Chrome AI Origin Trial](https://developer.chrome.com/origintrials/#/view_trial/3152001635093291009)

---

## 🎉 总结

**Chrome Built-in AI 让 AI 功能变得：**

✅ **免费** - 不需要任何费用  
✅ **简单** - 不需要 API Key  
✅ **隐私** - 数据不离开本地  
✅ **快速** - 本地处理，即时响应  
✅ **离线** - 下载模型后可离线使用  

这就是为什么 WebMind 不需要你提供任何 API！🚀

---

**现在明白了吗？Chrome 浏览器本身就是 AI 引擎！** 🤖


