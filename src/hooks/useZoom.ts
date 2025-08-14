import { useState, useCallback } from 'react';
import type { ZoomState, FitMode } from '../types/settings';
import { DEFAULT_ZOOM_STATE } from '../types/settings';

export const useZoom = () => {
  const [zoomState, setZoomState] = useState<ZoomState>(DEFAULT_ZOOM_STATE);

  const calculateFitScale = useCallback((
    pageWidth: number,
    pageHeight: number,
    containerWidth: number,
    containerHeight: number,
    fitMode: FitMode
  ): number => {
    switch (fitMode) {
      case 'width':
        return containerWidth / pageWidth;
      case 'height':
        return containerHeight / pageHeight;
      case 'page':
        return Math.min(containerWidth / pageWidth, containerHeight / pageHeight);
      case 'custom':
        return zoomState.scale;
      default:
        return 1.0;
    }
  }, [zoomState.scale]);

  const setFitMode = useCallback((fitMode: FitMode) => {
    setZoomState(prev => ({
      ...prev,
      fitMode,
      offsetX: 0,
      offsetY: 0,
    }));
  }, []);

  const setCustomScale = useCallback((scale: number) => {
    setZoomState(prev => {
      const clampedScale = Math.max(
        prev.minScale, 
        Math.min(prev.maxScale, scale)
      );
      
      return {
        ...prev,
        scale: clampedScale,
        fitMode: 'custom',
      };
    });
  }, []);

  const zoomIn = useCallback(() => {
    setZoomState(prev => {
      let baseScale = prev.scale;
      
      // fitModeがcustom以外の場合は、現在表示されている倍率を基準にする
      if (prev.fitMode !== 'custom') {
        baseScale = 1.0; // とりあえず1.0として、後で実際の表示倍率で更新
      }
      
      const newScale = baseScale * 1.25;
      const clampedScale = Math.max(
        prev.minScale, 
        Math.min(prev.maxScale, newScale)
      );
      
      return {
        ...prev,
        scale: clampedScale,
        fitMode: 'custom',
      };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoomState(prev => {
      let baseScale = prev.scale;
      
      // fitModeがcustom以外の場合は、現在表示されている倍率を基準にする
      if (prev.fitMode !== 'custom') {
        baseScale = 1.0; // とりあえず1.0として、後で実際の表示倍率で更新
      }
      
      const newScale = baseScale / 1.25;
      const clampedScale = Math.max(
        prev.minScale, 
        Math.min(prev.maxScale, newScale)
      );
      
      return {
        ...prev,
        scale: clampedScale,
        fitMode: 'custom',
      };
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoomState(prev => ({
      ...prev,
      fitMode: 'page',
      offsetX: 0,
      offsetY: 0,
    }));
  }, []);

  const setOffset = useCallback((offsetX: number, offsetY: number) => {
    setZoomState(prev => ({
      ...prev,
      offsetX,
      offsetY,
    }));
  }, []);

  const cycleFitMode = useCallback(() => {
    const modes: FitMode[] = ['page', 'width', 'height'];
    const currentIndex = modes.indexOf(zoomState.fitMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setFitMode(modes[nextIndex]);
  }, [zoomState.fitMode, setFitMode]);

  return {
    zoomState,
    calculateFitScale,
    setFitMode,
    setCustomScale,
    zoomIn,
    zoomOut,
    resetZoom,
    setOffset,
    cycleFitMode,
  };
};