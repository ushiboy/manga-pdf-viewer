import React from 'react';
import { Button } from '../ui/Button';

interface ZoomControlsProps {
  onZoomOut?: () => void;
  onZoomIn?: () => void;
  onToggleFitMode?: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomOut,
  onZoomIn,
  onToggleFitMode,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="ghost" 
        size="sm" 
        title="ズームアウト"
        onClick={onZoomOut}
        disabled={!onZoomOut}
      >
        ➖
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        title="ズームイン"
        onClick={onZoomIn}
        disabled={!onZoomIn}
      >
        ➕
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        title="フィット表示"
        onClick={onToggleFitMode}
        disabled={!onToggleFitMode}
      >
        🔍
      </Button>
    </div>
  );
};