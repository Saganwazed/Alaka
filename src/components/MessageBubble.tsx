import React, { useState } from 'react';
import { Copy, Edit, Trash2, RotateCcw } from 'lucide-react';
import { Message } from '../types';
import { TypingAnimation } from './TypingAnimation';

interface MessageBubbleProps {
  message: Message;
  theme: any;
  onRegenerate?: () => void;
  onDelete?: () => void;
  onEdit?: (content: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  theme,
  onRegenerate,
  onDelete,
  onEdit,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isUser = message.type === 'user';
  const baseClasses = `max-w-[75%] p-4 rounded-2xl relative group transition-all duration-200 hover:scale-[1.02] ${
    isUser ? 'ml-auto bg-gradient-to-br' : 'mr-auto'
  }`;

  const bubbleStyle = theme.glassmorphism
    ? {
        backgroundColor: isUser 
          ? `${theme.accentColor}25` 
          : 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isUser ? `${theme.accentColor}40` : 'rgba(255, 255, 255, 0.15)'}`,
        boxShadow: isUser 
          ? `0 8px 32px ${theme.accentColor}20` 
          : '0 8px 32px rgba(0, 0, 0, 0.3)',
      }
    : {
        backgroundColor: isUser 
          ? `${theme.accentColor}` 
          : 'rgba(255, 255, 255, 0.12)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  const handleEdit = () => {
    if (isEditing && onEdit) {
      onEdit(editContent);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  return (
    <div 
      className={`${baseClasses} transition-all duration-200`}
      style={bubbleStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-white resize-none outline-none"
          style={{
            fontFamily: theme.fontFamily,
            fontSize: `${theme.fontSize}px`,
            lineHeight: theme.lineSpacing,
          }}
          autoFocus
        />
      ) : (
        <div
          className="text-white whitespace-pre-wrap break-words"
          style={{
            fontFamily: theme.fontFamily,
            fontSize: `${theme.fontSize}px`,
            lineHeight: theme.lineSpacing,
          }}
        >
          {message.isTyping ? (
            <TypingAnimation text={message.content} />
          ) : (
            message.content
          )}
        </div>
      )}

      {/* Action buttons */}
      {(isHovered || isEditing) && !message.isTyping && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="p-1 rounded bg-black/20 hover:bg-black/40 transition-colors"
            title="Copy"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={handleEdit}
            className="p-1 rounded bg-black/20 hover:bg-black/40 transition-colors"
            title={isEditing ? "Save" : "Edit"}
          >
            <Edit size={12} />
          </button>
          {!isUser && onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-1 rounded bg-black/20 hover:bg-black/40 transition-colors"
              title="Regenerate"
            >
              <RotateCcw size={12} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 rounded bg-red-500/20 hover:bg-red-500/40 transition-colors"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {message.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
};