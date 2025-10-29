// Chrome Summarizer API 工具函数
import { SummarizerOptions } from '../types';

/**
 * 检查 Summarizer API 是否可用
 */
export async function checkAIAvailability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'> {
  if (!('Summarizer' in self)) {
    return 'unavailable';
  }

  try {
    const availability = await (self as any).Summarizer.availability();
    return availability;
  } catch (error) {
    console.error('检查 Summarizer API 可用性失败:', error);
    return 'unavailable';
  }
}

/**
 * 创建摘要生成器
 */
export async function createSummarizer(
  options?: SummarizerOptions & { onDownloadProgress?: (progress: number) => void }
): Promise<any | null> {
  if (!('Summarizer' in self)) {
    console.error('Summarizer API 不可用');
    return null;
  }

  try {
    // 检查用户激活状态
    if (!navigator.userActivation?.isActive) {
      console.warn('⚠️ 需要用户交互才能创建摘要生成器');
      throw new Error('需要用户交互才能创建摘要生成器');
    }

    // 创建摘要生成器
    // 注意：Chrome Built-in AI 目前只支持 en、es、ja，不支持中文
    const summarizer = await (self as any).Summarizer.create({
      type: options?.type || 'tldr',
      format: options?.format || 'plain-text',
      length: options?.length || 'medium',
      sharedContext: options?.sharedContext || 'Web content summary',
      monitor(m: any) {
        m.addEventListener('downloadprogress', (e: any) => {
          options?.onDownloadProgress?.(e.loaded);
          console.log(`📥 已下载 ${Math.round(e.loaded * 100)}%`);
        });
      }
    });

    return summarizer;
  } catch (error) {
    console.error('创建摘要生成器失败:', error);
    return null;
  }
}

/**
 * 生成文本摘要
 */
export async function summarizeText(
  text: string,
  options?: SummarizerOptions & { onDownloadProgress?: (progress: number) => void }
): Promise<string> {
  const summarizer = await createSummarizer(options);
  
  if (!summarizer) {
    throw new Error('无法创建摘要生成器');
  }

  try {
    // 移除 HTML 标记
    const cleanText = text.replace(/<[^>]*>/g, '');
    
    // 生成摘要
    // 注意：Chrome Built-in AI 目前不支持中文输出
    const summary = await summarizer.summarize(cleanText);

    return summary;
  } catch (error) {
    console.error('生成摘要失败:', error);
    throw error;
  }
}

/**
 * 提取文本中的关键主题（用于思维导图）
 */
export async function extractTopics(text: string): Promise<string[]> {
  try {
    const summarizer = await createSummarizer({
      type: 'key-points',
      format: 'plain-text',
      length: 'short'
    });

    if (!summarizer) {
      return extractKeywordsSimple(text);
    }

    const points = await summarizer.summarize(text);
    return points.split('\n').map((point: string) => point.replace(/^[•-]\s*/, ''));
  } catch (error) {
    console.error('提取主题失败:', error);
    return extractKeywordsSimple(text);
  }
}

/**
 * 简单的关键词提取（降级方案）
 */
function extractKeywordsSimple(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 4);
  
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

