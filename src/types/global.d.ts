/// <reference types="chrome"/>

declare namespace Chrome {
  export interface RuntimeMessage {
    type: string;
    payload: {
      text: string;
    };
  }
}

// Chrome Summarizer API 类型定义
declare interface Summarizer {
  availability(): Promise<'readily' | 'after-download' | 'no'>;
  create(options?: {
    type?: 'key-points' | 'tldr' | 'teaser' | 'headline';
    format?: 'plain-text' | 'markdown';
    length?: 'short' | 'medium' | 'long';
    expectedInputLanguages?: string[];
    outputLanguage?: string;
    expectedContextLanguages?: string[];
    sharedContext?: string;
    monitor?(m: { addEventListener(event: 'downloadprogress', callback: (e: { loaded: number }) => void): void }): void;
  }): Promise<{
    summarize(text: string, options?: { context?: string }): Promise<string>;
    summarizeStreaming(text: string, options?: { context?: string }): AsyncIterable<string>;
  }>;
}

declare interface Window {
  Summarizer: Summarizer;
}

// 扩展 chrome API 的类型定义
declare namespace chrome {
  export namespace storage {
    export interface StorageArea {
      get(keys?: string | string[] | Object | null): Promise<{ [key: string]: any }>;
      set(items: Object): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
    }
    export const local: StorageArea;
    export const sync: StorageArea;
    export const onChanged: {
      addListener(callback: (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => void): void;
    };
  }

  export namespace sidePanel {
    export function setOptions(options: { path?: string; enabled?: boolean }): Promise<void>;
    export function setPanelBehavior(options: { openPanelOnActionClick: boolean }): Promise<void>;
    export function open(options?: { tabId?: number }): Promise<void>;
  }

  export namespace offscreen {
    export type Reason = 'AUDIO_PLAYBACK' | 'BLOBS' | 'CLIPBOARD' | 'DOM_PARSER' | 'DOM_SCRAPING' | 'IFRAME_SCRIPTING' | 'LOCAL_STORAGE' | 'WORKERS';
    export function createDocument(options: { url: string; reasons: Reason[]; justification?: string }): Promise<void>;
  }

  export namespace tabs {
    export interface Tab {
      id?: number;
      url?: string;
      title?: string;
      active: boolean;
      windowId: number;
    }

    export function query(queryInfo: {
      active?: boolean;
      currentWindow?: boolean;
    }): Promise<Tab[]>;

    export function sendMessage(tabId: number, message: any): Promise<any>;
  }

  export namespace runtime {
    export type ContextType = 'TAB' | 'POPUP' | 'BACKGROUND' | 'OFFSCREEN_DOCUMENT' | 'SIDE_PANEL';
    
    export interface ContextFilter {
      contextTypes?: ContextType[];
      documentIds?: string[];
      documentOrigins?: string[];
      documentUrls?: string[];
      tabIds?: number[];
    }
    export interface MessageSender {
      tab?: chrome.tabs.Tab;
      frameId?: number;
      id?: string;
      url?: string;
      origin?: string;
      documentId?: string;
      documentLifecycle?: string;
      contextId?: string;
    }

    export function getContexts(filter: chrome.runtime.ContextFilter): Promise<chrome.runtime.ExtensionContext[]>;
    
    export const onInstalled: {
      addListener(callback: (details: {
        reason: string;
        previousVersion?: string;
        id?: string;
      }) => void): void;
    };

    export const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => void | boolean
      ): void;
    };
    
    export function sendMessage<T = any>(
      message: any,
      options?: { includeTlsChannelId?: boolean }
    ): Promise<T>;
}}
