import { useState, useEffect, useCallback } from 'react';
import { ollamaService, OllamaModel, OllamaMessage } from '../services/ollama';

export interface OllamaSettings {
  enabled: boolean;
  selectedModel: string;
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
}

const defaultSettings: OllamaSettings = {
  enabled: true,
  selectedModel: '',
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxTokens: 2048,
};

export const useOllama = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [settings, setSettings] = useState<OllamaSettings>(() => {
    const saved = localStorage.getItem('ollama-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  const [error, setError] = useState<string | null>(null);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ollama-settings', JSON.stringify(settings));
  }, [settings]);

  const checkConnection = useCallback(async () => {
    if (!settings.enabled) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const connected = await ollamaService.checkConnection();
      setIsConnected(connected);
      
      if (!connected) {
        setError('Ollama is not running. Please launch it from your system.');
      }
      
      return connected;
    } catch (err) {
      setIsConnected(false);
      setError('Failed to connect to bundled Ollama. Please ensure it is running on port 11435');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [settings.enabled]);

  const fetchModels = useCallback(async () => {
    if (!isConnected || !settings.enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedModels = await ollamaService.getModels();
      setModels(fetchedModels);
      
      // Auto-select first model if none selected
      if (fetchedModels.length > 0 && !settings.selectedModel) {
        setSettings(prev => ({ ...prev, selectedModel: fetchedModels[0].name }));
      }
    } catch (err) {
      setError('Failed to fetch models from Ollama');
      console.error('Error fetching models:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, settings.enabled, settings.selectedModel]);

  const pullModel = useCallback(async (modelName: string, onProgress?: (progress: string) => void) => {
    if (!isConnected || !settings.enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await ollamaService.pullModel(modelName, onProgress);
      // Refresh models list after successful pull
      await fetchModels();
    } catch (err) {
      setError(`Failed to pull model: ${modelName}`);
      console.error('Error pulling model:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, settings.enabled, fetchModels]);

  const sendMessage = useCallback(async function* (
    messages: OllamaMessage[],
    modelOverride?: string
  ): AsyncGenerator<string, void, unknown> {
    if (!isConnected || !settings.enabled) {
      throw new Error('Ollama is not connected');
    }

    const model = modelOverride || settings.selectedModel;
    if (!model) {
      throw new Error('No model selected');
    }

    try {
      const stream = ollamaService.streamChat({
        model,
        messages,
        options: {
          temperature: settings.temperature,
          top_p: settings.topP,
          top_k: settings.topK,
          num_predict: settings.maxTokens,
        },
      });

      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (err) {
      setError('Failed to send message to Ollama');
      console.error('Error sending message:', err);
      throw err;
    }
  }, [isConnected, settings]);

  const updateSettings = useCallback((updates: Partial<OllamaSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize connection check
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Fetch models when connected
  useEffect(() => {
    if (isConnected) {
      fetchModels();
    }
  }, [isConnected, fetchModels]);

  return {
    isConnected,
    isLoading,
    models,
    settings,
    error,
    checkConnection,
    fetchModels,
    pullModel,
    sendMessage,
    updateSettings,
  };
};