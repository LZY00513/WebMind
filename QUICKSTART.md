# ⚡ WebMind 快速开始指南

5 分钟让 WebMind 运行起来！

## 第一步：准备 Chrome 环境

### 启用 AI 功能

1. 打开 Chrome，地址栏输入：`chrome://flags`
2. 搜索并启用以下三个标志：
   - `Prompt API for Gemini Nano` → **Enabled**
   - `Summarization API for Gemini Nano` → **Enabled**  
   - `Optimization guide on device` → **Enabled BypassPerfRequirement**
3. 点击 **Relaunch** 重启浏览器

### 验证 AI 是否可用

1. 打开任意网页，按 F12 打开开发者工具
2. 在 Console 中输入：
```javascript
await ai.languageModel.create()
```
3. 如果返回对象或 Promise，说明 AI 可用 ✅

## 第二步：构建扩展

```bash
# 进入项目目录
cd "Chrome Challenge"

# 安装依赖（首次运行）
npm install

# 构建扩展
npm run build
```

构建完成后，会在 `dist` 目录生成所有文件。

## 第三步：添加图标

在 `public/icons/` 目录下放置三个图标文件：
- `icon16.png`（16×16 像素）
- `icon48.png`（48×48 像素）
- `icon128.png`（128×128 像素）

**没有图标？** 临时用任何 PNG 图片重命名即可。

## 第四步：加载到 Chrome

1. 打开 Chrome，访问：`chrome://extensions/`
2. 打开右上角的「**开发者模式**」开关
3. 点击「**加载已解压的扩展程序**」
4. 选择项目的 **`dist`** 目录（不是项目根目录！）
5. 看到 WebMind 图标出现在扩展栏 ✅

## 第五步：测试功能

### 测试 1：创建笔记

1. 访问任意网页（如 Wikipedia）
2. 选中一段文本（至少 10 个字符）
3. 看到「**用 AI 总结**」按钮弹出
4. 点击按钮，等待几秒
5. 看到「摘要已保存」提示 ✅

### 测试 2：查看笔记

1. 点击 Chrome 工具栏的 WebMind 图标
2. 看到刚才保存的笔记
3. 点击「**查看所有笔记与思维导图**」
4. 侧边栏打开，显示笔记列表 ✅

### 测试 3：生成思维导图

1. 重复「测试 1」创建 3-5 条笔记
2. 在侧边栏切换到「**思维导图**」标签
3. 看到自动生成的知识图谱
4. 可以拖拽节点、缩放画布 ✅

## 🎉 成功！

你现在可以在任何网页上使用 WebMind 了！

---

## 🐛 遇到问题？

### AI 状态显示「不可用」
- 检查 Chrome 版本是否 >= 120
- 确认已启用所有实验性标志
- 重启浏览器后重试

### 选中文本没有弹出按钮
- 确保选中文本长度 > 10 字符
- 检查开发者工具 Console 是否有错误
- 刷新网页重试

### 构建失败
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 扩展无法加载
- 确认选择的是 `dist` 目录，不是项目根目录
- 检查 `dist` 目录是否包含 `manifest.json`
- 查看扩展管理页面是否有错误提示

---

## 📚 下一步

- 阅读 [README.md](./README.md) 了解完整功能
- 查看 [SETUP.md](./SETUP.md) 获取详细配置说明
- 阅读 [ARCHITECTURE.md](./ARCHITECTURE.md) 理解系统架构

---

**快速参考**：
- 开发模式：`npm run dev`（自动重新构建）
- 生产构建：`npm run build`
- 类型检查：`npm run type-check`
- 重新加载扩展：在 `chrome://extensions/` 点击刷新图标

