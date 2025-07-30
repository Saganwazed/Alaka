import { useState, useCallback } from 'react';
import { Message, ChatSession } from '../types';
import { useOllama } from './useOllama';
import { OllamaMessage } from '../services/ollama';

export const useChat = () => {
  const { sendMessage: sendOllamaMessage, settings: ollamaSettings, isConnected } = useOllama();
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: '1',
      name: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [activeSessionId, setActiveSessionId] = useState('1');

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const createSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        createSession();
      }
    }
  }, [activeSessionId, sessions, createSession]);

  const renameSession = useCallback((sessionId: string, newName: string) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, name: newName, updatedAt: new Date() }
          : s
      )
    );
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      type: 'user',
      timestamp: new Date(),
    };

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      type: 'ai',
      timestamp: new Date(),
      isTyping: true,
    };

    setSessions(prev =>
      prev.map(s =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: [...s.messages, userMessage, aiMessage],
              updatedAt: new Date(),
              name: s.messages.length === 0 ? content.slice(0, 30) + '...' : s.name,
            }
          : s
      )
    );

    // Use Ollama if enabled and connected
    if (ollamaSettings.enabled && isConnected && ollamaSettings.selectedModel) {
      try {
        // Convert chat history to Ollama format
        const ollamaMessages: OllamaMessage[] = [
          {
            role: 'system',
            content: 'You are a helpful AI assistant running locally on the user\'s device.',
          },
          ...activeSession.messages.map((msg): OllamaMessage => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
          {
            role: 'user',
            content: content,
          },
        ];

        // Stream response from Ollama
        const stream = sendOllamaMessage(ollamaMessages);
        let fullResponse = '';

        for await (const chunk of stream) {
          fullResponse += chunk;
          setSessions(prev =>
            prev.map(s =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === aiMessage.id
                        ? { ...m, content: fullResponse, isTyping: true }
                        : m
                    ),
                  }
                : s
            )
          );
        }

        // Mark as complete
        setSessions(prev =>
          prev.map(s =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map(m =>
                    m.id === aiMessage.id
                      ? { ...m, content: fullResponse, isTyping: false }
                      : m
                  ),
                }
              : s
          )
        );
      } catch (error) {
        console.error('Ollama error:', error);
        // Fallback to mock response
        setSessions(prev =>
          prev.map(s =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map(m =>
                    m.id === aiMessage.id
                      ? { 
                          ...m, 
                          content: 'Sorry, I encountered an error connecting to Ollama. Please check your connection and try again.', 
                          isTyping: false 
                        }
                      : m
                  ),
                }
              : s
          )
        );
      }
    } else {
      // Fallback to mock response
      setTimeout(() => {
        const responses = [
          "I understand you're working with a local LLM. This is a sophisticated interface designed for offline AI interactions. How can I assist you today?",
          "As an offline AI assistant, I can help you with various tasks while maintaining your privacy and data security. What would you like to explore?",
          "This platform is designed to run large language models locally on your device. I'm here to demonstrate the capabilities of this modern interface.",
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        setSessions(prev =>
          prev.map(s =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map(m =>
                    m.id === aiMessage.id
                      ? { ...m, content: response, isTyping: false }
                      : m
                  ),
                }
              : s
          )
        );
      }, 2000);
    }
  }, [activeSession, activeSessionId, sendOllamaMessage, ollamaSettings, isConnected]);

  const regenerateResponse = useCallback(async (messageId: string) => {
    if (!activeSession) return;

    // Find the message to regenerate
    const messageIndex = activeSession.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Get the user message that prompted this response
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0) return;

    const userMessage = activeSession.messages[userMessageIndex];
    if (userMessage.type !== 'user') return;

    // Mark as regenerating
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: s.messages.map(m =>
                m.id === messageId
                  ? { ...m, content: '', isTyping: true }
                  : m
              ),
            }
          : s
      )
    );

    // Use Ollama if enabled and connected
    if (ollamaSettings.enabled && isConnected && ollamaSettings.selectedModel) {
      try {
        // Convert chat history up to the user message to Ollama format
        const historyMessages = activeSession.messages.slice(0, userMessageIndex + 1);
        const ollamaMessages: OllamaMessage[] = [
          {
            role: 'system',
            content: 'You are a helpful AI assistant running locally on the user\'s device.',
          },
          ...historyMessages.map((msg): OllamaMessage => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
        ];

        // Stream response from Ollama
        const stream = sendOllamaMessage(ollamaMessages);
        let fullResponse = '';

        for await (const chunk of stream) {
          fullResponse += chunk;
          setSessions(prev =>
            prev.map(s =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === messageId
                        ? { ...m, content: fullResponse, isTyping: true }
                        : m
                    ),
                  }
                : s
            )
          );
        }

        // Mark as complete
        setSessions(prev =>
          prev.map(s =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map(m =>
                    m.id === messageId
                      ? { ...m, content: fullResponse, isTyping: false }
                      : m
                  ),
                }
              : s
          )
        );
      } catch (error) {
        console.error('Ollama regeneration error:', error);
        // Fallback to mock response
        setTimeout(() => {
          setSessions(prev =>
            prev.map(s =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === messageId
                        ? { 
                            ...m, 
                            content: 'Sorry, I encountered an error while regenerating the response. Please try again.', 
                            isTyping: false 
                          }
                        : m
                    ),
                  }
                : s
            )
          );
        }, 1500);
      }
    } else {
      // Fallback to mock response
      setTimeout(() => {
        const responses = [
          "Let me provide a different perspective on that...",
          "Here's an alternative approach to consider...",
          "I can offer another way to think about this...",
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        setSessions(prev =>
          prev.map(s =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map(m =>
                    m.id === messageId
                      ? { ...m, content: response, isTyping: false }
                      : m
                  ),
                }
              : s
          )
        );
      }, 1500);
    }
  }, [activeSession, activeSessionId, sendOllamaMessage, ollamaSettings, isConnected]);

  const deleteMessage = useCallback((messageId: string) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: s.messages.filter(m => m.id !== messageId),
            }
          : s
      )
    );
  }, [activeSessionId]);

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createSession,
    deleteSession,
    renameSession,
    sendMessage,
    regenerateResponse,
    deleteMessage,
  };
};