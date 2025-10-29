# 🔧 扩展上下文失效问题修复

## 问题描述

当扩展被重新加载或更新后，旧的 content script 仍在页面中运行，但与 background script 的连接已失效，导致：

```
Error: Extension context invalidated.
```

## 问题原因

1. **扩展重新加载**：在 `chrome://extensions/` 中点击重新加载按钮
2. **旧 content script 仍在运行**：已加载的网页中的 content script 没有自动更新
3. **连接失效**：旧 content script 尝试使用 `chrome.runtime.sendMessage` 发送消息，但 background 已是新实例

## 解决方案

### 1. 添加上下文检测函数

```typescript
function isExtensionContextValid(): boolean {
  try {
    if (!chrome || !chrome.runtime) {
      return false;
    }
    // 检查是否可以访问扩展 ID
    return typeof chrome.runtime.id === 'string';
  } catch (error) {
    return false;
  }
}
```

### 2. 在关键操作前检查上下文

**初始化时检查：**
```typescript
function init() {
  if (!isExtensionContextValid()) {
    console.error('❌ 扩展上下文已失效，Content Script 不会初始化');
    console.warn('💡 提示：请刷新页面以重新加载 Content Script');
    return;
  }
  // ... 正常初始化
}
```

**显示按钮前检查：**
```typescript
function showFloatingButton(x: number, y: number, text: string) {
  if (!isExtensionContextValid()) {
    console.warn('⚠️ 扩展上下文已失效，不显示按钮');
    return;
  }
  // ... 正常显示按钮
}
```

**发送消息前检查：**
```typescript
async function handleSummarize(text: string) {
  if (!isExtensionContextValid()) {
    console.error('❌ 扩展上下文已失效，需要刷新页面');
    showNotification('扩展已更新，请刷新页面后重试', 'error');
    return;
  }
  // ... 正常发送消息
}
```

### 3. 捕获并处理特定错误

```typescript
try {
  const response = await chrome.runtime.sendMessage({...});
} catch (error: any) {
  if (error.message && error.message.includes('Extension context invalidated')) {
    showNotification('扩展已更新，请刷新页面后重试 🔄', 'error');
  } else {
    showNotification('保存失败，请重试', 'error');
  }
}
```

## 用户体验优化

### 友好的错误提示

当上下文失效时，用户会看到：
- 🔄 **"扩展已更新，请刷新页面后重试"**

而不是看到：
- ❌ **"Extension context invalidated"** （技术性错误）

### 控制台提示

开发者控制台会显示清晰的提示：
```
❌ 扩展上下文已失效，Content Script 不会初始化
💡 提示：请刷新页面以重新加载 Content Script
```

## 如何使用

### 方式 1：刷新页面（推荐）

重新加载扩展后，**刷新所有打开的网页**：
1. 按 `Cmd+R` (Mac) 或 `Ctrl+R` (Windows)
2. 或点击浏览器刷新按钮

### 方式 2：关闭并重新打开标签页

如果刷新后仍有问题：
1. 关闭出问题的标签页
2. 重新打开该网页

### 方式 3：重启浏览器

如果问题持续存在：
1. 完全关闭 Chrome
2. 重新启动 Chrome

## 预防措施

### 开发时的最佳实践

1. **每次修改代码后**
   - ✅ 重新加载扩展
   - ✅ 刷新测试页面
   - ❌ 不要在旧页面上测试

2. **使用测试页面**
   - 使用 `test.html` 进行测试
   - 每次测试前刷新页面

3. **查看控制台**
   - 注意上下文失效的警告
   - 及时刷新页面

## 技术细节

### 为什么会发生这个问题？

Chrome 扩展架构：
```
┌─────────────┐         ┌──────────────────┐
│   Content   │         │   Background     │
│   Script    │◄───────►│ Service Worker   │
│  (页面上下文) │  消息通信  │  (扩展上下文)   │
└─────────────┘         └──────────────────┘
```

当扩展重新加载：
```
┌─────────────┐         ┌──────────────────┐
│   Content   │         │   Background     │
│   Script    │  ✗ 失效  │ Service Worker   │
│   (旧实例)   │◄───────►│    (新实例)      │
└─────────────┘         └──────────────────┘
```

### chrome.runtime.id 的作用

- **正常情况**：`chrome.runtime.id` 返回扩展的唯一 ID（字符串）
- **上下文失效**：访问 `chrome.runtime.id` 会抛出错误
- **检测方法**：通过 try-catch 捕获错误来判断上下文是否有效

### TypeScript 类型问题

由于 TypeScript 的 Chrome 类型定义可能不完整，我们使用 `@ts-ignore` 来绕过类型检查：

```typescript
// @ts-ignore - runtime.id 在运行时存在但 TypeScript 定义可能不完整
return typeof chrome.runtime.id === 'string';
```

## 相关资源

- [Chrome Extension Context Invalidation](https://developer.chrome.com/docs/extensions/mv3/messaging/#content-scripts)
- [Extension Lifecycle](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)

## 测试清单

在每次修改代码后，请测试：

- [ ] 重新加载扩展
- [ ] 打开新标签页测试（应该正常工作）
- [ ] 在旧标签页测试（应该显示友好错误）
- [ ] 刷新旧标签页后测试（应该恢复正常）
- [ ] 查看控制台日志（应该有清晰提示）

## 常见问题

### Q: 为什么不自动刷新页面？
**A:** 自动刷新可能导致用户正在编辑的内容丢失，因此我们选择提示用户手动刷新。

### Q: 可以自动重新注入 content script 吗？
**A:** 技术上可行但复杂，且可能导致内存泄漏。最简单可靠的方法是提示用户刷新。

### Q: 为什么有时刷新也不行？
**A:** 可能是浏览器缓存问题，尝试硬刷新（Cmd+Shift+R 或 Ctrl+Shift+R）。

---

**修复完成时间**: 2025-10-23  
**版本**: 1.0.1

