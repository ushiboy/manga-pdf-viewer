import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePdfDocument } from './usePdfDocument';

// Mock PDF.js
vi.mock('../utils/pdfWorker', () => ({
  default: {
    getDocument: vi.fn(),
  },
}));

const mockPdfjsLib = vi.mocked(await import('../utils/pdfWorker')).default;

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;

describe('usePdfDocument', () => {
  beforeEach(() => {
    console.error = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });


  it('should reject non-PDF files', async () => {
    const { result } = renderHook(() => usePdfDocument());

    const nonPdfFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    await act(async () => {
      await result.current.loadPdf(nonPdfFile);
    });

    expect(result.current.loadState.error).toBe('PDFファイルを選択してください');
    expect(result.current.loadState.isLoading).toBe(false);
    expect(result.current.loadState.isLoaded).toBe(false);
    expect(result.current.pdfDocument).toBeNull();
  });

  it('should handle PDF loading success', async () => {
    const mockPdf = {
      numPages: 10,
      getMetadata: vi.fn().mockResolvedValue({
        info: { Title: 'Test PDF' }
      }),
    };

    const mockLoadingTask = {
      promise: Promise.resolve(mockPdf),
      onProgress: null as any,
    };

    mockPdfjsLib.getDocument.mockReturnValue(mockLoadingTask);

    const { result } = renderHook(() => usePdfDocument());

    const pdfFile = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.loadPdf(pdfFile);
    });

    expect(result.current.pdfDocument).toEqual({
      document: mockPdf,
      numPages: 10,
      title: 'Test PDF',
    });
    expect(result.current.loadState).toEqual({
      isLoading: false,
      isLoaded: true,
      error: null,
      progress: 100,
    });
  });

  it('should handle PDF loading with fallback title', async () => {
    const mockPdf = {
      numPages: 5,
      getMetadata: vi.fn().mockRejectedValue(new Error('No metadata')),
    };

    const mockLoadingTask = {
      promise: Promise.resolve(mockPdf),
      onProgress: null as any,
    };

    mockPdfjsLib.getDocument.mockReturnValue(mockLoadingTask);

    const { result } = renderHook(() => usePdfDocument());

    const pdfFile = new File(['pdf content'], 'my-comic.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.loadPdf(pdfFile);
    });

    expect(result.current.pdfDocument).toEqual({
      document: mockPdf,
      numPages: 5,
      title: 'my-comic.pdf',
    });
  });

  it('should handle loading progress updates', async () => {
    const mockPdf = {
      numPages: 10,
      getMetadata: vi.fn().mockResolvedValue({ info: { Title: 'Test' } }),
    };

    const mockLoadingTask = {
      promise: Promise.resolve(mockPdf),
      onProgress: null as any,
    };

    mockPdfjsLib.getDocument.mockReturnValue(mockLoadingTask);

    const { result } = renderHook(() => usePdfDocument());

    const pdfFile = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });

    const loadPromise = act(async () => {
      await result.current.loadPdf(pdfFile);
    });

    // Simulate progress update
    if (mockLoadingTask.onProgress) {
      act(() => {
        mockLoadingTask.onProgress({ loaded: 50, total: 100 });
      });
    }

    await loadPromise;

    expect(result.current.loadState.isLoaded).toBe(true);
  });

  it('should handle PDF loading errors', async () => {
    const error = new Error('PDF loading failed');
    const mockLoadingTask = {
      promise: Promise.reject(error),
      onProgress: null as any,
    };

    mockPdfjsLib.getDocument.mockReturnValue(mockLoadingTask);

    const { result } = renderHook(() => usePdfDocument());

    const pdfFile = new File(['invalid pdf'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.loadPdf(pdfFile);
    });

    expect(result.current.loadState).toEqual({
      isLoading: false,
      isLoaded: false,
      error: 'PDF loading failed',
      progress: 0,
    });
    expect(result.current.pdfDocument).toBeNull();
  });

  it('should handle specific error types', async () => {
    const { result } = renderHook(() => usePdfDocument());

    // Test Invalid PDF error
    const invalidPdfError = new Error('Invalid PDF structure');
    let mockLoadingTask = {
      promise: Promise.reject(invalidPdfError),
      onProgress: null as any,
    };
    mockPdfjsLib.getDocument.mockReturnValue(mockLoadingTask);

    const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.loadPdf(pdfFile);
    });

    expect(result.current.loadState.error).toBe('無効なPDFファイルです');

    // Test Encrypted PDF error
    const encryptedError = new Error('Encrypted PDF not supported');
    mockLoadingTask = {
      promise: Promise.reject(encryptedError),
      onProgress: null as any,
    };
    mockPdfjsLib.getDocument.mockReturnValue(mockLoadingTask);

    await act(async () => {
      await result.current.loadPdf(pdfFile);
    });

    expect(result.current.loadState.error).toBe('暗号化されたPDFはサポートされていません');

    // Test Network error
    const networkError = new Error('network timeout');
    mockLoadingTask = {
      promise: Promise.reject(networkError),
      onProgress: null as any,
    };
    mockPdfjsLib.getDocument.mockReturnValue(mockLoadingTask);

    await act(async () => {
      await result.current.loadPdf(pdfFile);
    });

    expect(result.current.loadState.error).toBe('ネットワークエラーが発生しました');
  });

  it('should cancel previous loading when new file is loaded', async () => {
    const mockPdf2 = {
      numPages: 10,
      getMetadata: vi.fn().mockResolvedValue({ info: { Title: 'PDF 2' } }),
    };

    const mockLoadingTask2 = {
      promise: Promise.resolve(mockPdf2),
      onProgress: null as any,
    };

    mockPdfjsLib.getDocument.mockReturnValue(mockLoadingTask2);

    const { result } = renderHook(() => usePdfDocument());

    const pdfFile1 = new File(['pdf1'], 'test1.pdf', { type: 'application/pdf' });
    const pdfFile2 = new File(['pdf2'], 'test2.pdf', { type: 'application/pdf' });

    // Start loading first file and then immediately load second
    await act(async () => {
      result.current.loadPdf(pdfFile1);
      await result.current.loadPdf(pdfFile2);
    });

    // Second file should be loaded
    expect(result.current.pdfDocument?.title).toBe('PDF 2');
    expect(result.current.loadState.isLoaded).toBe(true);
  });

  it('should clear PDF document and reset state', async () => {
    const mockPdf = {
      numPages: 5,
      getMetadata: vi.fn().mockResolvedValue({ info: { Title: 'Test' } }),
    };

    const mockLoadingTask = {
      promise: Promise.resolve(mockPdf),
      onProgress: null as any,
    };

    mockPdfjsLib.getDocument.mockReturnValue(mockLoadingTask);

    const { result } = renderHook(() => usePdfDocument());

    // Load a PDF first
    await act(async () => {
      await result.current.loadPdf(new File(['content'], 'test.pdf', { type: 'application/pdf' }));
    });

    // Verify PDF is loaded
    expect(result.current.pdfDocument).not.toBeNull();
    expect(result.current.loadState.isLoaded).toBe(true);

    // Clear the PDF
    act(() => {
      result.current.clearPdf();
    });

    expect(result.current.pdfDocument).toBeNull();
    expect(result.current.loadState).toEqual({
      isLoading: false,
      isLoaded: false,
      error: null,
      progress: 0,
    });
  });

  it('should handle abort controller cancellation', async () => {
    const { result } = renderHook(() => usePdfDocument());

    // Start loading and then immediately clear
    const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      result.current.loadPdf(pdfFile);
      result.current.clearPdf();
    });

    expect(result.current.loadState).toEqual({
      isLoading: false,
      isLoaded: false,
      error: null,
      progress: 0,
    });
    expect(result.current.pdfDocument).toBeNull();
  });
});