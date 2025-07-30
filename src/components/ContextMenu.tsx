import React, { useEffect, useRef } from 'react';
import { Trash2, Share2, Edit2, Copy, Archive, Pin, Star } from 'lucide-react';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  options: ContextMenuOption[];
  theme: any;
}

interface ContextMenuOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  options,
  theme,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuStyle = theme.glassmorphism
    ? {
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }
    : {
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
      };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-48 py-2 rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: position.x,
        top: position.y,
        ...menuStyle,
      }}
    >
      {options.map((option, index) => (
        <button
          key={option.id}
          onClick={() => {
            option.action();
            onClose();
          }}
          disabled={option.disabled}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
            option.variant === 'danger'
              ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
              : option.disabled
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-gray-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex-shrink-0">{option.icon}</div>
          <span className="text-sm font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = React.useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    options: ContextMenuOption[];
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    options: [],
  });

  const openContextMenu = (
    event: React.MouseEvent,
    options: ContextMenuOption[]
  ) => {
    event.preventDefault();
    event.stopPropagation();
    
    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      options,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
  };
};

export type { ContextMenuOption };