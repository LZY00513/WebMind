// 共享类型定义

export interface Note {
  id: string;
  content: string;
  summary?: string; // 可选，因为可能还未生成摘要
  url: string;
  title: string;
  timestamp: number;
  tags?: string[];
  status: 'pending' | 'summarized' | 'connected'; // 笔记状态：待处理、已总结、已连接
  relatedNotes?: string[]; // 相关笔记的 ID
}

export interface MindMapNode {
  id: string;
  label: string;
  noteId: string;
  connections: string[]; // IDs of connected nodes
}

// Chrome Summarizer API 类型定义（官方规范）
// 注意：目前 Chrome Built-in AI 只支持 en、es、ja，不支持中文
export interface SummarizerOptions {
  type?: 'key-points' | 'tldr' | 'teaser' | 'headline';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
}

// 全局类型定义已移至 global.d.ts

// 消息类型定义
export enum MessageType {
  COLLECT_TEXT = 'COLLECT_TEXT', // 收集文本（不总结）
  SUMMARIZE_NOTES = 'SUMMARIZE_NOTES', // 批量总结笔记
  SAVE_NOTE = 'SAVE_NOTE',
  GET_NOTES = 'GET_NOTES',
  DELETE_NOTE = 'DELETE_NOTE',
  OPEN_SIDEPANEL = 'OPEN_SIDEPANEL',
  CONNECT_NOTES = 'CONNECT_NOTES', // 连接相关笔记
  UPDATE_NOTE = 'UPDATE_NOTE', // 更新笔记
}

export interface Message {
  type: MessageType;
  payload?: any;
}

export interface SummarizeRequest {
  text: string;
  url: string;
  title: string;
}

export interface SummarizeResponse {
  summary: string;
  noteId: string;
}

