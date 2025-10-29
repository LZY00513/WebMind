# 🤝 贡献指南

感谢你对 WebMind 项目感兴趣！我们欢迎各种形式的贡献。

## 📋 贡献方式

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复或新功能
- 🎨 改进 UI/UX 设计
- 🌍 添加多语言支持

## 🚀 开始贡献

### 1. Fork 项目

点击 GitHub 页面右上角的 **Fork** 按钮。

### 2. 克隆仓库

```bash
git clone https://github.com/你的用户名/webmind.git
cd webmind
```

### 3. 创建分支

```bash
git checkout -b feature/你的功能名称
```

分支命名规范：
- `feature/xxx` - 新功能
- `fix/xxx` - Bug 修复
- `docs/xxx` - 文档更新
- `refactor/xxx` - 代码重构
- `style/xxx` - 样式调整

### 4. 安装依赖

```bash
npm install
```

### 5. 开发

```bash
npm run dev
```

在 `chrome://extensions/` 加载 `dist` 目录进行测试。

### 6. 提交代码

```bash
git add .
git commit -m "feat: 添加了某某功能"
```

提交信息规范（Conventional Commits）：
- `feat:` - 新功能
- `fix:` - Bug 修复
- `docs:` - 文档更新
- `style:` - 代码格式调整
- `refactor:` - 代码重构
- `test:` - 测试相关
- `chore:` - 构建/工具相关

### 7. 推送到 GitHub

```bash
git push origin feature/你的功能名称
```

### 8. 创建 Pull Request

在 GitHub 页面点击 **Pull Request** 按钮，填写 PR 描述。

## 📐 代码规范

### TypeScript

- 使用 TypeScript 严格模式
- 为函数和变量添加类型注解
- 避免使用 `any` 类型

```typescript
// ✅ 推荐
function saveNote(note: Note): Promise<void> {
  // ...
}

// ❌ 不推荐
function saveNote(note: any) {
  // ...
}
```

### React

- 使用函数组件和 Hooks
- 组件名使用 PascalCase
- Props 类型定义使用 interface

```typescript
// ✅ 推荐
interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  // ...
};
```

### 命名规范

- 组件：`PascalCase` (`Popup.tsx`, `MindMap.tsx`)
- 函数：`camelCase` (`saveNote`, `extractKeywords`)
- 常量：`UPPER_SNAKE_CASE` (`STORAGE_KEY`, `API_ENDPOINT`)
- 文件：组件用 PascalCase，其他用 kebab-case

### 注释

- 复杂逻辑添加注释说明
- 公共函数添加 JSDoc 注释

```typescript
/**
 * 从文本中提取关键词
 * @param text 要分析的文本
 * @returns 关键词数组（最多 5 个）
 */
function extractKeywords(text: string): string[] {
  // ...
}
```

## 🧪 测试

在提交 PR 前，请确保：

- [ ] 代码能够成功构建（`npm run build`）
- [ ] 类型检查通过（`npm run type-check`）
- [ ] 扩展能够正常加载
- [ ] 核心功能正常工作：
  - [ ] 文本选择和摘要生成
  - [ ] 笔记保存和读取
  - [ ] 侧边栏和思维导图
- [ ] 没有 Console 错误
- [ ] 代码格式整洁

## 📝 Pull Request 检查清单

提交 PR 时，请确保：

- [ ] PR 标题清晰描述了改动内容
- [ ] PR 描述中包含：
  - [ ] 改动的目的和背景
  - [ ] 主要变更内容
  - [ ] 相关的 Issue 编号（如有）
  - [ ] 测试截图或 GIF（如适用）
- [ ] 代码遵循项目规范
- [ ] 添加了必要的注释
- [ ] 更新了相关文档（如需要）
- [ ] 测试通过

## 🐛 报告 Bug

使用 GitHub Issues 报告 Bug，请包含：

1. **Bug 描述**：清晰描述问题
2. **复现步骤**：如何触发这个 Bug
3. **期望行为**：应该发生什么
4. **实际行为**：实际发生了什么
5. **环境信息**：
   - Chrome 版本
   - 操作系统
   - WebMind 版本
6. **截图/日志**：Console 错误信息或截图

## 💡 功能建议

使用 GitHub Issues 提出功能建议，请包含：

1. **功能描述**：详细说明建议的功能
2. **使用场景**：为什么需要这个功能
3. **期望实现**：你希望如何实现
4. **备选方案**：是否有其他实现方式

## 🎨 设计贡献

如果你想改进 UI/UX：

1. 保持现有的紫色渐变主题风格
2. 确保设计在不同尺寸下都能良好显示
3. 提供设计稿或原型图
4. 说明设计改进的理由

## 📖 文档贡献

文档改进总是受欢迎的！可以：

- 修正拼写或语法错误
- 改进说明的清晰度
- 添加示例或截图
- 翻译文档到其他语言

## ❓ 需要帮助？

- 📧 提交 Issue 询问问题
- 💬 在 PR 中讨论实现细节
- 📚 查看现有文档和代码

## 📜 行为准则

- 尊重所有贡献者
- 保持友好和建设性的沟通
- 欢迎新手贡献者
- 关注代码质量和用户体验

## 🙏 致谢

感谢每一位贡献者！你的贡献让 WebMind 变得更好。

贡献者名单将在 README.md 中展示。

---

**Happy Coding! 🚀**

