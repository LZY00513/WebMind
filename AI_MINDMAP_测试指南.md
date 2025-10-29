# 🧪 AI 思维导图测试指南

## 快速测试流程

### 1. 准备工作 (1分钟)

```bash
# 编译扩展
cd "/Users/lamore/Desktop/Chrome Challenge"
npm run build

# 重新加载扩展
# 1. 打开 chrome://extensions/
# 2. 找到 WebMind 扩展
# 3. 点击 "重新加载" 按钮
```

---

### 2. 创建测试笔记 (2分钟)

打开测试页面：`/Users/lamore/Desktop/Chrome Challenge/test.html`

**依次选中以下 5 段文字并添加笔记：**

#### 笔记 1: AI 定义
```
Artificial Intelligence (AI) refers to the simulation of human intelligence 
in machines that are programmed to think and learn like humans.
```

#### 笔记 2: 机器学习
```
Machine Learning is a subset of AI that focuses on the development of 
algorithms that allow computers to learn from and make predictions based on data.
```

#### 笔记 3: 深度学习
```
Deep Learning is a specialized form of machine learning that uses neural 
networks with multiple layers to process complex patterns in large datasets.
```

#### 笔记 4: 自然语言处理
```
Natural Language Processing (NLP) enables computers to understand, interpret, 
and generate human language in a valuable way.
```

#### 笔记 5: 计算机视觉
```
Computer Vision is a field of AI that trains computers to interpret and 
understand the visual world using digital images and videos.
```

**操作步骤：**
1. 用鼠标选中一段文字
2. 点击浮动的 "添加到笔记" 按钮
3. 等待保存成功提示
4. 重复 5 次

---

### 3. 查看思维导图 (1分钟)

1. **打开侧边栏**
   - 点击扩展图标
   - 点击 "Open SidePanel"

2. **切换到思维导图视图**
   - 点击 "🧠 思维导图" 标签

3. **等待 AI 构建**
   - 查看顶部状态提示
   - 观察控制台日志 (F12)

---

### 4. 预期结果

#### ✅ 正常情况 (AI 可用)

**控制台日志：**
```
[AI Mindmap] 🚀 开始构建思维导图，笔记数量: 5
[AI Mindmap] 📊 Summarizer 状态: available
[AI Mindmap] 🤖 使用 AI Summarizer 构建
[AI Mindmap] ✅ Summarizer 创建成功
[AI Mindmap] 📝 处理笔记: 1761...
[AI Mindmap] ✅ 摘要生成: "AI simulates human intelligence..."
[AI Mindmap] 📝 处理笔记: 1762...
[AI Mindmap] ✅ 摘要生成: "Machine learning predicts from data..."
[AI Mindmap] 📝 处理笔记: 1763...
[AI Mindmap] ✅ 摘要生成: "Deep learning uses neural networks..."
[AI Mindmap] 📝 处理笔记: 1764...
[AI Mindmap] ✅ 摘要生成: "NLP understands human language..."
[AI Mindmap] 📝 处理笔记: 1765...
[AI Mindmap] ✅ 摘要生成: "Computer vision interprets visual data..."
[AI Mindmap] 🔗 连接: AI simulates ↔ Machine learning (相似度: 28.5%)
[AI Mindmap] 🔗 连接: Machine learning ↔ Deep learning (相似度: 35.2%)
[AI Mindmap] 🔗 连接: AI simulates ↔ NLP (相似度: 22.1%)
[AI Mindmap] 🔗 连接: Deep learning ↔ Computer vision (相似度: 18.7%)
[AI Mindmap] 🧹 Summarizer 资源已释放
[AI Mindmap] 📊 节点数量: 5
[AI Mindmap] 🔗 连线数量: 4
[AI Mindmap] ✅ AI 思维导图构建完成
```

**界面显示：**
```
💡 拖动节点可以调整布局，滚轮缩放查看细节
✅ Chrome 内置 AI 可用，将生成智能思维导图
```

**节点内容：**
- 完整的主题描述句子（非单个词汇）
- 例如: "AI simulates human intelligence"

**连线：**
- 4-6 条连线连接相关节点
- 粗细表示相似度强弱

---

#### ⚠️ 降级情况 (AI 不可用)

**控制台日志：**
```
[AI Mindmap] 🚀 开始构建思维导图，笔记数量: 5
[AI Mindmap] 📊 Summarizer 状态: unavailable
[AI Mindmap] ⚠️ Summarizer 不可用 → 使用降级方案
[AI Mindmap] 📋 使用降级方案（词频统计）
[AI Mindmap] 📊 降级方案 - 节点: 8, 连线: 5
```

**界面显示：**
```
💡 拖动节点可以调整布局，滚轮缩放查看细节
❌ AI 模型不可用，使用基础算法
```

**节点内容：**
- 关键词（单个词汇）
- 例如: "learning", "intelligence", "data"

---

### 5. 交互测试

#### 测试 1: 拖动节点
- ✅ 可以拖动节点调整位置
- ✅ 其他节点会有弹力效果
- ✅ 连线跟随节点移动

#### 测试 2: 缩放
- ✅ 滚轮向上放大
- ✅ 滚轮向下缩小
- ✅ 节点和连线同步缩放

#### 测试 3: 点击节点
- ✅ 节点高亮
- ✅ 可以查看关联笔记（未来功能）

#### 测试 4: 实时更新
- ✅ 添加新笔记后自动重新构建
- ✅ 删除笔记后自动更新

---

### 6. 性能测试

#### 测试场景 1: 少量笔记 (3条)

**预期：**
- 构建时间: < 3 秒
- 节点数量: 3
- 连线数量: 1-2

#### 测试场景 2: 正常数量 (5-10条)

**预期：**
- 构建时间: 2-5 秒
- 节点数量: 5-10
- 连线数量: 3-8

#### 测试场景 3: 大量笔记 (20+条)

**预期：**
- 构建时间: 5-10 秒
- 节点数量: 20+
- 连线数量: 15-30
- 可能出现性能问题（节点重叠）

---

### 7. 错误测试

#### 测试 1: AI 中断
```typescript
// 模拟 AI 调用失败
// 预期：自动降级到传统算法
```

**操作：**
- 在 AI 构建过程中禁用网络
- 观察是否正常降级

**预期日志：**
```
[AI Mindmap] ❌ AI 构建失败，使用降级方案
[AI Mindmap] 📋 使用降级方案（词频统计）
```

#### 测试 2: 空笔记
**操作：**
- 删除所有笔记
- 切换到思维导图视图

**预期显示：**
```
思维导图为空
创建一些笔记后，这里会自动生成知识图谱
```

#### 测试 3: 无效内容
**操作：**
- 选中很短的文字（< 10 字符）
- 添加为笔记

**预期：**
- 仍然可以添加
- AI 摘要可能返回原文
- 节点正常显示

---

### 8. 对比测试

#### 创建两组笔记

**组 1: 相关主题（AI 领域）**
```
- Artificial Intelligence
- Machine Learning
- Deep Learning
- Neural Networks
- Data Science
```

**组 2: 无关主题**
```
- Artificial Intelligence
- Cooking Recipes
- Travel Tips
- Stock Market
- Fitness Training
```

**对比结果：**

| 指标 | 相关主题 | 无关主题 |
|------|---------|---------|
| 连线数量 | 8-12 条 | 1-2 条 |
| 节点聚集 | 紧密 | 分散 |
| 相似度 | 25-45% | 5-15% |

---

### 9. 浏览器兼容性

#### Chrome 129+ (推荐)
- ✅ AI 功能完整可用
- ✅ Gemini Nano 支持
- ✅ 所有功能正常

#### Chrome 120-128
- ⚠️ 需要手动启用 flags
- ⚠️ AI 可能不稳定
- ✅ 降级方案可用

#### 其他浏览器
- ❌ AI 功能不可用
- ✅ 降级方案可用
- ⚠️ 部分 API 可能不支持

---

### 10. 调试技巧

#### 查看完整日志
```javascript
// 打开控制台 (F12)
// 筛选日志
[AI Mindmap]  // 只看思维导图相关

// 查看 AI 状态
const status = await ai.summarizer.availability();
console.log('AI Status:', status);

// 手动触发构建
buildMindmapFromSummaries(notes);
```

#### 清空缓存
```javascript
// 控制台执行
chrome.storage.local.clear();
location.reload();
```

#### 重置扩展
```
1. chrome://extensions/
2. 找到 WebMind
3. 点击 "删除"
4. 重新加载扩展文件夹
```

---

### 11. 常见问题排查

#### Q: 思维导图一直显示 "构建中"

**排查步骤：**
1. 查看控制台是否有错误
2. 检查 AI 状态是否为 `downloading`
3. 等待模型下载完成
4. 刷新页面重试

#### Q: 节点全是单个词汇，不是句子

**原因：**
- AI 不可用，使用了降级算法

**解决：**
1. 检查 Chrome 版本 (需要 129+)
2. 启用 Gemini Nano flags
3. 重启浏览器

#### Q: 连线太少或没有连线

**原因：**
- 笔记主题不相关
- 相似度阈值设置过高

**解决：**
1. 添加相关主题的笔记
2. 降低相似度阈值（开发者选项）

#### Q: 性能卡顿

**原因：**
- 笔记数量过多 (>30条)
- AI 模型运行慢

**解决：**
1. 删除不相关的旧笔记
2. 分批管理笔记
3. 等待 AI 构建完成

---

### 12. 测试清单

```
测试环境准备
[ ] Chrome 版本 >= 129
[ ] 扩展已编译并加载
[ ] Gemini Nano 已下载

基础功能
[ ] 可以添加笔记
[ ] 可以查看思维导图
[ ] AI 状态正确显示
[ ] 节点正常渲染
[ ] 连线正常显示

AI 功能
[ ] AI 可用性检测正确
[ ] AI 摘要生成成功
[ ] 节点是完整句子（非单词）
[ ] 语义相似度计算正确
[ ] 控制台日志完整

降级功能
[ ] AI 不可用时自动降级
[ ] 传统算法正常工作
[ ] 降级状态正确提示

交互功能
[ ] 节点可拖动
[ ] 缩放功能正常
[ ] 实时更新工作
[ ] 删除笔记后更新

性能测试
[ ] 3条笔记 < 3秒
[ ] 10条笔记 < 5秒
[ ] 20条笔记 < 10秒
[ ] 无明显卡顿

错误处理
[ ] AI 中断自动降级
[ ] 空笔记正确显示
[ ] 无效内容容错处理
```

---

**测试完成时间：** 预计 10-15 分钟  
**建议测试次数：** 至少 2 次完整流程  
**记录测试结果：** 记录所有异常情况

