import React, { useEffect, useRef, useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import type { PdfDocument, PdfLoadState } from '../types/pdf';
import type { ViewMode, ReadingDirection } from '../types/settings';

interface PdfViewerProps {
  pdfDocument: PdfDocument | null;
  loadState: PdfLoadState;
  currentPage: number;
  isUIVisible: boolean;
  viewMode: ViewMode;
  readingDirection: ReadingDirection;
  onPageChange?: (page: number) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ 
  pdfDocument, 
  loadState, 
  currentPage,
  isUIVisible,
  viewMode,
  readingDirection,
  onPageChange
}) => {
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (!pdfDocument) return;

    const renderPages = async () => {
      setIsRendering(true);
      setRenderError(null);

      try {
        if (viewMode === 'single') {
          await renderSinglePage();
        } else {
          await renderSpreadPages();
        }
      } catch (error) {
        console.error('PDF レンダリングエラー:', error);
        setRenderError('ページの表示に失敗しました');
      } finally {
        setIsRendering(false);
      }
    };

    const renderSinglePage = async () => {
      const canvas = leftCanvasRef.current;
      if (!canvas) return;

      const page = await pdfDocument.document.getPage(currentPage);
      const context = canvas.getContext('2d');
      if (!context) return;

      // 基本のビューポートを取得（scale=1）
      const baseViewport = page.getViewport({ scale: 1 });
      
      // コンテナサイズを取得
      const containerWidth = window.innerWidth - 32;
      const uiHeight = isUIVisible ? 120 : 16;
      const containerHeight = window.innerHeight - uiHeight;
      
      // ページがコンテナに収まるスケールを計算
      const scaleX = containerWidth / baseViewport.width;
      const scaleY = containerHeight / baseViewport.height;
      const fitScale = Math.min(scaleX, scaleY, 3);
      
      // デバイスピクセル比を考慮した実際のスケール
      const devicePixelRatio = window.devicePixelRatio || 1;
      const renderScale = fitScale * devicePixelRatio;
      
      const viewport = page.getViewport({ scale: renderScale });
      
      // キャンバスサイズを設定
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // CSSサイズを設定
      canvas.style.width = `${viewport.width / devicePixelRatio}px`;
      canvas.style.height = `${viewport.height / devicePixelRatio}px`;

      // レンダリング実行
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // 右側のキャンバスを非表示
      if (rightCanvasRef.current) {
        rightCanvasRef.current.style.display = 'none';
      }
    };

    const renderSpreadPages = async () => {
      const leftCanvas = leftCanvasRef.current;
      const rightCanvas = rightCanvasRef.current;
      if (!leftCanvas || !rightCanvas) return;

      // 1ページ目（表紙）は単一ページ表示
      if (currentPage === 1) {
        await renderSinglePage();
        return;
      }

      // 両方のキャンバスを表示
      leftCanvas.style.display = 'block';
      rightCanvas.style.display = 'block';

      // コンテナサイズを取得
      const containerWidth = window.innerWidth - 32;
      const uiHeight = isUIVisible ? 120 : 16;
      const containerHeight = window.innerHeight - uiHeight;

      // 見開き用のサイズ計算（コンテナ幅を2分割）
      const pageContainerWidth = containerWidth / 2 - 8; // 左右のマージン

      // 現在ページと次のページを取得（1ページ目を除く）
      const leftPageNum = readingDirection === 'rtl' ? currentPage + 1 : currentPage;
      const rightPageNum = readingDirection === 'rtl' ? currentPage : currentPage + 1;

      // ページの存在チェック
      const hasLeftPage = leftPageNum >= 1 && leftPageNum <= pdfDocument.numPages;
      const hasRightPage = rightPageNum >= 1 && rightPageNum <= pdfDocument.numPages;

      // 左ページのレンダリング
      if (hasLeftPage) {
        const leftPage = await pdfDocument.document.getPage(leftPageNum);
        const leftContext = leftCanvas.getContext('2d');
        if (leftContext) {
          const baseViewport = leftPage.getViewport({ scale: 1 });
          const scaleX = pageContainerWidth / baseViewport.width;
          const scaleY = containerHeight / baseViewport.height;
          const fitScale = Math.min(scaleX, scaleY, 3);
          
          const devicePixelRatio = window.devicePixelRatio || 1;
          const renderScale = fitScale * devicePixelRatio;
          const viewport = leftPage.getViewport({ scale: renderScale });
          
          leftCanvas.width = viewport.width;
          leftCanvas.height = viewport.height;
          leftCanvas.style.width = `${viewport.width / devicePixelRatio}px`;
          leftCanvas.style.height = `${viewport.height / devicePixelRatio}px`;

          await leftPage.render({
            canvasContext: leftContext,
            viewport: viewport,
          }).promise;
        }
      } else {
        // 左ページが存在しない場合は空白
        const leftContext = leftCanvas.getContext('2d');
        if (leftContext) {
          leftCanvas.width = pageContainerWidth;
          leftCanvas.height = containerHeight;
          leftCanvas.style.width = `${pageContainerWidth}px`;
          leftCanvas.style.height = `${containerHeight}px`;
          leftContext.fillStyle = '#f3f4f6';
          leftContext.fillRect(0, 0, leftCanvas.width, leftCanvas.height);
        }
      }

      // 右ページのレンダリング
      if (hasRightPage) {
        const rightPage = await pdfDocument.document.getPage(rightPageNum);
        const rightContext = rightCanvas.getContext('2d');
        if (rightContext) {
          const baseViewport = rightPage.getViewport({ scale: 1 });
          const scaleX = pageContainerWidth / baseViewport.width;
          const scaleY = containerHeight / baseViewport.height;
          const fitScale = Math.min(scaleX, scaleY, 3);
          
          const devicePixelRatio = window.devicePixelRatio || 1;
          const renderScale = fitScale * devicePixelRatio;
          const viewport = rightPage.getViewport({ scale: renderScale });
          
          rightCanvas.width = viewport.width;
          rightCanvas.height = viewport.height;
          rightCanvas.style.width = `${viewport.width / devicePixelRatio}px`;
          rightCanvas.style.height = `${viewport.height / devicePixelRatio}px`;

          await rightPage.render({
            canvasContext: rightContext,
            viewport: viewport,
          }).promise;
        }
      } else {
        // 右ページが存在しない場合は空白
        const rightContext = rightCanvas.getContext('2d');
        if (rightContext) {
          rightCanvas.width = pageContainerWidth;
          rightCanvas.height = containerHeight;
          rightCanvas.style.width = `${pageContainerWidth}px`;
          rightCanvas.style.height = `${containerHeight}px`;
          rightContext.fillStyle = '#f3f4f6';
          rightContext.fillRect(0, 0, rightCanvas.width, rightCanvas.height);
        }
      }
    };

    // 初回レンダリング
    renderPages();

    // ウィンドウリサイズ時の再レンダリング
    const handleResize = () => {
      renderPages();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [pdfDocument, currentPage, isUIVisible, viewMode, readingDirection]);

  // ローディング状態
  if (loadState.isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            PDFを読み込んでいます...
          </p>
          {loadState.progress > 0 && (
            <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadState.progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // エラー状態
  if (loadState.error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
            <span className="text-6xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
            エラー
          </h2>
          <p className="text-red-500 dark:text-red-400 mb-4">
            {loadState.error}
          </p>
        </div>
      </div>
    );
  }

  // PDF未選択状態
  if (!pdfDocument) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-6xl">📚</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            漫画本PDFビューワー
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            PDFファイルを選択してください
          </p>
          <div className="space-y-2 text-sm text-gray-400 dark:text-gray-500">
            <p>ドラッグ&ドロップまたはファイル選択ボタンから読み込み</p>
            <p>キーボード: ←→（ページめくり）、F11（フルスクリーン）</p>
            <p>マウス: クリック（ページめくり）、ホイール（ズーム）</p>
          </div>
        </div>
      </div>
    );
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onPageChange || !pdfDocument) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const centerX = rect.width / 2;

    if (viewMode === 'single') {
      if (clickX < centerX) {
        // 左半分クリック：RTLなら次のページ、LTRなら前のページ
        if (readingDirection === 'rtl') {
          if (currentPage < pdfDocument.numPages) {
            onPageChange(currentPage + 1);
          }
        } else {
          if (currentPage > 1) {
            onPageChange(currentPage - 1);
          }
        }
      } else {
        // 右半分クリック：RTLなら前のページ、LTRなら次のページ
        if (readingDirection === 'rtl') {
          if (currentPage > 1) {
            onPageChange(currentPage - 1);
          }
        } else {
          if (currentPage < pdfDocument.numPages) {
            onPageChange(currentPage + 1);
          }
        }
      }
    } else {
      // 見開き表示時のページナビゲーション（読み方向に応じてクリック操作を調整）
      const shouldGoNext = (readingDirection === 'rtl' && clickX < centerX) || 
                          (readingDirection === 'ltr' && clickX >= centerX);
      
      if (shouldGoNext) {
        // 次の見開きに進む
        let nextPage;
        if (currentPage === 1) {
          // 表紙から2ページ目に移動
          nextPage = 2;
        } else {
          // 通常の見開きナビゲーション
          nextPage = Math.min(pdfDocument.numPages, currentPage + 2);
        }
        onPageChange(nextPage);
      } else {
        // 前の見開きに戻る
        let prevPage;
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
        onPageChange(prevPage);
      }
    }
  };

  // PDF表示状態
  return (
    <div 
      className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800 relative overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {renderError ? (
        <div className="text-center">
          <div className="text-4xl mb-2 text-red-500">⚠️</div>
          <p className="text-red-600 dark:text-red-400">{renderError}</p>
        </div>
      ) : (
        <div className={`relative ${viewMode === 'spread' ? 'flex gap-2' : ''}`}>
          {isRendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-10">
              <LoadingSpinner size="md" />
            </div>
          )}
          <canvas
            ref={leftCanvasRef}
            className={`shadow-lg border border-gray-200 dark:border-gray-600 bg-white pointer-events-none ${
              viewMode === 'spread' ? 'max-w-none' : 'max-w-full max-h-full'
            }`}
          />
          <canvas
            ref={rightCanvasRef}
            className="shadow-lg border border-gray-200 dark:border-gray-600 bg-white pointer-events-none max-w-none"
            style={{ display: viewMode === 'spread' ? 'block' : 'none' }}
          />
        </div>
      )}
    </div>
  );
};