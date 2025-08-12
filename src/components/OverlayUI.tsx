import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeaderBar } from './HeaderBar';
import { FooterBar } from './FooterBar';

interface OverlayUIProps {
  currentPage: number;
  totalPages: number;
  onFileSelect: (file: File) => void;
  onVisibilityChange?: (isVisible: boolean) => void;
  onPageChange: (page: number) => void;
}

export const OverlayUI: React.FC<OverlayUIProps> = ({ 
  currentPage, 
  totalPages,
  onFileSelect,
  onVisibilityChange,
  onPageChange
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showUI = useCallback(() => {
    setIsVisible(true);
    onVisibilityChange?.(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      onVisibilityChange?.(false);
    }, 3000);
  }, [onVisibilityChange]);

  useEffect(() => {
    const handleMouseMove = () => showUI();
    const handleTouch = () => showUI();
    const handleKeyDown = () => showUI();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchstart', handleTouch);
    document.addEventListener('keydown', handleKeyDown);

    showUI();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showUI]);

  return (
    <>
      <HeaderBar isVisible={isVisible} onFileSelect={onFileSelect} />
      <FooterBar 
        isVisible={isVisible} 
        currentPage={currentPage} 
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
};