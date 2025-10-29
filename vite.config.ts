import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

const isContentScript = process.env.TARGET === 'content';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'manifest.json',
          source: fs.readFileSync('manifest.json', 'utf-8'),
        });
      },
    },
    {
      name: 'copy-offscreen-html',
      generateBundle() {
        // 复制 offscreen.html 到 background 目录
        this.emitFile({
          type: 'asset',
          fileName: 'background/offscreen.html',
          source: fs.readFileSync('public/offscreen.html', 'utf-8'),
        });
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false, // ✅ 不清空 dist，防止覆盖 content
    cssCodeSplit: true,
    rollupOptions: {
      // ✅ 正确写法：key 包含路径，避免 dist/src 目录
      input: isContentScript
        ? { content: resolve(__dirname, 'src/content/content.ts') }
        : {
            'popup/index': resolve(__dirname, 'src/popup/index.html'),
            'sidepanel/index': resolve(__dirname, 'src/sidepanel/index.html'),
            background: resolve(__dirname, 'src/background/service-worker.ts'),
            offscreen: resolve(__dirname, 'src/background/offscreen.ts'),
          },
      output: {
        format: isContentScript ? 'iife' : 'es',
        inlineDynamicImports: isContentScript,
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'content') return 'content/content.js';
          if (chunkInfo.name === 'background') return 'background/service-worker.js';
          if (chunkInfo.name === 'offscreen') return 'background/offscreen.js';
          if (chunkInfo.name.startsWith('popup')) return 'popup/index.js';
          if (chunkInfo.name.startsWith('sidepanel')) return 'sidepanel/index.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'content.css') return 'content/content.css';
          return 'assets/[name]-[hash].[ext]';
        },
      },
    },
  },
});
