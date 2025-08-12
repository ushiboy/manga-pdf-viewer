import React, { useEffect, useRef, useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import type { PdfDocument, PdfLoadState } from '../types/pdf';

interface PdfViewerProps {
  pdfDocument: PdfDocument | null;
  loadState: PdfLoadState;
  currentPage: number;
  isUIVisible: boolean;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ 
  pdfDocument, 
  loadState, 
  currentPage,
  isUIVisible
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;

    const renderPage = async () => {
      setIsRendering(true);
      setRenderError(null);

      try {
        const page = await pdfDocument.document.getPage(currentPage);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // 基本のビューポートを取得（scale=1）
        const baseViewport = page.getViewport({ scale: 1 });
        
        // コンテナサイズを取得（UIの表示状態とマージンを考慮）
        const containerWidth = window.innerWidth - 32; // 左右16pxずつのマージン
        const uiHeight = isUIVisible ? 120 : 16; // UI表示時は120px、非表示時は16px
        const containerHeight = window.innerHeight - uiHeight;
        
        // ページがコンテナに収まるスケールを計算
        const scaleX = containerWidth / baseViewport.width;
        const scaleY = containerHeight / baseViewport.height;
        const fitScale = Math.min(scaleX, scaleY, 3); // 最大3倍まで
        
        // デバイスピクセル比を考慮した実際のスケール
        const devicePixelRatio = window.devicePixelRatio || 1;
        const renderScale = fitScale * devicePixelRatio;
        
        const viewport = page.getViewport({ scale: renderScale });
        
        // キャンバスサイズを設定
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // CSSサイズを設定（表示サイズ）
        canvas.style.width = `${viewport.width / devicePixelRatio}px`;
        canvas.style.height = `${viewport.height / devicePixelRatio}px`;

        // レンダリング実行
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (error) {
        console.error('PDF レンダリングエラー:', error);
        setRenderError('ページの表示に失敗しました');
      } finally {
        setIsRendering(false);
      }
    };

    // 初回レンダリング
    renderPage();

    // ウィンドウリサイズ時の再レンダリング
    const handleResize = () => {
      renderPage();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [pdfDocument, currentPage, isUIVisible]);

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

  // PDF表示状態
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
      {renderError ? (
        <div className="text-center">
          <div className="text-4xl mb-2 text-red-500">⚠️</div>
          <p className="text-red-600 dark:text-red-400">{renderError}</p>
        </div>
      ) : (
        <div className="relative">
          {isRendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-10">
              <LoadingSpinner size="md" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full shadow-lg border border-gray-200 dark:border-gray-600 bg-white"
          />
        </div>
      )}
    </div>
  );
};