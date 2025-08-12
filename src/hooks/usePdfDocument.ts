import { useState, useCallback, useRef } from 'react';
import pdfjsLib from '../utils/pdfWorker';
import type { PdfDocument, PdfLoadState } from '../types/pdf';

export const usePdfDocument = () => {
  const [pdfDocument, setPdfDocument] = useState<PdfDocument | null>(null);
  const [loadState, setLoadState] = useState<PdfLoadState>({
    isLoading: false,
    isLoaded: false,
    error: null,
    progress: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadPdf = useCallback(async (file: File) => {
    // 前の読み込みをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 新しいAbortControllerを作成
    abortControllerRef.current = new AbortController();
    
    // 初期状態にリセット
    setPdfDocument(null);
    setLoadState({
      isLoading: true,
      isLoaded: false,
      error: null,
      progress: 0,
    });

    try {
      // ファイル検証
      if (file.type !== 'application/pdf') {
        throw new Error('PDFファイルを選択してください');
      }

      // ファイルをArrayBufferに変換
      const arrayBuffer = await file.arrayBuffer();
      
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setLoadState(prev => ({ ...prev, progress: 50 }));

      // PDF文書を読み込み
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: '/node_modules/pdfjs-dist/cmaps/',
        cMapPacked: true,
      });

      // 進行状況を監視
      loadingTask.onProgress = (progressData) => {
        if (progressData.total > 0) {
          const progress = Math.min(90, (progressData.loaded / progressData.total) * 90);
          setLoadState(prev => ({ ...prev, progress }));
        }
      };

      const pdf = await loadingTask.promise;

      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      // メタデータを取得（オプション）
      const metadata = await pdf.getMetadata().catch(() => null);
      const title = metadata?.info?.Title || file.name;

      const pdfDoc: PdfDocument = {
        document: pdf,
        numPages: pdf.numPages,
        title,
      };

      setPdfDocument(pdfDoc);
      setLoadState({
        isLoading: false,
        isLoaded: true,
        error: null,
        progress: 100,
      });

    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      console.error('PDF読み込みエラー:', error);
      
      let errorMessage = 'PDFファイルの読み込みに失敗しました';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid PDF')) {
          errorMessage = '無効なPDFファイルです';
        } else if (error.message.includes('Encrypted')) {
          errorMessage = '暗号化されたPDFはサポートされていません';
        } else if (error.message.includes('network')) {
          errorMessage = 'ネットワークエラーが発生しました';
        } else {
          errorMessage = error.message;
        }
      }

      setLoadState({
        isLoading: false,
        isLoaded: false,
        error: errorMessage,
        progress: 0,
      });
    }
  }, []);

  const clearPdf = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setPdfDocument(null);
    setLoadState({
      isLoading: false,
      isLoaded: false,
      error: null,
      progress: 0,
    });
  }, []);

  return {
    pdfDocument,
    loadState,
    loadPdf,
    clearPdf,
  };
};