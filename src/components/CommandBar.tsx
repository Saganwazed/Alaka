import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Settings, Palette, Code, Zap } from 'lucide-react';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: () => void;
  onOpenSettings: () => void;
  onOpenCustomization: () => void;
  onTogglePromptEngineering: () => void;
  onToggleDeveloperMode: () => void;
  theme: any;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  isOpen,
  onClose,
  onCreateSession,
  onOpenSettings,
  onOpenCustomization,
  onTogglePromptEngineering,
  onToggleDeveloperMode,
  theme,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    {
      id: 'new-chat',
      title: 'New Chat',
      description: 'Start a new conversation',
      icon: <MessageSquare size={16} />,
      action: () => {
        onCreateSession();
        onClose();
      },
      shortcut: '⌘N',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure model and preferences',
      icon: <Settings size={16} />,
      action: () => {
        onOpenSettings();
        onClose();
      },
      shortcut: '⌘,',
    },
    {
      id: 'customization',
      title: 'Customization',
      description: 'Personalize the interface',
      icon: <Palette size={16} />,
      action: () => {
        onOpenCustomization();
        onClose();
      },
      shortcut: '⌘T',
    },
    {
      id: 'prompt-engineering',
      title: 'Toggle Prompt Engineering',
      description: 'Show/hide prompt structure',
      icon: <Code size={16} />,
      action: () => {
        onTogglePromptEngineering();
        onClose();
      },
      shortcut: '⌘P',
    },
    {
      id: 'developer-mode',
      title: 'Toggle Developer Mode',
      description: 'Access logs and debugging tools',
      icon: <Zap size={16} />,
      action: () => {
        onToggleDeveloperMode();
        onClose();
      },
      shortcut: '⌘D',
    },
  ];

  const filteredCommands = commands.filter(
    (command) =>
      command.title.toLowerCase().includes(search.toLowerCase()) ||
      command.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  const backdropStyle = theme.glassmorphism
    ? {
        backgroundColor: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }
    : {
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
      };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black/50">
      <div
        className="w-full max-w-lg rounded-lg shadow-2xl"
        style={backdropStyle}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
            autoFocus
          />
        </div>

        {/* Commands List */}
        <div className="max-h-80 overflow-y-auto">
          {filteredCommands.map((command, index) => (
            <button
              key={command.id}
              onClick={command.action}
              className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-600/20 border-l-2 border-blue-600'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="text-gray-400">{command.icon}</div>
              <div className="flex-1">
                <div className="text-white font-medium">{command.title}</div>
                <div className="text-gray-400 text-sm">{command.description}</div>
              </div>
              {command.shortcut && (
                <div className="text-gray-400 text-sm font-mono">
                  {command.shortcut}
                </div>
              )}
            </button>
          ))}
        </div>

        {filteredCommands.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No commands found for "{search}"
          </div>
        )}
      </div>
    </div>
  );
};