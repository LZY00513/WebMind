# 🤖 如何启用 Chrome Built-in AI

## 快速检查清单

在开始之前，请确认：

```bash
# 1. 检查 Chrome 版本
打开：chrome://version/
需要：Chrome 127+ (最好是 129+)

# 2. 检查系统要求
- RAM: 至少 4GB 可用内存
- 磁盘: 至少 2GB 可用空间
- 网络: 需要下载 ~1.7GB 模型
```

---

## 🚀 启用步骤（5分钟配置 + 等待下载）

### 步骤 1: 启用实验性功能

#### 1.1 启用模型下载
```
1. 打开浏览器，在地址栏输入：
   chrome://flags/#optimization-guide-on-device-model

2. 找到 "Optimization Guide On Device Model"
3. 设置为：Enabled BypassPerfRequirement
4. 不要立即重启！继续下一步
```

#### 1.2 启用 Prompt API
```
1. 在地址栏输入：
   chrome://flags/#prompt-api-for-gemini-nano

2. 找到 "Prompt API for Gemini Nano"
3. 设置为：Enabled
```

#### 1.3 重启 Chrome
```
点击页面底部的蓝色按钮：
[Relaunch] 或 [重新启动]

⚠️ 重启后所有标签页会恢复
```

---

### 步骤 2: 触发模型下载

重启后，模型可能不会自动下载，需要手动触发：

#### 方法 1: 在任意网页的控制台执行
```javascript
// 1. 打开任意网页（例如 test.html）
// 2. 按 F12 打开控制台
// 3. 粘贴以下代码并回车：

(async () => {
  try {
    // 检查 AI API 是否存在
    if (!('ai' in self)) {
      console.error('❌ AI API 不可用，请检查 Chrome 版本');
      return;
    }
    
    // 检查 Summarizer 可用性
    const availability = await ai.summarizer.availability();
    console.log('📊 Summarizer 状态:', availability);
    
    switch (availability) {
      case 'available':
        console.log('✅ 模型已就绪，无需下载！');
        break;
        
      case 'downloadable':
        console.log('⬇️ 开始下载模型...');
        console.log('📦 模型大小: ~1.7 GB');
        console.log('⏱️ 预计时间: 5-30 分钟（取决于网络速度）');
        
        // 创建 summarizer 会触发下载
        const summarizer = await ai.summarizer.create({
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
              const percent = Math.round(e.loaded * 100);
              console.log(`📥 下载进度: ${percent}%`);
            });
          }
        });
        
        console.log('✅ 下载已开始！请保持浏览器打开。');
        console.log('💡 你可以继续使用浏览器，下载在后台进行。');
        break;
        
      case 'downloading':
        console.log('⏳ 模型正在下载中...');
        console.log('💡 请耐心等待，可以查看进度：chrome://on-device-internals/');
        break;
        
      case 'unavailable':
        console.error('❌ 此设备不支持 AI 功能');
        console.log('可能原因：');
        console.log('1. Chrome 版本过低（需要 127+）');
        console.log('2. 设备内存不足（需要 4GB+）');
        console.log('3. 磁盘空间不足（需要 2GB+）');
        break;
    }
  } catch (error) {
    console.error('❌ 错误:', error);
  }
})();
```

#### 方法 2: 使用 WebMind 扩展触发
```
1. 打开 test.html
2. 选中一段文字
3. 点击 "添加到笔记"
4. 系统会自动尝试使用 AI，触发下载
```

---

### 步骤 3: 监控下载进度

#### 选项 A: 使用内置工具（推荐）
```
1. 打开：chrome://on-device-internals/
2. 点击 "Model Status" 标签页
3. 查看 Gemini Nano 下载进度
```

你应该看到：
```
Model: gemini-nano
Status: Downloading... (45%)
Size: 1.7 GB
```

#### 选项 B: 控制台检查
```javascript
// 每隔几分钟执行一次：
const status = await ai.summarizer.availability();
console.log('当前状态:', status);

// 下载完成后会返回 "available"
```

---

### 步骤 4: 验证 AI 已启用

#### 4.1 检查可用性
```javascript
// 在控制台执行：
const status = await ai.summarizer.availability();
console.log(status);

// 期望输出: "available"
```

#### 4.2 测试 AI 功能
```javascript
// 创建 summarizer
const summarizer = await ai.summarizer.create({
  type: 'tldr',
  format: 'plain-text',
  length: 'short'
});

// 测试生成摘要
const text = "Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. Machine learning is a subset of AI.";

const summary = await summarizer.summarize(text);
console.log('AI 摘要:', summary);

// 期望输出类似: "AI simulates human intelligence through machine learning"
```

#### 4.3 在 WebMind 中验证
```
1. 重新加载 WebMind 扩展：
   chrome://extensions/ → WebMind → 重新加载

2. 打开侧边栏，切换到 "🧠 思维导图"

3. 查看顶部状态，应该显示：
   ✅ Chrome 内置 AI 可用，将生成智能思维导图

4. 控制台应该显示：
   [AI Mindmap] 📊 Summarizer 状态: available
   [AI Mindmap] 🤖 使用 AI Summarizer 构建
```

---

## 🎯 成功标志

当 AI 启用成功后，你会看到：

### 在思维导图中：
```
💡 拖动节点可以调整布局，滚轮缩放查看细节
✅ Chrome 内置 AI 可用，将生成智能思维导图
```

### 在控制台中：
```
[AI Mindmap] 🚀 开始构建思维导图，笔记数量: 5
[AI Mindmap] 📊 Summarizer 状态: available  ← 注意这里！
[AI Mindmap] 🤖 使用 AI Summarizer 构建
[AI Mindmap] ✅ Summarizer 创建成功
[AI Mindmap] 📝 处理笔记: 1761...
[AI Mindmap] ✅ 摘要生成: "AI simulates human intelligence..."
[AI Mindmap] 🔗 连接: AI simulates ↔ Machine learning (相似度: 28.5%)
[AI Mindmap] ✅ AI 思维导图构建完成
```

### 节点对比：

**AI 启用前（降级方案）:**
```
- "learning"
- "intelligence"
- "data"
- "model"
```

**AI 启用后:**
```
- "AI simulates human intelligence"
- "Machine learning trains models with data"
- "Deep learning uses neural networks"
- "NLP processes human language"
```

---

## ⚠️ 常见问题

### Q1: 下载太慢怎么办？
**答：** 模型下载需要时间，可以：
- 在网络状况好的时候下载
- 保持 Chrome 打开，下载在后台进行
- 可以关闭标签页，但不要关闭浏览器

### Q2: 下载失败怎么办？
**答：** 如果下载失败：
```
1. 打开 chrome://on-device-internals/
2. 如果看到错误，点击 "Reset" 或 "Clear"
3. 重新执行步骤 2 的下载脚本
```

### Q3: 如何确认下载完成？
**答：** 执行：
```javascript
await ai.summarizer.availability();
// 返回 "available" 即完成
```

### Q4: 下载后占用多少空间？
**答：** ~1.7 GB，位于 Chrome 的缓存目录

### Q5: 可以删除模型吗？
**答：** 可以，但不推荐。如需删除：
```
chrome://on-device-internals/ → Clear Model
```

### Q6: 模型会自动更新吗？
**答：** 会！Google 会定期更新 Gemini Nano 模型。

---

## 🔄 故障排查

### 问题 1: 执行脚本时报错 "ai is not defined"

**原因：** flags 未正确启用或 Chrome 版本过低

**解决：**
```
1. 确认 Chrome 版本 >= 127
2. 重新执行步骤 1（启用 flags）
3. 确保重启了 Chrome
4. 在新标签页测试，不要在扩展页面测试
```

### 问题 2: 一直显示 "downloadable"

**原因：** 下载未触发

**解决：**
```javascript
// 强制触发下载
const summarizer = await ai.summarizer.create();
```

### 问题 3: 一直显示 "downloading"

**原因：** 下载中，需要等待

**解决：**
```
1. 打开 chrome://on-device-internals/
2. 查看实际进度
3. 耐心等待（可能需要 30 分钟）
4. 保持浏览器打开
```

### 问题 4: 显示 "unavailable"

**原因：** 设备不支持或配置有误

**检查：**
```
1. Chrome 版本：chrome://version/
   需要 >= 127

2. 系统资源：
   - 可用内存 > 4GB
   - 可用磁盘 > 2GB

3. flags 设置：
   - optimization-guide-on-device-model: Enabled
   - prompt-api-for-gemini-nano: Enabled

4. 重启 Chrome
```

---

## 📅 时间预估

| 步骤 | 时间 |
|------|------|
| 启用 flags | 2 分钟 |
| 重启 Chrome | 1 分钟 |
| 触发下载 | 1 分钟 |
| **等待下载** | **5-30 分钟** |
| 验证功能 | 2 分钟 |
| **总计** | **11-36 分钟** |

**大部分时间是在等待下载，可以在后台进行！**

---

## 💡 小贴士

1. **下载期间可以继续使用浏览器** - 不影响正常浏览
2. **可以关闭标签页** - 但保持 Chrome 打开
3. **不要重复触发下载** - 检查 `chrome://on-device-internals/` 确认状态
4. **网络不好可以稍后再试** - 下载会断点续传
5. **即使不启用 AI，降级方案也很好用** - 不是必须的

---

**祝你启用成功！** 🎉

如果遇到问题，请截图控制台错误信息，我会帮你诊断。

