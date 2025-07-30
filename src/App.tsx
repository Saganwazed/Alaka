import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { CommandBar } from './components/CommandBar';
import { SettingsPanel } from './components/SettingsPanel';
import { CustomizationPanel } from './components/CustomizationPanel';
import { useChat } from './hooks/useChat';
import { useSettings } from './hooks/useSettings';

function App() {
  const {
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
  } = useChat();

  const {
    settings,
    theme,
    uiState,
    models,
    updateSettings,
    updateTheme,
    updateUIState,
    toggleSidebar,
    toggleCommandBar,
  } = useSettings();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandBar();
      }
      // New chat
      else if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        createSession();
      }
      // Settings
      else if (e.key === ',' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        updateUIState({ settingsOpen: true });
      }
      // Customization
      else if (e.key === 't' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        updateUIState({ customizationOpen: true });
      }
      // Toggle sidebar
      else if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
      // Prompt engineering mode
      else if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        updateUIState({ promptEngineeringMode: !uiState.promptEngineeringMode });
      }
      // Developer mode
      else if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        updateUIState({ developerMode: !uiState.developerMode });
      }
      // Close modals with Escape
      else if (e.key === 'Escape') {
        updateUIState({
          commandBarOpen: false,
          settingsOpen: false,
          customizationOpen: false,
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    toggleCommandBar,
    createSession,
    updateUIState,
    toggleSidebar,
    uiState.promptEngineeringMode,
    uiState.developerMode,
  ]);

  // Apply theme styles
  useEffect(() => {
    document.documentElement.style.setProperty('--font-family', theme.fontFamily);
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);
  }, [theme]);

  const backgroundStyle = theme.backgroundType === 'gradient'
    ? { background: theme.backgroundGradient }
    : theme.backgroundType === 'image' && theme.backgroundImage
    ? { 
        backgroundImage: `url(${theme.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundColor: theme.backgroundColor };

  return (
    <div 
      className="min-h-screen h-screen flex text-white overflow-hidden bg-black"
      style={backgroundStyle}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={uiState.sidebarOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onToggle={toggleSidebar}
        onSessionSelect={setActiveSessionId}
        onCreateSession={createSession}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        onOpenSettings={() => updateUIState({ settingsOpen: true })}
        onOpenCustomization={() => updateUIState({ customizationOpen: true })}
        theme={theme}
      />

      {/* Main Chat Interface */}
      <ChatInterface
        messages={activeSession?.messages || []}
        onSendMessage={sendMessage}
        onRegenerateResponse={regenerateResponse}
        onDeleteMessage={deleteMessage}
        onOpenCommandBar={toggleCommandBar}
        theme={theme}
        sidebarOpen={uiState.sidebarOpen}
        documentMode={uiState.documentMode}
        voiceInputActive={uiState.voiceInputActive}
        onToggleDocumentMode={() => updateUIState({ documentMode: !uiState.documentMode })}
        onToggleVoiceInput={() => updateUIState({ voiceInputActive: !uiState.voiceInputActive })}
      />

      {/* Command Bar */}
      <CommandBar
        isOpen={uiState.commandBarOpen}
        onClose={() => updateUIState({ commandBarOpen: false })}
        onCreateSession={createSession}
        onOpenSettings={() => {
          updateUIState({ settingsOpen: true, commandBarOpen: false });
        }}
        onOpenCustomization={() => {
          updateUIState({ customizationOpen: true, commandBarOpen: false });
        }}
        onTogglePromptEngineering={() => {
          updateUIState({ promptEngineeringMode: !uiState.promptEngineeringMode });
        }}
        onToggleDeveloperMode={() => {
          updateUIState({ developerMode: !uiState.developerMode });
        }}
        theme={theme}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={uiState.settingsOpen}
        settings={settings}
        models={models}
        onClose={() => updateUIState({ settingsOpen: false })}
        onUpdateSettings={updateSettings}
        theme={theme}
      />

      {/* Customization Panel */}
      <CustomizationPanel
        isOpen={uiState.customizationOpen}
        theme={theme}
        onClose={() => updateUIState({ customizationOpen: false })}
        onUpdateTheme={updateTheme}
      />

      {/* Developer Mode Indicator */}
      {uiState.developerMode && (
        <div className="fixed bottom-4 right-4 px-3 py-1 bg-green-600 text-white text-xs rounded-full">
          Developer Mode
        </div>
      )}

      {/* Prompt Engineering Mode Indicator */}
      {uiState.promptEngineeringMode && (
        <div className="fixed bottom-4 right-20 px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
          Prompt Engineering
        </div>
      )}
      
      {/* Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center py-2 px-6 bg-black backdrop-blur-md border-b border-neutral-800">
        <h1 className="text-2xl font-serif text-white tracking-wide font-light">
          Alaka
        </h1>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600/15 backdrop-blur-sm border border-green-600/30 text-green-400 text-xs font-medium rounded-full shadow-sm">
          <span className="text-sm">🛡️</span>
          <span>Offline & Private</span>
        </div>
      </div>
      
      {/* Ensure no white background bleeds through */}
      <div className="fixed inset-0 bg-black -z-10"></div>
    </div>
  );
}

export default App;