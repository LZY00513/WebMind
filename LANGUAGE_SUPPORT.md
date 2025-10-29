# 🌍 Chrome Built-in AI 语言支持说明

## ⚠️ 重要提示

**Chrome Built-in AI 的 Summarizer API 目前不支持中文输出！**

## 📋 支持的语言

目前 Chrome Gemini Nano 内置 Summarizer 只支持以下语言：

| 语言代码 | 语言名称 | 状态 |
|---------|---------|------|
| `en` | 英语 (English) | ✅ 支持 |
| `es` | 西班牙语 (Español) | ✅ 支持 |
| `ja` | 日语 (日本語) | ✅ 支持 |
| `zh` | 中文 | ❌ **不支持** |

## 🔧 API 参数要求

### 必需参数

根据官方文档，调用 Summarizer API 时：

**旧版本（已废弃）：**
```javascript
// ❌ 会报错：No output language was specified
const summarizer = await ai.summarizer.create({
  type: 'tldr',
  format: 'plain-text'
});
```

**新版本（正确）：**
```javascript
// ✅ 必须指定 output.language
const summarizer = await ai.summarizer.create({
  output: { 
    format: "plain_text", 
    language: "en"  // ⚠️ 必填！
  }
});
```

### 当前实现

由于 Chrome API 的限制，我们的实现采用以下策略：

```typescript
// src/background/offscreen.ts
const summarizer = await Summarizer.create({
  type: 'tldr',
  format: 'plain-text',
  length: 'medium',
  sharedContext: '这是一段网页内容摘要。'
});
```

**注意：** 虽然我们在 `sharedContext` 中使用中文描述，但输出仍然是英文。

## 📝 实际效果

### 输入（中文）
```
人工智能（Artificial Intelligence），英文缩写为AI。它是研究、开发用于模拟、延伸和扩展人的智能的理论、方法、技术及应用系统的一门新的技术科学...
```

### 输出（英文摘要）
```
AI is a branch of computer science that aims to simulate human intelligence. It includes research in robotics, language recognition, image recognition, natural language processing, and expert systems.
```

## 🎯 应对策略

### 方案1：使用英文摘要（当前实现）

**优点：**
- ✅ 利用 Chrome Built-in AI 的原生能力
- ✅ 本地运行，隐私安全
- ✅ 速度快，无需网络请求
- ✅ 免费使用

**缺点：**
- ❌ 摘要是英文，可能不符合中文用户习惯

### 方案2：降级到简单摘要（备选）

当 AI 不可用或用户需要中文时，使用简单的文本提取：

```typescript
function generateSimpleSummary(text: string): string {
  // 简单策略：提取前几句话
  const sentences = text.match(/[^.!?。！？]+[.!?。！？]+/g) || [text];
  const summary = sentences.slice(0, 3).join(' ');
  return summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
}
```

**优点：**
- ✅ 保持中文
- ✅ 简单快速
- ✅ 不依赖外部服务

**缺点：**
- ❌ 质量较低
- ❌ 不是真正的"总结"

### 方案3：混合策略（推荐）

```typescript
async function summarizeText(text: string): Promise<string> {
  try {
    // 尝试使用 Chrome AI（英文输出）
    const aiSummary = await generateAISummary(text);
    
    // 可以在前面添加说明
    return `📊 AI Summary (English):\n${aiSummary}\n\n原文摘录:\n${text.slice(0, 200)}...`;
  } catch (error) {
    // 降级到简单摘要（中文）
    return generateSimpleSummary(text);
  }
}
```

## 🔮 未来展望

Google Chrome 团队计划在未来版本中添加更多语言支持，包括中文。

**预期时间线：**
- 2024 Q4：可能添加更多欧洲语言
- 2025：可能添加中文、韩文等亚洲语言

**跟踪进度：**
- [Chrome AI API Roadmap](https://developer.chrome.com/docs/ai/built-in)
- [Chrome Release Notes](https://chromestatus.com/features)

## 💡 用户使用建议

### 对于中文用户

1. **接受英文摘要**
   - 英文摘要质量高
   - 可以练习英文阅读
   - 理解大意即可

2. **查看原文**
   - 点击"查看详细"按钮
   - 阅读完整的原始中文内容

3. **使用标签和分类**
   - 为笔记添加中文标签
   - 自己组织和分类内容

### 对于开发者

1. **添加语言检测**
   ```typescript
   function detectLanguage(text: string): 'zh' | 'en' | 'other' {
     // 简单检测：如果包含中文字符
     return /[\u4e00-\u9fa5]/.test(text) ? 'zh' : 'en';
   }
   ```

2. **提供用户选择**
   - 添加设置选项：使用 AI 摘要 vs 简单摘要
   - 让用户自己决定

3. **混合显示**
   - 同时显示 AI 摘要和原文摘录
   - 提供最佳用户体验

## 📚 相关资源

- [Chrome Built-in AI Documentation](https://developer.chrome.com/docs/ai/built-in)
- [Summarizer API Guide](https://developer.chrome.com/docs/ai/summarizer-api)
- [Language Support Roadmap](https://chromestatus.com/features/5962244893974528)

## ❓ FAQ

### Q: 为什么不能输出中文？
**A:** Chrome Gemini Nano 模型目前训练数据主要是英语、西班牙语和日语，尚未包含中文。

### Q: 什么时候会支持中文？
**A:** Google 尚未公布确切时间，但在 2025 年有望支持。

### Q: 可以用第三方 API 吗？
**A:** 可以，但会失去以下优势：
- 本地运行（隐私）
- 免费使用
- 无需网络
建议先使用当前方案，等待官方支持。

### Q: 输入中文会怎样？
**A:** 输入可以是中文，但输出摘要会是英文。API 会尝试理解中文内容并生成英文摘要。

### Q: 可以同时显示中英文吗？
**A:** 可以！这是最佳实践：
```typescript
return {
  aiSummary: englishSummary,  // AI 生成的英文摘要
  excerpt: chineseText.slice(0, 200),  // 中文原文摘录
  fullText: chineseText  // 完整中文原文
}
```

---

**更新时间**: 2025-10-23  
**状态**: Chrome Built-in AI 不支持中文输出  
**建议**: 使用英文摘要 + 中文原文的混合方案

