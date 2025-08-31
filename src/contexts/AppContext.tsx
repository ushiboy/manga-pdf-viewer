import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { debounce } from "lodash";
import { usePdfDocument } from "../hooks/usePdfDocument";
import { useSettings } from "../hooks/useSettings";
import { useZoom } from "../hooks/useZoom";
import { useFullscreen } from "../hooks/useFullscreen";
import { useKeyboard } from "../hooks/useKeyboard";
import type { PdfDocument, PdfLoadState } from "../types/pdf";
import type { ViewMode, ReadingDirection, ZoomState } from "../types/settings";

interface AppContextType {
  // PDF関連
  pdfDocument: PdfDocument | null;
  loadState: PdfLoadState;
  loadPdf: (file: File) => Promise<void>;

  // ページ関連
  currentPage: number;
  renderPage: number; // PDF描画用のページ状態
  handlePageChange: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;

  // UI状態
  isUIVisible: boolean;
  showUI: () => void;
  hideUI: () => void;

  // 設定関連
  viewMode: ViewMode;
  readingDirection: ReadingDirection;
  treatFirstPageAsCover: boolean;
  toggleViewMode: () => void;
  toggleReadingDirection: () => void;
  toggleTreatFirstPageAsCover: () => void;
  resetToDefaults: () => void;

  // ズーム関連
  zoomState: ZoomState;
  calculateFitScale: (
    pageWidth: number,
    pageHeight: number,
    containerWidth: number,
    containerHeight: number,
    fitMode: any,
  ) => number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  cycleFitMode: () => void;
  handlePan: (
    offsetX: number,
    offsetY: number,
    containerWidth?: number,
    containerHeight?: number,
    pageWidth?: number,
    pageHeight?: number,
  ) => void;

  // フルスクリーン関連
  isFullscreen: boolean;
  toggleFullscreen: () => void;

  // ファイル操作関連
  handleFileSelect: (file: File) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [renderPage, setRenderPage] = useState(1); // PDF描画用のページ状態
  const [isUIVisible, setIsUIVisible] = useState(true);

  // 既存のhooksを使用
  const { pdfDocument, loadState, loadPdf } = usePdfDocument();
  const {
    settings,
    toggleViewMode,
    toggleReadingDirection,
    toggleTreatFirstPageAsCover,
    resetToDefaults,
  } = useSettings();
  const {
    zoomState,
    zoomIn,
    zoomOut,
    cycleFitMode,
    calculateFitScale,
    setOffset,
  } = useZoom();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // ズーム関数をラップ
  const handleZoomIn = useCallback(() => zoomIn(), [zoomIn]);
  const handleZoomOut = useCallback(() => zoomOut(), [zoomOut]);

  const handleFileSelect = useCallback(
    (file: File) => {
      loadPdf(file);
      setCurrentPage(1);
      setRenderPage(1);
    },
    [loadPdf],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      const file = files[0];

      if (file && file.type === "application/pdf") {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  // PDF描画用のページ更新をdebounceした関数
  const debouncedSetRenderPage = useCallback(
    debounce((page: number) => {
      setRenderPage(page);
    }, 250), // 250msの遅延でバッファリング
    [],
  );

  // debounce関数のクリーンアップ
  useEffect(() => {
    return () => {
      debouncedSetRenderPage.cancel();
    };
  }, [debouncedSetRenderPage]);


  const handlePageChange = useCallback(
    (page: number) => {
      if (!pdfDocument) return;

      const clampedPage = Math.max(1, Math.min(page, pdfDocument.numPages));
      
      // UI用のページ状態は即座に更新（ページ番号表示など）
      setCurrentPage(clampedPage);
      
      // PDF描画用のページ状態は遅延更新（重い描画処理を抑制）
      debouncedSetRenderPage(clampedPage);
    },
    [pdfDocument, debouncedSetRenderPage],
  );

  const goToPreviousPage = useCallback(() => {
    if (settings.viewMode === "single") {
      handlePageChange(currentPage - 1);
    } else {
      // 見開き表示時の前ページ処理
      let prevPage;
      if (settings.treatFirstPageAsCover) {
        // 表紙モードON
        if (currentPage === 1) {
          // 表紙は動かない
          prevPage = 1;
        } else if (currentPage === 2) {
          // 2ページ目から表紙（1ページ目）に戻る
          prevPage = 1;
        } else {
          // 通常の見開きナビゲーション
          prevPage = Math.max(2, currentPage - 2);
        }
      } else {
        // 表紙モードOFF：1ページ目から見開き
        prevPage = Math.max(1, currentPage - 2);
      }
      handlePageChange(prevPage);
    }
  }, [
    handlePageChange,
    currentPage,
    settings.viewMode,
    settings.treatFirstPageAsCover,
  ]);

  const goToNextPage = useCallback(() => {
    if (!pdfDocument) return;

    if (settings.viewMode === "single") {
      handlePageChange(currentPage + 1);
    } else {
      // 見開き表示時の次ページ処理
      let nextPage;
      if (settings.treatFirstPageAsCover) {
        // 表紙モードON
        if (currentPage === 1) {
          // 表紙から2ページ目に移動
          nextPage = 2;
        } else {
          // 通常の見開きナビゲーション
          const potentialNextPage = currentPage + 2;
          // 見開きで次のページが存在するかチェック
          if (potentialNextPage <= pdfDocument.numPages) {
            nextPage = potentialNextPage;
          } else {
            // 次のページが存在しない場合は移動しない
            return;
          }
        }
      } else {
        // 表紙モードOFF：1ページ目から見開き
        const potentialNextPage = currentPage + 2;
        if (potentialNextPage <= pdfDocument.numPages) {
          nextPage = potentialNextPage;
        } else {
          // 次のページが存在しない場合は移動しない
          return;
        }
      }
      handlePageChange(nextPage);
    }
  }, [
    handlePageChange,
    currentPage,
    settings.viewMode,
    settings.treatFirstPageAsCover,
    pdfDocument,
  ]);

  const goToFirstPage = useCallback(() => {
    handlePageChange(1);
  }, [handlePageChange]);

  const goToLastPage = useCallback(() => {
    if (!pdfDocument) return;

    if (settings.viewMode === "single") {
      handlePageChange(pdfDocument.numPages);
    } else {
      // 見開き表示時の最終ページ処理
      const totalPages = pdfDocument.numPages;
      let lastSpreadPage;

      if (settings.treatFirstPageAsCover) {
        // 表紙モードON：1ページ目は単独、2ページ目以降見開き
        if (totalPages <= 2) {
          // ページ数が少ない場合は最終ページ
          lastSpreadPage = totalPages;
        } else {
          // 見開きで最終ページを表示するための開始ページを計算
          lastSpreadPage = Math.max(2, totalPages - 1);
        }
      } else {
        // 表紙モードOFF：1ページ目から見開き
        if (totalPages <= 1) {
          lastSpreadPage = 1;
        } else {
          // 最終見開きの開始ページを計算（奇数ページからスタート）
          lastSpreadPage = totalPages % 2 === 1 ? totalPages : totalPages - 1;
        }
      }

      handlePageChange(lastSpreadPage);
    }
  }, [
    handlePageChange,
    pdfDocument,
    settings.viewMode,
    settings.treatFirstPageAsCover,
  ]);

  const handlePan = useCallback(
    (
      offsetX: number,
      offsetY: number,
      containerWidth?: number,
      containerHeight?: number,
      pageWidth?: number,
      pageHeight?: number,
    ) => {
      setOffset(
        offsetX,
        offsetY,
        containerWidth,
        containerHeight,
        pageWidth,
        pageHeight,
      );
    },
    [setOffset],
  );

  const showUI = useCallback(() => {
    setIsUIVisible(true);
  }, []);

  const hideUI = useCallback(() => {
    setIsUIVisible(false);
  }, []);

  // キーボードショートカット
  useKeyboard({
    onPreviousPage: goToPreviousPage,
    onNextPage: goToNextPage,
    enabled: loadState.isLoaded,
    readingDirection: settings.readingDirection,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onFullscreen: toggleFullscreen,
  });

  const contextValue: AppContextType = {
    // PDF関連
    pdfDocument,
    loadState,
    loadPdf,

    // ページ関連
    currentPage,
    renderPage,
    handlePageChange,
    goToPreviousPage,
    goToNextPage,
    goToFirstPage,
    goToLastPage,

    // UI状態
    isUIVisible,
    showUI,
    hideUI,

    // 設定関連
    viewMode: settings.viewMode,
    readingDirection: settings.readingDirection,
    treatFirstPageAsCover: settings.treatFirstPageAsCover,
    toggleViewMode,
    toggleReadingDirection,
    toggleTreatFirstPageAsCover,
    resetToDefaults,

    // ズーム関連
    zoomState,
    calculateFitScale,
    handleZoomIn,
    handleZoomOut,
    cycleFitMode,
    handlePan,

    // フルスクリーン関連
    isFullscreen,
    toggleFullscreen,

    // ファイル操作関連
    handleFileSelect,
    handleDragOver,
    handleDrop,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
