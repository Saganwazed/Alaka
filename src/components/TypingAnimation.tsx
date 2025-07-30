import React, { useState, useEffect } from 'react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({ 
  text, 
  speed = 50, 
  onComplete 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span>
      {displayText}
      {currentIndex < text.length && (
        <span className="inline-block w-0.5 h-4 bg-blue-400 ml-1 animate-pulse" />
      )}
    </span>
  );
};