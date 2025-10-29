// Background Service Worker - 处理 AI 调用和消息传递

import { MessageType, SummarizeRequest, Note } from '../shared/types';
import { saveNote, getAllNotes, deleteNote } from '../shared/utils/storage';
import { generateId } from '../shared/utils/storage';

/**
 * 初始化 Service Worker
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('WebMind 扩展已安装');
  
  // 设置侧边栏
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('设置侧边栏失败:', error));
});

/**
 * 监听来自 content script 和 popup 的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Background 收到消息:', message.type, message);
  console.log('📨 消息来源:', sender.tab?.url || sender.url || 'unknown');

  switch (message.type) {
    case MessageType.COLLECT_TEXT:
      console.log('🔄 处理 COLLECT_TEXT 请求');
      handleCollectText(message.payload as SummarizeRequest)
        .then((result) => {
          console.log('✅ COLLECT_TEXT 处理成功:', result);
          sendResponse(result);
        })
        .catch((error) => {
          console.error('❌ 收集文本失败:', error);
          sendResponse({ error: error.message });
        });
      return true;

    case MessageType.SUMMARIZE_NOTES:
      handleSummarizeNotes(message.payload.noteIds)
        .then(sendResponse)
        .catch((error) => {
          console.error('批量总结失败:', error);
          sendResponse({ error: error.message });
        });
      return true;

    case MessageType.GET_NOTES:
      getAllNotes()
        .then((notes) => sendResponse({ notes }))
        .catch((error) => sendResponse({ error: error.message }));
      return true;

    case MessageType.DELETE_NOTE:
      deleteNote(message.payload.id)
        .then(() => sendResponse({ success: true }))
        .catch((error) => sendResponse({ error: error.message }));
      return true;

    case MessageType.UPDATE_NOTE:
      updateNote(message.payload.note)
        .then(() => sendResponse({ success: true }))
        .catch((error) => sendResponse({ error: error.message }));
      return true;

    case MessageType.CONNECT_NOTES:
      handleConnectNotes(message.payload.noteIds)
        .then(sendResponse)
        .catch((error) => sendResponse({ error: error.message }));
      return true;

    case MessageType.OPEN_SIDEPANEL:
      handleOpenSidePanel(sender.tab?.id);
      sendResponse({ success: true });
      break;

    default:
      console.warn('未知的消息类型:', message.type);
  }
});

/**
 * 处理文本收集请求
 */
async function handleCollectText(
  request: SummarizeRequest
): Promise<{ noteId: string } | { error: string }> {
  try {
    console.log('💾 handleCollectText 开始处理');
    const { text, url, title } = request;
    console.log('💾 收到的数据:', { textLength: text.length, url, title });

    // 验证输入
    if (!text || text.length < 10) {
      console.error('❌ 文本太短:', text.length);
      throw new Error('文本太短');
    }

    // 创建笔记
    const note: Note = {
      id: generateId(),
      content: text,
      url,
      title,
      timestamp: Date.now(),
      status: 'pending', // 待处理状态
    };

    console.log('📝 创建笔记对象:', note.id);

    // 保存笔记
    await saveNote(note);

    console.log('✅ 笔记已保存成功:', note.id);

    return { noteId: note.id };
  } catch (error) {
    console.error('❌ 保存笔记失败:', error);
    throw error;
  }
}

/**
 * 批量处理笔记摘要
 */
async function handleSummarizeNotes(
  noteIds: string[]
): Promise<{ success: boolean } | { error: string }> {
  try {
    const notes = await getAllNotes();
    const pendingNotes = notes.filter(note => 
      noteIds.includes(note.id) && note.status === 'pending'
    );

    for (const note of pendingNotes) {
      // 生成摘要
      const summary = await generateSummaryWithAI(note.content);
      
      // 更新笔记
      await updateNote({
        ...note,
        summary,
        status: 'summarized',
      });
    }

    return { success: true };
  } catch (error) {
    console.error('批量总结失败:', error);
    throw error;
  }
}

/**
 * 更新笔记
 */
async function updateNote(note: Note): Promise<void> {
  const notes = await getAllNotes();
  const index = notes.findIndex(n => n.id === note.id);
  
  if (index === -1) {
    throw new Error('笔记不存在');
  }

  notes[index] = note;
  await chrome.storage.local.set({ webmind_notes: notes });
}

/**
 * 连接相关笔记
 */
async function handleConnectNotes(
  noteIds: string[]
): Promise<{ success: boolean } | { error: string }> {
  try {
    const notes = await getAllNotes();
    const targetNotes = notes.filter(note => noteIds.includes(note.id));

    // 更新每个笔记的关联关系
    for (const note of targetNotes) {
      const relatedNotes = noteIds.filter(id => id !== note.id);
      await updateNote({
        ...note,
        status: 'connected',
        relatedNotes,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('连接笔记失败:', error);
    throw error;
  }
}

/**
 * 使用 AI 生成摘要
 * 注意：Chrome Built-in AI 只能在页面上下文中调用，不能直接在 service worker 中调用
 * 因此需要创建 offscreen document 或在 content script 中调用
 */
async function generateSummaryWithAI(text: string): Promise<string> {
  try {
    // 创建 offscreen document 来调用 AI API
    const summary = await callAIThroughOffscreen(text);
    return summary;
  } catch (error) {
    console.error('AI 摘要失败，使用降级方案:', error);
    // 降级方案：简单截取
    return generateSimpleSummary(text);
  }
}

/**
 * 通过 offscreen document 调用 AI
 */
async function callAIThroughOffscreen(text: string): Promise<string> {
  // 检查是否已有 offscreen document
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT' as chrome.runtime.ContextType],
  });

  if (existingContexts.length === 0) {
    // 创建 offscreen document
    await chrome.offscreen.createDocument({
      url: 'background/offscreen.html',
      reasons: ['DOM_SCRAPING' as chrome.offscreen.Reason],
      justification: '使用 Chrome Built-in AI 生成摘要',
    });
  }

  // 发送消息到 offscreen document
  const response = await chrome.runtime.sendMessage({ 
    type: 'AI_SUMMARIZE', 
    payload: { text } 
  });
  
  if (response.error) {
    throw new Error(response.error);
  }
  return response.summary;
}

/**
 * 降级方案：生成简单摘要
 */
function generateSimpleSummary(text: string): string {
  // 简单策略：提取前几句话
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const summary = sentences.slice(0, 3).join(' ');
  return summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
}

/**
 * 打开侧边栏
 */
async function handleOpenSidePanel(tabId?: number) {
  if (tabId) {
    try {
      await chrome.sidePanel.open({ tabId });
    } catch (error) {
      console.error('打开侧边栏失败:', error);
    }
  }
}

/**
 * 监听存储变化，通知其他部分
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.webmind_notes) {
    // 通知所有打开的页面更新笔记
    chrome.runtime.sendMessage({
      type: 'NOTES_UPDATED',
      payload: changes.webmind_notes.newValue,
    }).catch((error) => {
      // 忽略错误：当没有接收者时会失败，这是正常的
      console.debug('发送 NOTES_UPDATED 消息失败（可能没有接收者）:', error.message);
    });
  }
});

console.log('WebMind Background Service Worker 已启动');

