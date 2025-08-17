import * as pdfjsLib from 'pdfjs-dist';

// PDF.js ワーカーの設定
const workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

// オフライン環境での動的インポートエラー対策
// WorkerをDisableしてメインスレッドで処理するフォールバック機能
let isWorkerDisabled = false;

const setupWorker = () => {
  try {
    if (!isWorkerDisabled) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    } else {
      // Workerを無効化してメインスレッドで処理
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      console.warn('PDF.js Worker disabled, using main thread fallback for offline compatibility');
    }
  } catch (error) {
    console.warn('Failed to setup PDF.js worker:', error);
    isWorkerDisabled = true;
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
  }
};

// Worker設定を初期化
setupWorker();

// PDF読み込み関数をラップしてエラーハンドリング強化
const getDocumentWithFallback = (src: any) => {
  const loadingTask = pdfjsLib.getDocument(src);
  
  // Worker関連エラーを検知してフォールバックを試行
  const originalPromise = loadingTask.promise;
  const wrappedPromise = originalPromise.catch((error: Error) => {
    if (error.message.includes('Setting up fake worker failed') || 
        error.message.includes('Failed to fetch dynamically imported module')) {
      console.warn('PDF.js Worker failed, retrying with main thread fallback');
      
      // Worker を無効化して再試行
      if (!isWorkerDisabled) {
        isWorkerDisabled = true;
        setupWorker();
        
        // メインスレッドで再実行
        return pdfjsLib.getDocument(src).promise;
      }
    }
    throw error;
  });
  
  // 新しいPromiseでloadingTaskを返す
  return {
    ...loadingTask,
    promise: wrappedPromise
  };
};

// エラーハンドリングを含むPDF.jsをエクスポート
export default {
  ...pdfjsLib,
  getDocument: getDocumentWithFallback,
};