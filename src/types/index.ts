export interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LLMModel {
  id: string;
  name: string;
  size: string;
  description: string;
  isLocal: boolean;
}

export interface Settings {
  model: string;
  contextWindow: number;
  tokenLimit: number;
  hardwareAcceleration: boolean;
  systemPrompt: string;
  useOllama: boolean;
  ollamaModel: string;
}

export interface Theme {
  fontFamily: string;
  fontSize: number;
  lineSpacing: number;
  padding: number;
  accentColor: string;
  backgroundType: 'solid' | 'gradient' | 'image';
  backgroundColor: string;
  backgroundGradient: string;
  backgroundImage?: string;
  backgroundBlur: number;
  backgroundOpacity: number;
  glassmorphism: boolean;
}

export interface UIState {
  sidebarOpen: boolean;
  commandBarOpen: boolean;
  settingsOpen: boolean;
  customizationOpen: boolean;
  memoryTimelineOpen: boolean;
  systemPromptEditorOpen: boolean;
  promptEngineeringMode: boolean;
  developerMode: boolean;
  advancedMode: boolean;
  documentMode: boolean;
  voiceInputActive: boolean;
}