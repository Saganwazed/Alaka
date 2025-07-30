import React, { useState, useRef, useEffect } from 'react';
import { Send, Command, Mic, MicOff, FileText, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { Message } from '../types';
import { TypingAnimation } from './TypingAnimation';
import { useOllama } from '../hooks/useOllama';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onRegenerateResponse: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onOpenCommandBar: () => void;
  theme: any;
  sidebarOpen: boolean;
  documentMode: boolean;
  voiceInputActive: boolean;
  onToggleDocumentMode: () => void;
  onToggleVoiceInput: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onRegenerateResponse,
  onDeleteMessage,
  onOpenCommandBar,
  theme,
  sidebarOpen,
  documentMode,
  voiceInputActive,
  onToggleDocumentMode,
  onToggleVoiceInput,
}) => {
  const { isConnected, isLoading, settings: ollamaSettings, error, checkConnection } = useOllama();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onOpenCommandBar();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '20px';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const getBackgroundStyle = () => {
    const baseStyle: React.CSSProperties = {};
    
    if (theme.backgroundType === 'gradient') {
      baseStyle.background = theme.backgroundGradient;
    } else if (theme.backgroundType === 'image' && theme.backgroundImage) {
      baseStyle.backgroundImage = `url(${theme.backgroundImage})`;
      baseStyle.backgroundSize = 'cover';
      baseStyle.backgroundPosition = 'center';
      if (theme.backgroundBlur > 0) {
        baseStyle.filter = `blur(${theme.backgroundBlur}px)`;
      }
    } else {
      baseStyle.backgroundColor = theme.backgroundColor;
    }
    
    if (theme.backgroundOpacity < 1) {
      baseStyle.opacity = theme.backgroundOpacity;
    }
    
    return baseStyle;
  };

  return (
    <div 
      className="flex-1 flex flex-col transition-all duration-300 pt-12 min-h-screen"
      style={getBackgroundStyle()}
    >
      {/* Header with Alaka name and mode toggle */}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              {/* Ollama Status */}
              {ollamaSettings.enabled && (
                <div className="mb-6">
                  {isConnected ? (
                    <div className="flex items-center justify-center gap-2 text-green-400 text-sm bg-green-400/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-green-400/20">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Connected to Ollama</span>
                      {ollamaSettings.selectedModel && (
                        <span className="text-green-300">• {ollamaSettings.selectedModel}</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-red-400/20">
                      <AlertCircle size={16} />
                      <span>Ollama not connected</span>
                      <button
                        onClick={checkConnection}
                        disabled={isLoading}
                        className="ml-2 px-2 py-0.5 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-red-300 hover:text-red-200 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1 hover:underline"
                        title="Retry connection to Ollama"
                      >
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {isLoading ? 'Connecting...' : 'Retry'}
                      </button>
                    </div>
                  )}
                  
                  {/* Running Locally Status */}
                  <div className="mt-3 flex justify-center">
                    <span className="text-green-400 flex items-center gap-1 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Running locally
                    </span>
                  </div>
                </div>
              )}
              
              <p className="text-2xl text-gray-300 mb-2 font-light">Your private, offline AI companion</p>
              <p className="text-gray-500 mb-8">Start a conversation or press ⌘K for quick actions</p>
              <div className="flex items-center justify-center gap-3 text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <Command size={16} />
                <span>Command Palette</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4 px-4 py-2">
            {messages.map((message) => (
              <div key={message.id}>
                {message.type === 'user' ? (
                  <div className="text-right text-blue-200 font-medium max-w-[70ch] ml-auto">
                    {message.content}
                  </div>
                ) : (
                  <div className="text-left text-gray-300 leading-relaxed max-w-[70ch]">
                    {message.isTyping ? (
                      <TypingAnimation text={message.content} />
                    ) : (
                      message.content
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-700/30 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="relative">
          <div 
            className={`flex items-end gap-2 p-2 rounded-2xl shadow-2xl transition-all duration-200 hover:shadow-3xl ${
              theme.glassmorphism 
                ? 'bg-white/8 backdrop-blur-xl border border-white/20' 
                : 'bg-gray-800/90 border border-gray-600'
            }`}
          >
            <button
              type="button"
              onClick={onToggleVoiceInput}
              className={`p-1.5 rounded-xl transition-all ${
                voiceInputActive
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title={voiceInputActive ? "Stop voice input" : "Start voice input"}
            >
              {voiceInputActive ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={documentMode ? "Start writing your document..." : "Type your message..."}
              className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none min-h-[16px] max-h-[60px] leading-relaxed"
              style={{
                fontFamily: theme.fontFamily,
                fontSize: `${theme.fontSize}px`,
              }}
            />
            
            <button
              type="submit"
              disabled={!input.trim()}
              title="Send message"
              className={`p-2 rounded-xl transition-all transform hover:scale-105 active:scale-95 ${
                input.trim()
                  ? 'shadow-lg hover:shadow-xl'
                  : 'bg-gray-600 cursor-not-allowed opacity-50'
              }`}
              style={input.trim() ? { 
                backgroundColor: theme.accentColor,
                boxShadow: `0 4px 20px ${theme.accentColor}40`
              } : {}}
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};