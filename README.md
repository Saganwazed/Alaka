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
2. **macOS Device** (Intel or Apple Silicon) — The bundled version currently natively supports macOS.

*Note: You do not need to install Ollama or download any models manually! The official macOS Ollama binary and the `tinyllama` model are bundled directly inside the app.*

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
           │ HTTP (127.0.0.1:11435)
┌──────────▼──────────────────────┐
│  Bundled Ollama Server          │
│  (spawned by main process on    │
│   dedicated port 11435)         │
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

## Ollama Integration (Bundled)

Alaka significantly simplifies the AI experience by **bundling the Ollama engine and a base LLM (TinyLlama)** directly into the application. There is no need for users to install any external tools!

1. **On startup**: The Electron main process launches the bundled Ollama macOS executable located in the app's `Resources` folder.
2. **Port Conflict Avoidance**: To ensure Alaka works flawlessly—even if you already have Ollama installed globally—our internal engine serves on a dedicated port: `11435`.
3. **Model Auto-Provisioning**: On the very first launch, Alaka automatically copies the pre-bundled `tinyllama` model weights into your user data directory (`~/Library/Application Support/Alaka/ollama-models`). This ensures the model is ready offline instantly, while keeping the folder writable so you can download more models later.
4. **On quit**: Gracefully terminates the sandbox Ollama process.

The frontend communicates exclusively with this bundled instance at `http://127.0.0.1:11435`:
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
