import React, { useState } from 'react';
import { 
  Server, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Thermometer,
  Sliders,
  Hash,
  Type
} from 'lucide-react';
import { useOllama } from '../hooks/useOllama';

interface OllamaSettingsProps {
  theme: any;
}

export const OllamaSettings: React.FC<OllamaSettingsProps> = ({ theme }) => {
  const {
    isConnected,
    isLoading,
    models,
    settings,
    error,
    checkConnection,
    fetchModels,
    pullModel,
    updateSettings,
  } = useOllama();

  const [pullModelName, setPullModelName] = useState('');
  const [pullProgress, setPullProgress] = useState('');
  const [isPulling, setIsPulling] = useState(false);

  const handlePullModel = async () => {
    if (!pullModelName.trim()) return;
    
    setIsPulling(true);
    setPullProgress('Starting download...');
    
    try {
      await pullModel(pullModelName.trim(), (progress) => {
        setPullProgress(progress);
      });
      setPullModelName('');
      setPullProgress('');
    } catch (error) {
      setPullProgress('Failed to download model');
    } finally {
      setIsPulling(false);
    }
  };

  const popularModels = [
    'llama3.2:3b',
    'llama3.2:1b',
    'mistral:7b',
    'phi3:mini',
    'gemma2:2b',
    'qwen2.5:3b',
    'codellama:7b',
  ];

  return (
    <div className="space-y-6">
      {/* Ollama Connection */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Server size={20} />
          Ollama Connection
        </h3>
        
        <div className="space-y-4">
          {/* Enable/Disable Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500/20"
            />
            <div>
              <span className="text-white font-medium">Enable Ollama Backend</span>
              <p className="text-xs text-gray-400">Use local Ollama models for chat</p>
            </div>
          </label>

          {settings.enabled && (
            <>
              {/* Connection Status */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                {isConnected ? (
                  <CheckCircle size={20} className="text-green-400" />
                ) : (
                  <AlertCircle size={20} className="text-red-400" />
                )}
                <div className="flex-1">
                  <div className="text-white font-medium">
                    {isConnected ? 'Connected to Ollama' : 'Not Connected'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {isConnected ? 'localhost:11434' : 'Please start Ollama service'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={checkConnection}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-blue-300 hover:text-blue-200 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5"
                    title="Retry connection to Ollama"
                  >
                    <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                    {isLoading ? 'Connecting...' : 'Retry'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Model Selection */}
      {settings.enabled && isConnected && (
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Model Selection</h3>
          
          <div className="space-y-4">
            {/* Available Models */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Available Models ({models.length})
              </label>
              <select
                value={settings.selectedModel}
                onChange={(e) => updateSettings({ selectedModel: e.target.value })}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select a model...</option>
                {models.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name} ({(model.size / 1024 / 1024 / 1024).toFixed(1)}GB)
                  </option>
                ))}
              </select>
            </div>

            {/* Pull New Model */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Download New Model
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pullModelName}
                  onChange={(e) => setPullModelName(e.target.value)}
                  placeholder="e.g., llama3.2:3b"
                  className="flex-1 p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  onClick={handlePullModel}
                  disabled={!pullModelName.trim() || isPulling}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isPulling ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  Pull
                </button>
              </div>
              
              {pullProgress && (
                <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-sm">
                  {pullProgress}
                </div>
              )}

              {/* Popular Models */}
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-2">Popular models:</p>
                <div className="flex flex-wrap gap-2">
                  {popularModels.map((model) => (
                    <button
                      key={model}
                      onClick={() => setPullModelName(model)}
                      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Parameters */}
      {settings.enabled && isConnected && settings.selectedModel && (
        <div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Sliders size={20} />
            Model Parameters
          </h3>
          
          <div className="space-y-4">
            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Thermometer size={16} />
                Temperature: {settings.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Focused</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>

            {/* Top P */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Top P: {settings.topP}
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={settings.topP}
                onChange={(e) => updateSettings({ topP: parseFloat(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Top K */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Hash size={16} />
                Top K: {settings.topK}
              </label>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={settings.topK}
                onChange={(e) => updateSettings({ topK: parseInt(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Type size={16} />
                Max Tokens: {settings.maxTokens}
              </label>
              <input
                type="range"
                min="256"
                max="4096"
                step="256"
                value={settings.maxTokens}
                onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};