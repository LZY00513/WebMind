// Offscreen Document - 在页面上下文中调用 Chrome Built-in AI
/// <reference types="chrome"/>

/**
 * 监听来自 service worker 的消息
 */
chrome.runtime.onMessage.addListener((
  message: { type: string; payload: { text: string } },
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: { summary?: string; error?: string }) => void
) => {
  if (message.type === 'AI_SUMMARIZE') {
    handleAISummarize(message.payload.text)
      .then((summary) => sendResponse({ summary }))
      .catch((error) => sendResponse({ error: error.message }));
    return true; // 保持消息通道打开
  }
});

/**
 * 使用 Chrome Built-in AI 生成摘要
 */
async function handleAISummarize(text: string): Promise<string> {
  try {
    // 检查 Summarizer API 是否存在
    if (!('Summarizer' in self)) {
      throw new Error('Summarizer API 不可用');
    }

    // 检查 API 可用性
    const availability = await (self as any).Summarizer.availability();
    console.log('📊 Summarizer 可用性:', availability);
    
    if (availability === 'unavailable') {
      throw new Error('摘要功能在此设备上不可用');
    }

    if (availability === 'downloadable') {
      console.log('⬇️ 需要下载 AI 模型');
    }

    if (availability === 'downloading') {
      console.log('⏳ AI 模型正在下载中...');
    }

    // 创建摘要生成器
    console.log('🔨 创建 Summarizer...');
    const summarizer = await (self as any).Summarizer.create({
      type: 'tldr',
      format: 'plain-text',
      length: 'medium',
      outputLanguage: 'en',  // 指定输出语言为英语
      sharedContext: 'This is a web content summary.',
      monitor(m: any) {
        m.addEventListener('downloadprogress', (e: any) => {
          console.log(`📥 已下载 ${Math.round(e.loaded * 100)}%`);
        });
      }
    });

    console.log('✅ Summarizer 创建成功');

    // 清理文本（移除 HTML 标签）
    const cleanText = text.replace(/<[^>]*>/g, '');
    
    // 生成摘要
    console.log('🤖 开始生成摘要...');
    // 注意：目前 Chrome Built-in AI 不支持中文输出，使用英文
    const summary = await summarizer.summarize(cleanText);

    console.log('✅ 摘要生成成功');

    // 清理资源
    summarizer.destroy();

    return summary;
  } catch (error) {
    console.error('❌ AI 摘要失败:', error);
    throw error;
  }
}

console.log('WebMind Offscreen Document 已加载');

// 导出空对象以确保此文件被视为模块
export {};

