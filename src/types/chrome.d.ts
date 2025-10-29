// Chrome API 扩展类型定义
// 补充 @types/chrome 中缺失的新 API

declare namespace chrome {
  // Offscreen API (Chrome 109+)
  export namespace offscreen {
    export type Reason = 
      | 'AUDIO_PLAYBACK'
      | 'BLOBS'
      | 'CLIPBOARD'
      | 'DOM_PARSER'
      | 'DOM_SCRAPING'
      | 'IFRAME_SCRIPTING'
      | 'LOCAL_STORAGE'
      | 'MATCH_MEDIA'
      | 'TESTING'
      | 'WORKERS';

    export interface CreateParameters {
      url: string;
      reasons: Reason[];
      justification: string;
    }

    export function createDocument(
      parameters: CreateParameters
    ): Promise<void>;

    export function closeDocument(): Promise<void>;

    export function hasDocument(): Promise<boolean>;
  }

  // Side Panel API (Chrome 114+)
  export namespace sidePanel {
    export interface PanelOptions {
      path?: string;
      enabled?: boolean;
      tabId?: number;
    }

    export interface PanelBehavior {
      openPanelOnActionClick?: boolean;
    }

    export interface OpenOptions {
      tabId?: number;
      windowId?: number;
    }

    export function setOptions(options: PanelOptions): Promise<void>;
    export function getOptions(options: { tabId?: number }): Promise<PanelOptions>;
    export function setPanelBehavior(behavior: PanelBehavior): Promise<void>;
    export function getPanelBehavior(): Promise<PanelBehavior>;
    export function open(options: OpenOptions): Promise<void>;
  }

  // Runtime API 扩展
  export namespace runtime {
    export type ContextType = 
      | 'TAB'
      | 'POPUP'
      | 'BACKGROUND'
      | 'OFFSCREEN_DOCUMENT'
      | 'SIDE_PANEL'
      | 'DEV_TOOLS';

    export interface ContextFilter {
      contextTypes?: ContextType[];
      contextIds?: string[];
      documentIds?: string[];
      documentOrigins?: string[];
      documentUrls?: string[];
      frameIds?: number[];
      incognito?: boolean;
      tabIds?: number[];
      windowIds?: number[];
    }

    export interface ExtensionContext {
      contextType: ContextType;
      contextId: string;
      tabId: number;
      windowId: number;
      documentId?: string;
      frameId: number;
      documentUrl?: string;
      documentOrigin?: string;
      incognito: boolean;
    }

    export function getContexts(
      filter: ContextFilter
    ): Promise<ExtensionContext[]>;
  }
}

// Window AI API 类型定义（Chrome Built-in AI）
declare global {
  interface Window {
    ai?: {
      summarizer?: {
        create(options?: {
          type?: 'key-points' | 'tl;dr' | 'teaser' | 'headline';
          format?: 'plain-text' | 'markdown';
          length?: 'short' | 'medium' | 'long';
        }): Promise<{
          summarize(text: string): Promise<string>;
          destroy(): void;
        }>;
        capabilities(): Promise<{
          available: 'readily' | 'after-download' | 'no';
        }>;
      };
      languageModel?: {
        create(): Promise<{
          prompt(text: string): Promise<string>;
          destroy(): void;
        }>;
        capabilities(): Promise<{
          available: 'readily' | 'after-download' | 'no';
        }>;
      };
    };
  }
}

export {};

