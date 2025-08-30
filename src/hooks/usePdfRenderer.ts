import { useEffect, useRef, useState } from 'react';
import type { PdfDocument } from '../types/pdf';
import type { ViewMode, ReadingDirection, ZoomState } from '../types/settings';

interface UsePdfRendererProps {
  pdfDocument: PdfDocument | null;
  currentPage: number;
  viewMode: ViewMode;
  readingDirection: ReadingDirection;
  treatFirstPageAsCover: boolean;
  zoomState?: ZoomState;
  calculateFitScale?: (
    pageWidth: number,
    pageHeight: number,
    containerWidth: number,
    containerHeight: number,
    fitMode: any
  ) => number;
  isUIVisible: boolean;
}

interface RenderTask {
  cancel: () => void;
}

interface RenderTasks {
  single?: RenderTask;
  left?: RenderTask;
  right?: RenderTask;
}

export const usePdfRenderer = ({
  pdfDocument,
  currentPage,
  viewMode,
  readingDirection,
  treatFirstPageAsCover,
  zoomState,
  calculateFitScale,
  isUIVisible,
}: UsePdfRendererProps) => {
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const isRenderingRef = useRef(false);
  const renderTasksRef = useRef<RenderTasks>({});

  // 共通のキャンバス設定関数
  const setupCanvas = (
    canvas: HTMLCanvasElement,
    scaledViewport: any,
    devicePixelRatio: number
  ) => {
    const context = canvas.getContext('2d');
    if (!context) return null;

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

    return context;
  };

  // スケール計算関数
  const calculateScale = (
    viewport: any,
    containerWidth: number,
    containerHeight: number
  ): number => {
    if (!zoomState) return 1;

    if (zoomState.fitMode === 'custom') {
      return zoomState.scale;
    }

    if (calculateFitScale) {
      return calculateFitScale(
        viewport.width,
        viewport.height,
        containerWidth,
        containerHeight,
        zoomState.fitMode
      );
    }

    return 1;
  };

  // コンテナサイズ計算
  const getContainerSize = () => {
    const containerWidth = window.innerWidth - 32;
    const uiHeight = isUIVisible ? 120 : 16;
    const containerHeight = window.innerHeight - uiHeight;
    return { containerWidth, containerHeight };
  };

  // 単ページレンダリング
  const renderSinglePage = async (): Promise<void> => {
    if (!pdfDocument?.document || !leftCanvasRef.current) return;

    const canvas = leftCanvasRef.current;
    const page = await pdfDocument.document.getPage(currentPage);
    const viewport = page.getViewport({ scale: 1 });
    
    const { containerWidth, containerHeight } = getContainerSize();
    const scale = calculateScale(viewport, containerWidth, containerHeight);
    const scaledViewport = page.getViewport({ scale });
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    const context = setupCanvas(canvas, scaledViewport, devicePixelRatio);
    if (!context) return;

    const renderTask = page.render({
      canvasContext: context,
      viewport: scaledViewport,
      canvas: canvas,
    });

    renderTasksRef.current.single = renderTask;
    await renderTask.promise;
  };

  // 見開きページ番号計算
  const calculateSpreadPages = (): { leftPageNum: number; rightPageNum: number } => {
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

    return { leftPageNum, rightPageNum };
  };

  // 見開き用キャンバスレンダリング
  const renderCanvas = async (
    canvas: HTMLCanvasElement,
    pageNum: number,
    taskKey: 'left' | 'right'
  ): Promise<void> => {
    if (!pdfDocument?.document) return;

    if (pageNum <= 0 || pageNum > pdfDocument.numPages) {
      canvas.style.display = 'none';
      return;
    }

    canvas.style.display = 'block';

    const page = await pdfDocument.document.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    
    const { containerWidth, containerHeight } = getContainerSize();
    // 見開き用のサイズ計算（コンテナ幅を2分割）
    const pageContainerWidth = containerWidth / 2;
    const scale = calculateScale(viewport, pageContainerWidth, containerHeight);
    const scaledViewport = page.getViewport({ scale });
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    const context = setupCanvas(canvas, scaledViewport, devicePixelRatio);
    if (!context) return;

    const renderTask = page.render({
      canvasContext: context,
      viewport: scaledViewport,
      canvas: canvas,
    });

    renderTasksRef.current[taskKey] = renderTask;
    await renderTask.promise;
  };

  // 見開きレンダリング
  const renderSpreadPages = async (): Promise<void> => {
    if (!leftCanvasRef.current || !rightCanvasRef.current) return;

    const { leftPageNum, rightPageNum } = calculateSpreadPages();

    await Promise.all([
      renderCanvas(leftCanvasRef.current, leftPageNum, 'left'),
      renderCanvas(rightCanvasRef.current, rightPageNum, 'right'),
    ]);
  };

  // レンダリング実行タスクのキャンセル
  const cancelRenderTasks = async (): Promise<void> => {
    const tasks = renderTasksRef.current;
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

    if (cancelPromises.length > 0) {
      await Promise.all(cancelPromises);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  };

  // メインのレンダリング関数
  const renderPages = async (): Promise<void> => {
    if (!pdfDocument?.document || isRenderingRef.current) return;

    try {
      isRenderingRef.current = true;
      setIsRendering(true);
      setRenderError(null);

      await cancelRenderTasks();

      if (viewMode === 'single') {
        await renderSinglePage();
      } else {
        await renderSpreadPages();
      }
    } catch (error) {
      console.error('PDF rendering error:', error);
      setRenderError('PDFの描画に失敗しました');
    } finally {
      isRenderingRef.current = false;
      setIsRendering(false);
    }
  };

  // レンダリングeffect
  useEffect(() => {
    renderPages();

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
  }, [pdfDocument, currentPage, viewMode, zoomState, treatFirstPageAsCover, readingDirection, isUIVisible]);

  return {
    leftCanvasRef,
    rightCanvasRef,
    renderError,
    isRendering,
  };
};