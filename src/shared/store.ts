// 使用 Zustand 进行状态管理
import { create } from 'zustand';
import { Note } from './types';
import { getAllNotes, saveNote, deleteNote as deleteNoteFromStorage } from './utils/storage';

interface AppState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadNotes: () => Promise<void>;
  addNote: (note: Note) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  notes: [],
  loading: false,
  error: null,

  loadNotes: async () => {
    set({ loading: true, error: null });
    try {
      const notes = await getAllNotes();
      set({ notes, loading: false });
    } catch (error) {
      set({ error: '加载笔记失败', loading: false });
      console.error('加载笔记失败:', error);
    }
  },

  addNote: async (note: Note) => {
    try {
      await saveNote(note);
      set((state) => ({ notes: [...state.notes, note] }));
    } catch (error) {
      set({ error: '保存笔记失败' });
      console.error('保存笔记失败:', error);
    }
  },

  removeNote: async (id: string) => {
    try {
      await deleteNoteFromStorage(id);
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
      }));
    } catch (error) {
      set({ error: '删除笔记失败' });
      console.error('删除笔记失败:', error);
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

