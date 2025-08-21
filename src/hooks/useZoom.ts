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
      scale: fitMode === 'custom' ? prev.scale : 1.0, // customでない場合はscaleをリセット
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

  const zoomIn = useCallback((currentDisplayScale?: number) => {
    setZoomState(prev => {
      let baseScale;
      
      if (prev.fitMode === 'custom') {
        // カスタムモードの場合は現在のスケールを基準にする
        baseScale = prev.scale;
      } else {
        // フィットモードの場合は、提供されたスケールまたは1.0を基準にする
        baseScale = currentDisplayScale || 1.0;
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
        offsetX: 0, // ズーム変更時はオフセットをリセット
        offsetY: 0,
      };
    });
  }, []);

  const zoomOut = useCallback((currentDisplayScale?: number) => {
    setZoomState(prev => {
      let baseScale;
      
      if (prev.fitMode === 'custom') {
        // カスタムモードの場合は現在のスケールを基準にする
        baseScale = prev.scale;
      } else {
        // フィットモードの場合は、提供されたスケールまたは1.0を基準にする
        baseScale = currentDisplayScale || 1.0;
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
        offsetX: 0, // ズーム変更時はオフセットをリセット
        offsetY: 0,
      };
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoomState(prev => ({
      ...prev,
      scale: 1.0, // scaleもリセット
      fitMode: 'page',
      offsetX: 0,
      offsetY: 0,
    }));
  }, []);

  const setOffset = useCallback((offsetX: number, offsetY: number, containerWidth?: number, containerHeight?: number, pageWidth?: number, pageHeight?: number) => {
    setZoomState(prev => {
      let clampedOffsetX = offsetX;
      let clampedOffsetY = offsetY;
      
      // パン範囲制限を適用（ページとコンテナサイズが提供された場合）
      if (containerWidth && containerHeight && pageWidth && pageHeight && prev.fitMode === 'custom') {
        const scaledPageWidth = pageWidth * prev.scale;
        const scaledPageHeight = pageHeight * prev.scale;
        
        // ページがコンテナより大きい場合のみ制限を適用
        if (scaledPageWidth > containerWidth) {
          const maxOffsetX = (scaledPageWidth - containerWidth) / 2;
          clampedOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, offsetX));
        } else {
          clampedOffsetX = 0; // ページがコンテナより小さい場合は中央固定
        }
        
        if (scaledPageHeight > containerHeight) {
          const maxOffsetY = (scaledPageHeight - containerHeight) / 2;
          clampedOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, offsetY));
        } else {
          clampedOffsetY = 0; // ページがコンテナより小さい場合は中央固定
        }
      }
      
      return {
        ...prev,
        offsetX: clampedOffsetX,
        offsetY: clampedOffsetY,
      };
    });
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