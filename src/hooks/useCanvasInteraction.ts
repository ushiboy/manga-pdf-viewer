import { useEffect, useState, useCallback } from "react";
import type { PdfDocument } from "../types/pdf";
import type { ViewMode, ReadingDirection, ZoomState } from "../types/settings";

interface UseCanvasInteractionProps {
  pdfDocument: PdfDocument | null;
  currentPage: number;
  viewMode: ViewMode;
  readingDirection: ReadingDirection;
  treatFirstPageAsCover: boolean;
  zoomState?: ZoomState;
  handlePageChange: (page: number) => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handlePan: (
    offsetX: number,
    offsetY: number,
    containerWidth?: number,
    containerHeight?: number,
    pageWidth?: number,
    pageHeight?: number,
  ) => void;
  updatePanPosition: (offsetX: number, offsetY: number) => void;
  leftCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const useCanvasInteraction = ({
  pdfDocument,
  currentPage,
  viewMode,
  readingDirection,
  treatFirstPageAsCover,
  zoomState,
  handlePageChange,
  handleZoomIn,
  handleZoomOut,
  handlePan,
  updatePanPosition,
  leftCanvasRef,
}: UseCanvasInteractionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });

  // ページナビゲーション用のクリック処理
  const handlePageNavigation = useCallback(
    (clickPosition: number) => {
      if (!pdfDocument || !handlePageChange) return;

      if (viewMode === "single") {
        // 単ページモードの処理
        if (readingDirection === "rtl") {
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
        // 見開きモードの処理
        if (readingDirection === "rtl") {
          if (clickPosition > 0.5) {
            const nextPage =
              treatFirstPageAsCover && currentPage === 1
                ? currentPage + 1
                : currentPage + 2;
            if (nextPage <= pdfDocument.numPages) {
              handlePageChange(nextPage);
            }
          } else {
            const prevPage =
              treatFirstPageAsCover && currentPage <= 2 ? 1 : currentPage - 2;
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
    },
    [
      pdfDocument,
      currentPage,
      viewMode,
      readingDirection,
      treatFirstPageAsCover,
      handlePageChange,
    ],
  );

  // パン処理の共通ロジック
  const performPan = useCallback(
    (deltaX: number, deltaY: number) => {
      if (!handlePan || !zoomState || zoomState.fitMode !== "custom") return;

      if (
        Math.abs(deltaX - lastPanPosition.x) > 2 ||
        Math.abs(deltaY - lastPanPosition.y) > 2
      ) {
        const canvas = leftCanvasRef.current;
        const containerRect = canvas?.parentElement?.getBoundingClientRect();

        if (containerRect && canvas) {
          handlePan(
            deltaX - lastPanPosition.x,
            deltaY - lastPanPosition.y,
            containerRect.width,
            containerRect.height,
            canvas.offsetWidth,
            canvas.offsetHeight,
          );
        }

        setLastPanPosition({ x: deltaX, y: deltaY });
      }
    },
    [handlePan, zoomState, lastPanPosition, leftCanvasRef],
  );

  // マウスイベントハンドラー
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (zoomState?.fitMode === "custom") {
        setIsDragging(true);
        setDragStart({ x: event.clientX, y: event.clientY });
        setLastPanPosition({ x: 0, y: 0 });
        event.preventDefault();
      }
    },
    [zoomState],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging && zoomState?.fitMode === "custom") {
        const deltaX = event.clientX - dragStart.x;
        const deltaY = event.clientY - dragStart.y;

        performPan(deltaX, deltaY);
        updatePanPosition(
          deltaX - lastPanPosition.x,
          deltaY - lastPanPosition.y,
        );
      }
    },
    [
      isDragging,
      dragStart,
      performPan,
      updatePanPosition,
      lastPanPosition,
      zoomState,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setLastPanPosition({ x: 0, y: 0 });
    document.body.style.cursor = "";
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging || zoomState?.fitMode === "custom") return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const clickPosition = x / rect.width;

      handlePageNavigation(clickPosition);
    },
    [isDragging, zoomState, handlePageNavigation],
  );

  // グローバルマウスイベントの処理
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (
        !isDragging ||
        !handlePan ||
        !zoomState ||
        zoomState.fitMode !== "custom"
      )
        return;

      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;

      performPan(deltaX, deltaY);
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setLastPanPosition({ x: 0, y: 0 });
        document.body.style.cursor = "";
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.body.style.cursor = "grabbing";
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [
    isDragging,
    dragStart,
    lastPanPosition,
    handlePan,
    zoomState,
    performPan,
  ]);

  // ホイールイベントの処理
  useEffect(() => {
    const viewerContainer = document.getElementById("pdf-viewer-container");
    if (!viewerContainer) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      // ズームイン/ズームアウトの処理
      if (event.deltaY < 0 && handleZoomIn) {
        handleZoomIn();
      } else if (event.deltaY > 0 && handleZoomOut) {
        handleZoomOut();
      }
    };

    viewerContainer.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      viewerContainer.removeEventListener("wheel", handleWheel);
    };
  }, [handleZoomIn, handleZoomOut]);

  return {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleClick,
  };
};
