import React from 'react';
import { X, Cpu, Zap, Server, Monitor } from 'lucide-react';
import { Settings, LLMModel } from '../types';
import { OllamaSettings } from './OllamaSettings';

interface SettingsPanelProps {
  isOpen: boolean;
  settings: Settings;
  models: LLMModel[];
  onClose: () => void;
  onUpdateSettings: (updates: Partial<Settings>) => void;
  theme: any;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  settings,
  models,
  onClose,
  onUpdateSettings,
  theme,
}) => {
  if (!isOpen) return null;

  const panelStyle = theme.glassmorphism
    ? {
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }
    : {
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg"
        style={panelStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Model Selection */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Server size={20} />
              Language Model
            </h3>
            <div className="space-y-3">
              <select
                value={settings.model}
                onChange={(e) => onUpdateSettings({ model: e.target.value })}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.size}) - {model.description}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Running locally on your device</span>
              </div>
            </div>
          </div>

          {/* Context Window */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Context Window</h3>
            <div className="space-y-3">
              <input
                type="range"
                min="1024"
                max="8192"
                step="512"
                value={settings.contextWindow}
                onChange={(e) => onUpdateSettings({ contextWindow: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>1K tokens</span>
                <span className="text-white font-medium">{settings.contextWindow} tokens</span>
                <span>8K tokens</span>
              </div>
            </div>
          </div>

          {/* Token Limit */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Response Length</h3>
            <div className="space-y-3">
              <input
                type="range"
                min="256"
                max="4096"
                step="128"
                value={settings.tokenLimit}
                onChange={(e) => onUpdateSettings({ tokenLimit: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>Short</span>
                <span className="text-white font-medium">{settings.tokenLimit} tokens</span>
                <span>Long</span>
              </div>
            </div>
          </div>

          {/* Hardware Acceleration */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Zap size={20} />
              Hardware Acceleration
            </h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="hardware"
                  checked={settings.hardwareAcceleration}
                  onChange={() => onUpdateSettings({ hardwareAcceleration: true })}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-blue-400" />
                  <span className="text-white">GPU Acceleration</span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="hardware"
                  checked={!settings.hardwareAcceleration}
                  onChange={() => onUpdateSettings({ hardwareAcceleration: false })}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex items-center gap-2">
                  <Monitor size={16} className="text-gray-400" />
                  <span className="text-white">CPU Only</span>
                </div>
              </label>
            </div>
          </div>

          {/* Ollama Integration */}
          <OllamaSettings theme={theme} />

          {/* System Prompt */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">System Prompt</h3>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => onUpdateSettings({ systemPrompt: e.target.value })}
              className="w-full h-24 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Define the AI's behavior and personality..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};