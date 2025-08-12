import * as pdfjsLib from 'pdfjs-dist';

// PDF.js ワーカーの設定
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export default pdfjsLib;