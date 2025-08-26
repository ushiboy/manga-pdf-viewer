import React, { useEffect, useRef, useState } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useTouch } from '../../hooks/useTouch';
import { useAppContext } from '../../contexts';
import type { PdfDocument } from '../../types/pdf';

interface PdfCanvasProps {
  pdfDocument: PdfDocument;
}

export const PdfCanvas: React.FC<PdfCanvasProps> = ({ pdfDocument }) => {
  const {
    currentPage,
    isUIVisible,
    viewMode,
    readingDirection,
    treatFirstPageAsCover,
    zoomState,
    calculateFitScale,
    handlePageChange,
    goToPreviousPage,
    goToNextPage,
    handleZoomIn,
    handleZoomOut,
    handlePan
  } = useAppContext();
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const isRenderingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });

  const renderTasksRef = useRef<{
    single?: { cancel: () => void };
    left?: { cancel: () => void };
    right?: { cancel: () => void };
  }>({});

  const handleTouchPreviousPage = React.useCallback(() => {
    goToPreviousPage();
  }, [goToPreviousPage]);

  const handleTouchNextPage = React.useCallback(() => {
    goToNextPage();
  }, [goToNextPage]);

  const { handleTouchStart, handleTouchMove, handleTouchEnd, updatePanPosition } = useTouch({
    enabled: true,
    viewMode,
    readingDirection,
    isZoomed: zoomState?.fitMode === 'custom',
    onPreviousPage: handleTouchPreviousPage,
    onNextPage: handleTouchNextPage,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onPan: (deltaX, deltaY) => {
      handlePan(deltaX, deltaY);
    },
  });

  // PDF rendering logic (from original component)
  useEffect(() => {
    if (!pdfDocument?.document) return;

    const renderPage = async () => {
      try {
        // Prevent concurrent rendering
        if (isRenderingRef.current) return;
        
        isRenderingRef.current = true;
        setIsRendering(true);
        setRenderError(null);

        const tasks = renderTasksRef.current;
        
        // Cancel all previous tasks and wait for them to be cancelled
        const cancelPromises = [];
        if (tasks.single) {
          tasks.single.cancel();
          cancelPromises.push(Promise.resolve());
          tasks.single = undefined;
        }
        if (tasks.left) {
          tasks.left.cancel();
          cancelPromises.push(Promise.resolve());
          tasks.left = undefined;
        }
        if (tasks.right) {
          tasks.right.cancel();
          cancelPromises.push(Promise.resolve());
          tasks.right = undefined;
        }
        
        // Wait a brief moment to ensure cancellation is processed
        if (cancelPromises.length > 0) {
          await Promise.all(cancelPromises);
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        if (viewMode === 'single') {
          const leftCanvas = leftCanvasRef.current;
          if (!leftCanvas) return;

          const page = await pdfDocument.document.getPage(currentPage);
          const viewport = page.getViewport({ scale: 1 });
          
          // コンテナサイズを計算（元の実装に合わせて）
          const containerWidth = window.innerWidth - 32;
          const uiHeight = isUIVisible ? 120 : 16;
          const containerHeight = window.innerHeight - uiHeight;

          let scale = 1;
          if (zoomState) {
            if (zoomState.fitMode === 'custom') {
              scale = zoomState.scale;
            } else if (calculateFitScale) {
              scale = calculateFitScale(
                viewport.width,
                viewport.height,
                containerWidth,
                containerHeight,
                zoomState.fitMode
              );
            }
          }

          const scaledViewport = page.getViewport({ scale });
          const devicePixelRatio = window.devicePixelRatio || 1;
          
          // Clear canvas before setting new dimensions
          const context = leftCanvas.getContext('2d');
          if (!context) return;
          
          context.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
          
          leftCanvas.width = scaledViewport.width * devicePixelRatio;
          leftCanvas.height = scaledViewport.height * devicePixelRatio;
          leftCanvas.style.width = scaledViewport.width + 'px';
          leftCanvas.style.height = scaledViewport.height + 'px';

          context.scale(devicePixelRatio, devicePixelRatio);

          if (zoomState?.fitMode === 'custom') {
            const offsetX = zoomState.offsetX || 0;
            const offsetY = zoomState.offsetY || 0;
            leftCanvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
          } else {
            leftCanvas.style.transform = '';
          }

          const renderTask = page.render({
            canvasContext: context,
            viewport: scaledViewport,
          });

          tasks.single = renderTask;
          await renderTask.promise;
        } else {
          // Spread mode rendering logic
          const leftCanvas = leftCanvasRef.current;
          const rightCanvas = rightCanvasRef.current;
          if (!leftCanvas || !rightCanvas) return;

          let leftPageNum: number;
          let rightPageNum: number;

          if (treatFirstPageAsCover) {
            if (currentPage === 1) {
              leftPageNum = 1;
              rightPageNum = 0;
            } else {
              if (readingDirection === 'rtl') {
                leftPageNum = currentPage + 1;
                rightPageNum = currentPage;
              } else {
                leftPageNum = currentPage;
                rightPageNum = currentPage + 1;
              }
            }
          } else {
            if (readingDirection === 'rtl') {
              leftPageNum = currentPage + 1;
              rightPageNum = currentPage;
            } else {
              leftPageNum = currentPage;
              rightPageNum = currentPage + 1;
            }
          }

          const renderCanvas = async (canvas: HTMLCanvasElement, pageNum: number, taskKey: 'left' | 'right') => {
            if (pageNum <= 0 || pageNum > pdfDocument.numPages) {
              canvas.style.display = 'none';
              return;
            }

            canvas.style.display = 'block';

            const page = await pdfDocument.document.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1 });
            
            // コンテナサイズを計算（元の実装に合わせて）
            const containerWidth = window.innerWidth - 32;
            const uiHeight = isUIVisible ? 120 : 16;
            const containerHeight = window.innerHeight - uiHeight;
            
            // 見開き用のサイズ計算（コンテナ幅を2分割）
            const pageContainerWidth = containerWidth / 2;

            let scale = 1;
            if (zoomState) {
              if (zoomState.fitMode === 'custom') {
                scale = zoomState.scale;
              } else if (calculateFitScale) {
                scale = calculateFitScale(
                  viewport.width,
                  viewport.height,
                  pageContainerWidth,
                  containerHeight,
                  zoomState.fitMode
                );
              }
            }

            const scaledViewport = page.getViewport({ scale });
            const devicePixelRatio = window.devicePixelRatio || 1;
            
            // Clear canvas before setting new dimensions
            const context = canvas.getContext('2d');
            if (!context) return;
            
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            canvas.width = scaledViewport.width * devicePixelRatio;
            canvas.height = scaledViewport.height * devicePixelRatio;
            canvas.style.width = scaledViewport.width + 'px';
            canvas.style.height = scaledViewport.height + 'px';

            context.scale(devicePixelRatio, devicePixelRatio);

            if (zoomState?.fitMode === 'custom') {
              const offsetX = zoomState.offsetX || 0;
              const offsetY = zoomState.offsetY || 0;
              canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            } else {
              canvas.style.transform = '';
            }

            const renderTask = page.render({
              canvasContext: context,
              viewport: scaledViewport,
            });

            tasks[taskKey] = renderTask;
            await renderTask.promise;
          };

          await Promise.all([
            renderCanvas(leftCanvas, leftPageNum, 'left'),
            renderCanvas(rightCanvas, rightPageNum, 'right'),
          ]);
        }
      } catch (error) {
        console.error('PDF rendering error:', error);
        setRenderError('PDFの描画に失敗しました');
      } finally {
        isRenderingRef.current = false;
        setIsRendering(false);
      }
    };

    renderPage();

    return () => {
      const tasks = renderTasksRef.current;
      if (tasks.single) {
        tasks.single.cancel();
        tasks.single = undefined;
      }
      if (tasks.left) {
        tasks.left.cancel();
        tasks.left = undefined;
      }
      if (tasks.right) {
        tasks.right.cancel();
        tasks.right = undefined;
      }
    };
  }, [pdfDocument, currentPage, viewMode, zoomState, calculateFitScale, treatFirstPageAsCover, readingDirection]);

  // Mouse and pan interaction logic
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (!isDragging || !handlePan || !zoomState || zoomState.fitMode !== 'custom') return;
      
      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;
      
      if (Math.abs(deltaX - lastPanPosition.x) > 2 || Math.abs(deltaY - lastPanPosition.y) > 2) {
        const canvas = viewMode === 'single' ? leftCanvasRef.current : leftCanvasRef.current;
        const containerRect = canvas?.parentElement?.getBoundingClientRect();
        
        if (containerRect && canvas) {
          handlePan(
            deltaX - lastPanPosition.x,
            deltaY - lastPanPosition.y,
            containerRect.width,
            containerRect.height,
            canvas.offsetWidth,
            canvas.offsetHeight
          );
        }
        
        setLastPanPosition({ x: deltaX, y: deltaY });
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setLastPanPosition({ x: 0, y: 0 });
        document.body.style.cursor = '';
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, lastPanPosition, handlePan, zoomState, pdfDocument, viewMode, isUIVisible]);

  // Wheel event handling with non-passive listener
  useEffect(() => {
    const viewerContainer = document.getElementById('pdf-viewer-container');
    if (!viewerContainer) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
    
      // ズームイン/ズームアウトの処理
      if (event.deltaY < 0 && handleZoomIn) {
        // ズームイン - パラメータなしで呼び出す（useZoom内で自動計算）
        handleZoomIn();
      } else if (event.deltaY > 0 && handleZoomOut) {
        // ズームアウト - パラメータなしで呼び出す（useZoom内で自動計算）
        handleZoomOut();
      }
    };

    // Add wheel event listener with passive: false
    viewerContainer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      viewerContainer.removeEventListener('wheel', handleWheel);
    };
  }, [zoomState, handleZoomIn, handleZoomOut, calculateFitScale]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (zoomState?.fitMode === 'custom') {
      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
      setLastPanPosition({ x: 0, y: 0 });
      event.preventDefault();
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && handlePan && zoomState?.fitMode === 'custom') {
      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;
      
      if (Math.abs(deltaX - lastPanPosition.x) > 2 || Math.abs(deltaY - lastPanPosition.y) > 2) {
        const canvas = viewMode === 'single' ? leftCanvasRef.current : leftCanvasRef.current;
        const containerRect = canvas?.parentElement?.getBoundingClientRect();
        
        if (containerRect && canvas) {
          handlePan(
            deltaX - lastPanPosition.x,
            deltaY - lastPanPosition.y,
            containerRect.width,
            containerRect.height,
            canvas.offsetWidth,
            canvas.offsetHeight
          );
          updatePanPosition(deltaX - lastPanPosition.x, deltaY - lastPanPosition.y);
        }
        
        setLastPanPosition({ x: deltaX, y: deltaY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setLastPanPosition({ x: 0, y: 0 });
    document.body.style.cursor = '';
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || !handlePageChange || zoomState?.fitMode === 'custom') return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const clickPosition = x / rect.width;
    
    if (viewMode === 'single') {
      if (readingDirection === 'rtl') {
        if (clickPosition > 0.5 && currentPage < pdfDocument.numPages) {
          handlePageChange(currentPage + 1);
        } else if (clickPosition <= 0.5 && currentPage > 1) {
          handlePageChange(currentPage - 1);
        }
      } else {
        if (clickPosition > 0.5 && currentPage < pdfDocument.numPages) {
          handlePageChange(currentPage + 1);
        } else if (clickPosition <= 0.5 && currentPage > 1) {
          handlePageChange(currentPage - 1);
        }
      }
    } else {
      if (readingDirection === 'rtl') {
        if (clickPosition > 0.5) {
          const nextPage = treatFirstPageAsCover && currentPage === 1 
            ? currentPage + 1 
            : currentPage + 2;
          if (nextPage <= pdfDocument.numPages) {
            handlePageChange(nextPage);
          }
        } else {
          const prevPage = treatFirstPageAsCover && currentPage <= 2
            ? 1
            : currentPage - 2;
          if (prevPage >= 1) {
            handlePageChange(prevPage);
          }
        }
      } else {
        if (clickPosition > 0.5) {
          const nextPage = currentPage + 2;
          if (nextPage <= pdfDocument.numPages) {
            handlePageChange(nextPage);
          }
        } else {
          const prevPage = currentPage - 2;
          if (prevPage >= 1) {
            handlePageChange(prevPage);
          }
        }
      }
    }
  };

  return (
    <div 
      id="pdf-viewer-container"
      className={`flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800 relative overflow-hidden ${
        zoomState && zoomState.fitMode === 'custom' ? 'cursor-grab' : 'cursor-pointer'
      }`}
      role="main"
      aria-label={`PDFビューワー ページ ${currentPage} / ${pdfDocument.numPages} ${viewMode === 'spread' ? '見開き表示' : '単ページ表示'}`}
      tabIndex={0}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {renderError ? (
        <div 
          className="text-center"
          role="alert"
          aria-live="assertive"
        >
          <div 
            className="text-4xl mb-2 text-red-500"
            aria-hidden="true"
          >
            ⚠️
          </div>
          <p className="text-red-600 dark:text-red-400">{renderError}</p>
        </div>
      ) : (
        <div 
          className={`relative ${viewMode === 'spread' ? 'flex' : ''}`}
          role="region"
          aria-label="PDF表示領域"
        >
          {isRendering && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-10"
              role="status"
              aria-live="polite"
              aria-label="ページレンダリング中"
            >
              <LoadingSpinner size="md" />
            </div>
          )}
          <canvas
            ref={leftCanvasRef}
            className={`shadow-lg border border-gray-200 dark:border-gray-600 bg-white pointer-events-none ${
              viewMode === 'spread' ? 'max-w-none' : 'max-w-full max-h-full'
            }`}
            role="img"
            aria-label={viewMode === 'spread' ? `左ページ ${readingDirection === 'rtl' ? currentPage + 1 : currentPage}` : `ページ ${currentPage}`}
          />
          <canvas
            ref={rightCanvasRef}
            className="shadow-lg border border-gray-200 dark:border-gray-600 bg-white pointer-events-none max-w-none"
            style={{ display: viewMode === 'spread' ? 'block' : 'none' }}
            role="img"
            aria-label={`右ページ ${readingDirection === 'rtl' ? currentPage : currentPage + 1}`}
          />
        </div>
      )}
    </div>
  );
};