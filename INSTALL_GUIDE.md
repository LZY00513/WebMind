# 🔧 WebMind 安装和问题解决指南

## 第一步：安装依赖

在项目根目录运行：

```bash
cd "/Users/lamore/Desktop/Chrome Challenge"
npm install
```

这会安装所有必需的依赖包，包括：
- React 和 React DOM
- TypeScript 和类型定义
- Vite 构建工具
- D3.js 和 Zustand
- Chrome 扩展类型定义

## 第二步：检查类型错误

安装完成后，运行类型检查：

```bash
npm run type-check
```

如果有类型错误，大部分应该已经通过自定义类型声明文件 `src/types/chrome.d.ts` 解决了。

## 第三步：构建项目

```bash
npm run build
```

或者使用开发模式（自动重新构建）：

```bash
npm run dev
```

## 常见问题和解决方案

### ❌ 问题 1: "找不到名称 'chrome'"

**原因**: `@types/chrome` 包未安装或配置不正确

**解决方案**:
```bash
npm install --save-dev @types/chrome
```

### ❌ 问题 2: "chrome.offscreen 不存在"

**原因**: `@types/chrome` 版本太旧，不包含新 API

**解决方案**: 已通过 `src/types/chrome.d.ts` 自定义类型声明解决 ✅

### ❌ 问题 3: "chrome.sidePanel 不存在"

**原因**: Side Panel API 是较新的功能

**解决方案**: 已通过 `src/types/chrome.d.ts` 自定义类型声明解决 ✅

### ❌ 问题 4: "window.ai 不存在"

**原因**: Chrome Built-in AI 是实验性功能

**解决方案**: 已通过 `src/types/chrome.d.ts` 全局类型声明解决 ✅

### ❌ 问题 5: "Cannot find module '../shared/types'"

**原因**: 模块路径错误或文件不存在

**解决方案**: 
1. 检查文件是否存在：`src/shared/types.ts`
2. 检查导入路径是否正确
3. 运行 `npm run build` 重新构建

### ❌ 问题 6: "tsc: command not found"

**原因**: 依赖未安装

**解决方案**:
```bash
npm install
```

## Chrome API 版本要求

此项目使用了以下较新的 Chrome API，需要特定版本的 Chrome：

| API | 最低 Chrome 版本 | 说明 |
|-----|------------------|------|
| Built-in AI | 120+ | Gemini Nano AI 功能 |
| Side Panel | 114+ | 侧边栏 API |
| Offscreen | 109+ | 离屏文档 API |
| Manifest V3 | 88+ | 扩展清单 V3 |

**推荐使用 Chrome 120 或更高版本**

## 验证安装

### 1. 检查依赖安装

```bash
ls node_modules/@types/chrome
ls node_modules/react
ls node_modules/vite
```

都应该存在。

### 2. 检查类型定义

```bash
cat src/types/chrome.d.ts
```

应该看到 Chrome API 的类型扩展。

### 3. 尝试构建

```bash
npm run build
```

应该在 `dist` 目录生成文件，无错误。

### 4. 检查构建产物

```bash
ls dist/
ls dist/background/
ls dist/content/
```

应该看到编译后的 JavaScript 文件。

## 如果仍有问题

### 完全重装

```bash
# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 清理 npm 缓存
npm cache clean --force

# 重新安装
npm install

# 重新构建
npm run build
```

### 查看详细错误

```bash
# 完整的类型检查输出
npm run type-check 2>&1 | tee type-errors.log

# 查看构建详细信息
npm run build -- --mode development
```

### 更新 @types/chrome

```bash
npm install --save-dev @types/chrome@latest
```

## 需要的 Chrome 实验性功能

在使用前，必须在 Chrome 中启用以下功能：

1. 打开 `chrome://flags`
2. 搜索并启用：
   - `Prompt API for Gemini Nano`
   - `Summarization API for Gemini Nano`  
   - `Optimization guide on device` (设置为 `Enabled BypassPerfRequirement`)
3. 重启 Chrome

## 最终检查清单

安装完成后，确认以下文件存在且无错误：

- [ ] `node_modules/` 目录已创建
- [ ] `dist/` 目录已创建（构建后）
- [ ] `dist/manifest.json` 存在
- [ ] `dist/background/service-worker.js` 存在
- [ ] `dist/content/content.js` 存在
- [ ] `npm run type-check` 无错误
- [ ] `npm run build` 成功完成

全部通过后，就可以在 `chrome://extensions/` 加载 `dist` 目录了！

---

**还有问题？** 查看 [SETUP.md](./SETUP.md) 获取更多帮助。

