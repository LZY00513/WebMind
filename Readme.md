

# WebMind – AI-Powered Notes and Mind Map Assistant

**WebMind** is a Chrome extension that helps users capture and organize knowledge while browsing.
Using **Chrome’s Built-in AI (Summary API)**, it instantly summarizes highlighted text and visualizes connected ideas as an interactive mind map — turning scattered reading into structured understanding.

---

## Overview

WebMind integrates directly into Chrome, letting you highlight any passage, summarize it locally through built-in AI, and store the results in a privacy-safe note system.
Over time, related notes are automatically linked to form a personal knowledge graph inside the browser.

<img width="500" height="500" alt="webmind" src="https://github.com/user-attachments/assets/fd578497-5603-4b18-aa5e-95e64e51830d" />



### *Logo*

---
<img width="556" height="850" alt="截屏2025-10-30 上午1 48 02" src="https://github.com/user-attachments/assets/07a5144a-3cc6-46fb-a52c-e0e762a2a2f8" />

### *Main Page*
---

## Key Features

* **AI Text Summarization** – Highlight any text and instantly generate a concise summary.
* **Local Note Storage** – All data is stored locally with full privacy; no external APIs required.
* **Interactive Mind Maps** – Related notes are clustered and visualized with D3.js.
* **Offline and Fast** – Runs fully on-device via Chrome’s AI model.
* **Modern UI** – Built with React and Tailwind for a clean, responsive interface.







---

## Technology Stack

* **Frontend:** React 18 + TypeScript + Tailwind CSS
* **Build Tool:** Vite 5
* **State Management:** Zustand
* **Visualization:** D3.js
* **AI Engine:** Chrome Built-in AI (Summary API)
* **Storage:** Chrome Storage API
* **Extension Standard:** Manifest V3

---

## Project Structure

```text
WebMind/
├── src/
│   ├── background/      # Background service worker and offscreen logic
│   ├── content/         # Content scripts and selection listeners
│   ├── popup/           # Popup interface
│   ├── sidepanel/       # Side panel and mind-map components
│   └── shared/          # Shared types, store, and utils
├── public/icons/        # Extension icons
├── manifest.json        # Extension manifest
├── vite.config.ts       # Build configuration
└── README.md
```

---

## Getting Started

### Prerequisites

* Node.js ≥ 18
* Chrome ≥ 120 (with Built-in AI support)

### Enable Chrome Built-in AI

1. Go to `chrome://flags`
2. Enable:

   * *Summarization API for Gemini Nano*
   * *Prompt API for Gemini Nano*
3. Restart Chrome.

### Installation

```bash
npm install
npm run dev       # for development
npm run build     # for production build
```

### Load the Extension

1. Open `chrome://extensions/`
2. Turn on **Developer mode**
3. Click **Load unpacked** → select the `dist` folder

---

## Usage

1. Highlight any text on a webpage. 

<img width="440" height="322" alt="截屏2025-10-29 下午5 55 26" src="https://github.com/user-attachments/assets/25ddcdfb-a333-488a-a770-de42f4eaff4e" />

2. Click the popup button to summarize it.

<img width="281" height="475" alt="截屏2025-10-30 上午1 46 47" src="https://github.com/user-attachments/assets/d2c5970d-965c-4290-9274-e30ac4d245b6" />

2.1 add tag for the note

<img width="404" height="244" alt="截屏2025-10-30 上午1 58 41" src="https://github.com/user-attachments/assets/d00c272d-82b1-4c6b-85be-017bcd6647e5" />

3. View and manage notes in the **side panel**.

<img width="324" height="268" alt="截屏2025-10-29 下午5 57 25" src="https://github.com/user-attachments/assets/5273d302-1d6d-4534-9429-d905d5014af7" />



4. Switch to **Mind Map View** to explore relationships between topics.


<img width="357" height="410" alt="截屏2025-10-29 下午5 57 12" src="https://github.com/user-attachments/assets/c2c228dc-eac0-4717-b81c-e1e81b000dc4" />

5. Check **Stats** of notes

<img width="843" height="1044" alt="截屏2025-10-30 上午1 57 19" src="https://github.com/user-attachments/assets/0ca6d994-aabc-4b5d-8f20-8001bda021ad" />

---

## Implementation Highlights

### Example: AI Summarization

```typescript
const summarizer = await window.ai.summarizer.create({
  type: 'tl;dr',
  format: 'plain-text',
  length: 'medium',
});
const summary = await summarizer.summarize(text);
summarizer.destroy();
```

### Example: Local Storage

```typescript
await chrome.storage.local.set({ webmind_notes: notes });
const result = await chrome.storage.local.get('webmind_notes');
```

### Example: Mind Map Generation

* Extract keywords from all notes.
* Build nodes and edges based on co-occurrence.
* Render using D3’s force-directed layout for drag and zoom.

---

## Privacy & Security

* All AI processing runs locally in Chrome.
* No external API keys or server communication.
* Minimal permissions following Manifest V3 guidelines.

---

## Roadmap

* Tag-based filtering and search
* Note editing and Markdown export
* Customizable mind-map themes
* Multi-language summarization and translation
* Cross-device sync (optional)

---

## Development Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server
npm run type-check
npm run build     # production build
npm run preview   # preview built files
```

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit and push changes
4. Submit a Pull Request

---

## License

Released under the **MIT License** © 2025 Zhengyi Li

---

*(Insert footer image or demo screenshot placeholder)*
**WebMind — organized knowledge, right where you browse.**
