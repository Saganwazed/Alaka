# Alaka

**Local AI Chat Assistant — Fully Offline & Private**

Alaka is a desktop AI chat application built with Electron and React that connects to [Ollama](https://ollama.ai) for **completely local, private AI conversations**. No data ever leaves your machine.

![Beta 0](https://img.shields.io/badge/version-Beta%200-blue)
![macOS](https://img.shields.io/badge/platform-macOS-lightgrey)
![Electron](https://img.shields.io/badge/electron-28+-47848F)
![React](https://img.shields.io/badge/react-18-61DAFB)

---

## Features

### 💬 Chat Interface
- Multi-session conversations with sidebar navigation
- Real-time **streaming responses** with typewriter animation
- Message actions: copy, edit, regenerate, delete
- Auto-naming sessions from first message
- Image attachment support
- Export conversations to PDF-ready HTML

### 🧠 Brains Panel
- **Model Manager** — Download, delete, and switch between Ollama models from the UI
- **Model Parameters** — Fine-tune temperature, top-p, top-k, and max tokens
- **System Prompt** editor for custom AI behavior
- Context window and response length controls
- Hardware acceleration toggle (GPU / CPU)

### 🎨 Deep Customization
- **Typography** — Separate fonts for UI and AI responses (Quicksand, Inter, JetBrains Mono, etc.)
- **Colors** — Accent color picker with presets
- **Backgrounds** — Solid, gradient, or custom image with blur & opacity
- **Effects** — Glassmorphism toggle for frosted-glass UI panels

### ⚡ Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `⌘K` | Command Bar |
| `⌘N` | New Chat |
| `⌘,` | Settings |
| `⌘T` | Customization |
| `⌘B` | Toggle Sidebar |
| `⌘P` | Prompt Engineering Mode |
| `⌘D` | Developer Mode |

### 📦 Data Management
- Chat sessions persist across app restarts (localStorage)
- Archive and restore old conversations
- Export/import all chats as JSON
- Search across all messages
- Storage stats dashboard

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop Shell | [Electron](https://www.electronjs.org/) |
| Frontend | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| AI Backend | [Ollama](https://ollama.ai/) (local, `localhost:11434`) |
| Build Tool | [Vite](https://vitejs.dev/) |
| Packaging | [electron-builder](https://www.electron.build/) |

---

## Prerequisites

1. **Node.js** 18+ and npm
2. **Ollama** — Install from [ollama.ai](https://ollama.ai)
3. At least one Ollama model pulled (the app can do this for you, or run manually):
   ```bash
   ollama pull llama3.2:3b    # Lightweight, 2GB
   ollama pull mistral:7b     # High quality, 4.1GB
   ollama pull phi3:mini      # Fast, 1.3GB
   ```

---

## Getting Started

### Development

```bash
# Clone the repo
git clone https://github.com/Saganwazed/Alaka.git
cd Alaka

# Install dependencies
npm install

# Run the web app (React + Vite)
npm run dev

# Run as Electron desktop app (starts Vite + Electron together)
npm run electron:dev
```

### Production Build

```bash
# Build the React frontend
npm run build

# Package as macOS .app
npm run electron:build
```

The packaged `.app` will be in the `release/` directory.

---

## Project Structure

```
Alaka/
├── electron/                  # Electron main process
│   ├── main.cjs              # Main process (CommonJS, used in production)
│   ├── main.js               # Main process (ESM, used in development)
│   ├── preload.cjs            # Preload script (CommonJS)
│   ├── preload.js             # Preload script (ESM)
│   └── entitlements.mac.plist # macOS entitlements for code signing
├── src/                       # React frontend source
│   ├── App.tsx                # Root component
│   ├── main.tsx               # React entry point
│   ├── index.css              # Global styles + Tailwind
│   ├── components/            # UI components
│   │   ├── ChatInterface.tsx  # Main chat view
│   │   ├── Sidebar.tsx        # Session sidebar
│   │   ├── CommandBar.tsx     # ⌘K command palette
│   │   ├── MessageBubble.tsx  # Individual message
│   │   ├── TypingAnimation.tsx# Typewriter effect
│   │   ├── SettingsPanel.tsx  # Settings modal
│   │   ├── CustomizationPanel.tsx # Theme customization
│   │   ├── OllamaSettings.tsx # Ollama connection config
│   │   └── ContextMenu.tsx    # Right-click context menu
│   ├── hooks/                 # Custom React hooks
│   │   ├── useChat.ts         # Chat session management
│   │   ├── useOllama.ts       # Ollama API integration
│   │   └── useSettings.ts     # App settings & theme
│   ├── services/              # API services
│   │   └── ollama.ts          # Ollama HTTP client
│   └── types/                 # TypeScript types
│       └── index.ts           # Shared type definitions
├── index.html                 # Vite entry HTML
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## Architecture

### Electron Process Model

```
┌─────────────────────────────────┐
│         Main Process            │
│  (electron/main.cjs)            │
│                                 │
│  • Window management            │
│  • Ollama process lifecycle     │
│  • Native menus & dialogs       │
│  • IPC handlers                 │
└──────────┬──────────────────────┘
           │ IPC (contextBridge)
┌──────────▼──────────────────────┐
│       Renderer Process          │
│  (React SPA in dist/)           │
│                                 │
│  • Chat UI                      │
│  • Ollama API calls (HTTP)      │
│  • Settings & theming           │
│  • localStorage persistence     │
└─────────────────────────────────┘
           │ HTTP (localhost:11434)
┌──────────▼──────────────────────┐
│       Ollama Server             │
│  (spawned by main process)      │
│                                 │
│  • Local LLM inference          │
│  • Model management             │
│  • Streaming chat API           │
└─────────────────────────────────┘
```

### Key Patterns

- **Context-based state**: `OllamaProvider` → `OllamaContext` shares connection state across all components
- **Custom hooks**: `useChat`, `useOllama`, `useSettings` encapsulate all business logic
- **Service layer**: `OllamaService` class handles HTTP communication with the Ollama API
- **Persistence**: `ChatStorage` singleton manages localStorage read/write with auto-save

---

## Ollama Integration

Alaka automatically manages the Ollama server:

1. **On startup**: The main process checks if Ollama is running (`pgrep -f "ollama serve"`)
2. **If not running**: Spawns `ollama serve` as a child process
3. **If not installed**: Shows a dialog prompting the user to install from [ollama.ai](https://ollama.ai)
4. **On quit**: Gracefully terminates the spawned Ollama process

The frontend communicates directly with Ollama's REST API at `http://localhost:11434`:
- `GET /api/tags` — List installed models
- `POST /api/chat` — Send chat messages (streaming)
- `POST /api/pull` — Download new models

---

## License

MIT

---

## Acknowledgments

- [Ollama](https://ollama.ai) for making local LLM inference accessible
- [Electron](https://www.electronjs.org/) for the desktop shell
- [Lucide](https://lucide.dev/) for the beautiful icon set
- Built with ❤️ for privacy-first AI
