import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

export interface PdfDocument {
  document: PDFDocumentProxy;
  numPages: number;
  title?: string;
}

export interface PdfPage {
  page: PDFPageProxy;
  pageNumber: number;
  canvas?: HTMLCanvasElement;
  rendered: boolean;
}

export interface PdfLoadState {
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  progress: number;
}

export interface PdfRenderOptions {
  scale: number;
  rotation: number;
}