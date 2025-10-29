// 本地存储工具函数
import { Note } from '../types';

const STORAGE_KEY = 'webmind_notes';

/**
 * 保存笔记到 chrome.storage.local
 */
export async function saveNote(note: Note): Promise<void> {
  const notes = await getAllNotes();
  notes.push(note);
  await chrome.storage.local.set({ [STORAGE_KEY]: notes });
}

/**
 * 获取所有笔记
 */
export async function getAllNotes(): Promise<Note[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

/**
 * 根据 ID 获取笔记
 */
export async function getNoteById(id: string): Promise<Note | null> {
  const notes = await getAllNotes();
  return notes.find(note => note.id === id) || null;
}

/**
 * 删除笔记
 */
export async function deleteNote(id: string): Promise<void> {
  const notes = await getAllNotes();
  const filtered = notes.filter(note => note.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
}

/**
 * 更新笔记
 */
export async function updateNote(id: string, updates: Partial<Note>): Promise<void> {
  const notes = await getAllNotes();
  const index = notes.findIndex(note => note.id === id);
  if (index !== -1) {
    notes[index] = { ...notes[index], ...updates };
    await chrome.storage.local.set({ [STORAGE_KEY]: notes });
  }
}

/**
 * 清空所有笔记
 */
export async function clearAllNotes(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY);
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

