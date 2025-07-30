import React from 'react';
import { X, Type, Palette, Image, Layout } from 'lucide-react';
import { Theme } from '../types';

interface CustomizationPanelProps {
  isOpen: boolean;
  theme: Theme;
  onClose: () => void;
  onUpdateTheme: (updates: Partial<Theme>) => void;
}

const fontOptions = [
  { value: '"Inter", system-ui, sans-serif', label: 'Inter' },
  { value: '"JetBrains Mono", monospace', label: 'JetBrains Mono' },
  { value: '"SF Pro Display", system-ui, sans-serif', label: 'SF Pro' },
  { value: '"IBM Plex Sans", system-ui, sans-serif', label: 'IBM Plex' },
  { value: 'system-ui, sans-serif', label: 'System Default' },
];

const accentColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  isOpen,
  theme,
  onClose,
  onUpdateTheme,
}) => {
  if (!isOpen) return null;

  const panelStyle = theme.glassmorphism
    ? {
        backgroundColor: 'rgba(8, 8, 8, 0.95)',
        backdropFilter: 'blur(32px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }
    : {
        backgroundColor: '#0f0f0f',
        border: '1px solid #2a2a2a',
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg"
        style={panelStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Customization</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Typography */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Type size={20} />
              Typography
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Font Family
                </label>
                <select
                  value={theme.fontFamily}
                  onChange={(e) => onUpdateTheme({ fontFamily: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Font Size: {theme.fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={theme.fontSize}
                  onChange={(e) => onUpdateTheme({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>12px</span>
                  <span>24px</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Line Spacing: {theme.lineSpacing}
                </label>
                <input
                  type="range"
                  min="1.2"
                  max="2.5"
                  step="0.1"
                  value={theme.lineSpacing}
                  onChange={(e) => onUpdateTheme({ lineSpacing: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Tight</span>
                  <span>Loose</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Padding: {theme.padding}px
                </label>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={theme.padding}
                  onChange={(e) => onUpdateTheme({ padding: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Compact</span>
                  <span>Spacious</span>
                </div>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Palette size={20} />
              Colors
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Accent Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {accentColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => onUpdateTheme({ accentColor: color })}
                      className={`w-10 h-10 rounded-xl border-2 transition-all hover:scale-110 ${
                        theme.accentColor === color 
                          ? 'border-white scale-110 shadow-lg' 
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom Color
                  </label>
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => onUpdateTheme({ accentColor: e.target.value })}
                    className="w-full h-12 bg-transparent border border-gray-600 rounded-xl cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Background */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Image size={20} />
              Background
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="backgroundType"
                    value="solid"
                    checked={theme.backgroundType === 'solid'}
                    onChange={(e) => onUpdateTheme({ backgroundType: e.target.value as any })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-white">Solid</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="backgroundType"
                    value="gradient"
                    checked={theme.backgroundType === 'gradient'}
                    onChange={(e) => onUpdateTheme({ backgroundType: e.target.value as any })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-white">Gradient</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="backgroundType"
                    value="image"
                    checked={theme.backgroundType === 'image'}
                    onChange={(e) => onUpdateTheme({ backgroundType: e.target.value as any })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-white">Image</span>
                </label>
              </div>

              {theme.backgroundType === 'solid' && (
                <input
                  type="color"
                  value={theme.backgroundColor}
                  onChange={(e) => onUpdateTheme({ backgroundColor: e.target.value })}
                  className="w-full h-12 bg-transparent border border-gray-600 rounded-xl cursor-pointer"
                />
              )}
              
              {theme.backgroundType === 'image' && (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          onUpdateTheme({ backgroundImage: e.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Blur: {theme.backgroundBlur}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={theme.backgroundBlur}
                      onChange={(e) => onUpdateTheme({ backgroundBlur: parseInt(e.target.value) })}
                      className="w-full accent-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Opacity: {Math.round(theme.backgroundOpacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={theme.backgroundOpacity}
                      onChange={(e) => onUpdateTheme({ backgroundOpacity: parseFloat(e.target.value) })}
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Effects */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Layout size={20} />
              Effects
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={theme.glassmorphism}
                  onChange={(e) => onUpdateTheme({ glassmorphism: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500/20"
                />
                <div>
                  <span className="text-white font-medium">Glassmorphism Effects</span>
                  <p className="text-xs text-gray-400">Adds blur and transparency to UI elements</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};