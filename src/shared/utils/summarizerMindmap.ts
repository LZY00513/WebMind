// AI-Powered Mindmap Builder using Chrome Built-in Summarizer API
import { Note } from '../types';

export interface MindmapNode {
  id: string;
  label: string;
  noteId: string;
  group: number;
  fullSummary?: string;
}

export interface MindmapLink {
  source: string;
  target: string;
  weight?: number;
}

export interface Mindmap {
  nodes: MindmapNode[];
  links: MindmapLink[];
}

/**
 * 使用 Chrome Built-in Summarizer API 构建思维导图
 */
export async function buildMindmapFromSummaries(notes: Note[]): Promise<Mindmap> {
  console.log('[AI Mindmap] 🚀 开始构建思维导图，笔记数量:', notes.length);

  // 检查 Summarizer 可用性
  const status = await checkSummarizerAvailability();
  console.log('[AI Mindmap] 📊 Summarizer 状态:', status);

  // 检查是否可用（支持两种状态：'readily' 或 'available'）
  if (status !== 'readily' && status !== 'available') {
    console.warn('[AI Mindmap] ⚠️ Summarizer 不可用 → 使用降级方案');
    return buildFallbackMindmap(notes);
  }

  try {
    return await buildAIMindmap(notes);
  } catch (error) {
    console.error('[AI Mindmap] ❌ AI 构建失败，使用降级方案:', error);
    return buildFallbackMindmap(notes);
  }
}

/**
 * 检查 Summarizer 可用性
 */
async function checkSummarizerAvailability(): Promise<string> {
  try {
    // 尝试新的 API 方式（window.ai.summarizer）
    if ('ai' in self && (self as any).ai?.summarizer) {
      const capabilities = await (self as any).ai.summarizer.capabilities();
      console.log('[AI Mindmap] 🔍 AI API capabilities:', capabilities);
      return capabilities.available;
    }
    
    // 尝试旧的 API 方式（window.Summarizer）
    if ('Summarizer' in self) {
      const availability = await (self as any).Summarizer.availability();
      console.log('[AI Mindmap] 🔍 Summarizer availability:', availability);
      return availability;
    }
    
    console.warn('[AI Mindmap] ⚠️ 未找到 Summarizer API');
    return 'no';
  } catch (error) {
    console.error('[AI Mindmap] 检查可用性失败:', error);
    return 'no';
  }
}

/**
 * 使用 AI Summarizer 构建思维导图
 */
async function buildAIMindmap(notes: Note[]): Promise<Mindmap> {
  console.log('[AI Mindmap] 🤖 使用 AI Summarizer 构建');

  // 创建 Summarizer 实例（尝试两种 API 方式）
  let summarizer;
  try {
    const summarizerOptions = {
      type: 'key-points',
      format: 'plain-text',
      length: 'short',
      sharedContext: 'Extract key topics and concepts from web content for hierarchical categorization.',
      outputLanguage: 'en'  // 指定输出语言为英语
    };

    if ('ai' in self && (self as any).ai?.summarizer) {
      summarizer = await (self as any).ai.summarizer.create(summarizerOptions);
    } else if ('Summarizer' in self) {
      summarizer = await (self as any).Summarizer.create(summarizerOptions);
    } else {
      throw new Error('Summarizer API 不可用');
    }
  } catch (error) {
    console.error('[AI Mindmap] ❌ 创建 Summarizer 失败:', error);
    throw error;
  }

  console.log('[AI Mindmap] ✅ Summarizer 创建成功');

  // 第一步：提取每个笔记的主题和关键点
  const noteSummaries = await Promise.all(notes.map(async (note) => {
    try {
      console.log(`[AI Mindmap] 📝 处理笔记: ${note.id.slice(0, 8)}...`);
      
      const content = note.summary || note.content;
      const cleanContent = content.replace(/<[^>]*>/g, '').trim();
      const inputText = cleanContent.length > 1000 
        ? cleanContent.slice(0, 1000) + '...' 
        : cleanContent;

      const result = await summarizer.summarize(inputText);
      const keyPoints = result.split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^[-•*]\s*/, '').trim());

      return {
        id: `note-${note.id}`,
        noteId: note.id,
        mainTopic: keyPoints[0] || '',
        subTopics: keyPoints.slice(1),
        fullText: result
      };
    } catch (err) {
      console.error(`[AI Mindmap] ❌ 笔记 ${note.id} 摘要失败:`, err);
      return {
        id: `note-${note.id}`,
        noteId: note.id,
        mainTopic: note.summary || note.content.slice(0, 50),
        subTopics: [],
        fullText: note.content
      };
    }
  }));

  // 第二步：为每个笔记推断分类
  const notesWithCategories = noteSummaries.map(summary => {
    const category = inferCategory(summary.fullText, summary.mainTopic.split(/\s+/).slice(0, 5));
    return { ...summary, category };
  });

  // 按分类分组
  const categoryMap = new Map<string, typeof notesWithCategories>();
  notesWithCategories.forEach(item => {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, []);
    }
    categoryMap.get(item.category)!.push(item);
  });

  console.log('[AI Mindmap] 📂 AI识别的分类:', Array.from(categoryMap.keys()));

  // 第三步：构建层次结构
  const nodes: MindmapNode[] = [];
  const links: MindmapLink[] = [];
  
  // 添加根节点
  const rootId = 'root';
  nodes.push({
    id: rootId,
    label: 'My Notes',
    noteId: '',
    group: 0
  });

  // 为每个分类创建节点
  let categoryIndex = 0;
  categoryMap.forEach((items, category) => {
    categoryIndex++;
    const categoryId = `category-${categoryIndex}`;
    
    // 添加分类节点
    nodes.push({
      id: categoryId,
      label: `${getCategoryIcon(category)} ${category}`,
      noteId: '',
      group: categoryIndex
    });
    
    links.push({
      source: rootId,
      target: categoryId
    });

    // 为该分类下的每个笔记创建节点
    items.forEach(item => {
      const noteId = `note-${item.noteId}`;
      
      nodes.push({
        id: noteId,
        label: item.mainTopic,
        noteId: item.noteId,
        group: categoryIndex,
        fullSummary: item.fullText
      });
      
      links.push({
        source: categoryId,
        target: noteId
      });
    });
  });

  // 清理资源
  summarizer.destroy?.();
  console.log('[AI Mindmap] 🧹 Summarizer 资源已释放');
  console.log('[AI Mindmap] 📊 节点数量:', nodes.length);
  console.log('[AI Mindmap] 🔗 连线数量:', links.length);
  console.log('[AI Mindmap] ✅ AI 思维导图构建完成');

  return { nodes, links };
}

/**
 * 文本分词
 * 支持英文和中文
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')  // 保留中英文字符
    .split(/\s+/)  // 按空格分割
    .filter(word => word.length > 2)  // 过滤短词
    .filter(word => !isStopWord(word));  // 过滤停用词
}

/**
 * 停用词过滤
 */
function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一',
    '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有',
    '看', '好', '自己', '这', '那'
  ]);
  
  return stopWords.has(word);
}

/**
 * 降级方案：使用智能关键词提取构建分类目录
 */
function buildFallbackMindmap(notes: Note[]): Mindmap {
  console.log('[AI Mindmap] 📋 使用基础算法构建分类目录');

  const nodes: MindmapNode[] = [];
  const links: MindmapLink[] = [];

  // 添加根节点
  const rootId = 'root';
  nodes.push({
    id: rootId,
    label: 'My Notes',
    noteId: '',
    group: 0
  });

  // 为每个笔记提取关键词和分类
  interface NoteWithCategory {
    note: Note;
    keywords: string[];
    category: string;
  }

  const notesWithCategories: NoteWithCategory[] = notes.map(note => {
    const content = (note.summary || note.content).toLowerCase();
    const keywords = extractTopKeywords(content, 5);
    const category = inferCategory(content, keywords);
    
    return { note, keywords, category };
  });

  // 按分类分组
  const categoryMap = new Map<string, NoteWithCategory[]>();
  notesWithCategories.forEach(item => {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, []);
    }
    categoryMap.get(item.category)!.push(item);
  });

  console.log('[AI Mindmap] 📂 识别的分类:', Array.from(categoryMap.keys()));

  // 为每个分类创建节点
  let categoryIndex = 0;
  categoryMap.forEach((items, category) => {
    categoryIndex++;
    const categoryId = `category-${categoryIndex}`;
    
    // 添加分类节点
    nodes.push({
      id: categoryId,
      label: `${getCategoryIcon(category)} ${category}`,
      noteId: '',
      group: categoryIndex
    });
    
    links.push({
      source: rootId,
      target: categoryId
    });

    // 为该分类下的每个笔记创建节点
    items.forEach((item) => {
      const noteId = `note-${item.note.id}`;
      const noteTitle = extractTitle(item.note.summary || item.note.content);
      
      nodes.push({
        id: noteId,
        label: noteTitle,
        noteId: item.note.id,
        group: categoryIndex,
        fullSummary: item.note.summary
      });
      
      links.push({
        source: categoryId,
        target: noteId
      });
    });
  });

  console.log('[AI Mindmap] 📊 分类数量:', categoryMap.size, '笔记数量:', notes.length);

  return { nodes, links };
}

/**
 * 提取文本标题（前50个字符，智能截断）
 */
function extractTitle(text: string): string {
  const clean = text.replace(/<[^>]*>/g, '').trim();
  
  // 尝试找到第一个句子
  const firstSentence = clean.match(/^[^。！？\n.!?]+[。！？.!?]?/);
  if (firstSentence && firstSentence[0].length <= 60) {
    return firstSentence[0];
  }
  
  // 否则截取前50个字符
  return clean.slice(0, 50) + (clean.length > 50 ? '...' : '');
}

/**
 * 提取TOP关键词
 */
function extractTopKeywords(text: string, topN: number): string[] {
  const words = tokenize(text);
  const wordCount = new Map<string, number>();
  
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

/**
 * 推断分类（基于关键词和内容特征）
 */
function inferCategory(content: string, keywords: string[]): string {
  // 学科分类关键词
  const categoryKeywords: Record<string, string[]> = {
    'Chemistry': ['化学', 'chemical', 'chemistry', '元素', 'element', '反应', 'reaction', '分子', 'molecule', '原子', 'atom'],
    'Biology': ['生物', 'biology', 'biological', '细胞', 'cell', '基因', 'gene', 'dna', '蛋白质', 'protein', '生命', 'life'],
    'Physics': ['物理', 'physics', 'physical', '力学', 'force', '能量', 'energy', '波', 'wave', '光', 'light'],
    'Mathematics': ['数学', 'math', 'mathematics', '方程', 'equation', '函数', 'function', '几何', 'geometry', '代数', 'algebra'],
    'History': ['历史', 'history', 'historical', '朝代', 'dynasty', '战争', 'war', '文化', 'culture', '古代', 'ancient'],
    'Literature': ['文学', 'literature', 'literary', '诗', 'poem', '小说', 'novel', '作家', 'author', '散文', 'essay'],
    'Programming': ['编程', 'programming', 'code', '函数', 'function', 'javascript', 'python', 'java', 'algorithm', '算法'],
    'Technology': ['技术', 'technology', 'tech', '开发', 'development', 'web', 'api', 'database', '数据库', 'server'],
    'Business': ['商业', 'business', 'marketing', '市场', 'management', '管理', 'finance', '金融', 'economy', '经济'],
    'Art': ['艺术', 'art', 'artistic', '绘画', 'painting', '设计', 'design', '音乐', 'music', '美术', 'fine arts'],
  };

  const allText = content + ' ' + keywords.join(' ');
  
  // 计算每个分类的匹配分数
  const scores = new Map<string, number>();
  
  for (const [category, categoryWords] of Object.entries(categoryKeywords)) {
    let score = 0;
    categoryWords.forEach(keyword => {
      if (allText.includes(keyword)) {
        score += 1;
      }
    });
    if (score > 0) {
      scores.set(category, score);
    }
  }
  
  // 返回得分最高的分类
  if (scores.size > 0) {
    const sortedCategories = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1]);
    return sortedCategories[0][0];
  }
  
  // 如果没有匹配，根据关键词返回默认分类
  if (keywords.length > 0) {
    return keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1);
  }
  
  return 'Other';
}

/**
 * 获取分类图标
 */
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Chemistry': '🧪',
    'Biology': '🧬',
    'Physics': '⚛️',
    'Mathematics': '📐',
    'History': '📜',
    'Literature': '📚',
    'Programming': '💻',
    'Technology': '⚙️',
    'Business': '💼',
    'Art': '🎨',
    'Other': '📁'
  };
  
  return icons[category] || '📁';
}


/**
 * 显示 AI 状态通知（供 UI 调用）
 */
export async function getMindmapAIStatus(): Promise<{
  available: boolean;
  status: string;
  message: string;
}> {
  const status = await checkSummarizerAvailability();
  
  const messages: Record<string, string> = {
    'readily': '✅ Chrome AI available, generating smart mind map',
    'available': '✅ Chrome AI available, generating smart mind map',
    'after-download': '⬇️ AI model needs to be downloaded',
    'downloadable': '⬇️ AI model needs to be downloaded',
    'no': '❌ AI unavailable, using basic algorithm',
    'unavailable': '❌ AI unavailable, using basic algorithm'
  };

  return {
    available: status === 'readily' || status === 'available',
    status,
    message: messages[status] || messages['no']
  };
}

