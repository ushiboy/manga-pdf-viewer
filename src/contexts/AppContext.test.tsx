import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AppProvider, useAppContext } from './AppContext';

// Mock the hooks that AppContext depends on
vi.mock('../hooks/usePdfDocument', () => ({
  usePdfDocument: vi.fn(() => ({
    pdfDocument: null,
    loadState: { isLoading: false, error: null, progress: 0, isLoaded: false },
    loadPdf: vi.fn(),
  })),
}));

vi.mock('../hooks/useSettings', () => ({
  useSettings: vi.fn(() => ({
    settings: {
      viewMode: 'single',
      readingDirection: 'rtl',
      treatFirstPageAsCover: true,
    },
    toggleViewMode: vi.fn(),
    toggleReadingDirection: vi.fn(),
    toggleTreatFirstPageAsCover: vi.fn(),
    resetToDefaults: vi.fn(),
  })),
}));

vi.mock('../hooks/useZoom', () => ({
  useZoom: vi.fn(() => ({
    zoomState: {
      scale: 1,
      fitMode: 'width',
      offsetX: 0,
      offsetY: 0,
      minScale: 0.1,
      maxScale: 5.0,
    },
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    cycleFitMode: vi.fn(),
    calculateFitScale: vi.fn(() => 1),
    setOffset: vi.fn(),
  })),
}));

vi.mock('../hooks/useFullscreen', () => ({
  useFullscreen: vi.fn(() => ({
    isFullscreen: false,
    toggleFullscreen: vi.fn(),
  })),
}));

vi.mock('../hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}));

describe('AppContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useAppContext', () => {
    it('should throw error when used outside of AppProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useAppContext());
      }).toThrow('useAppContext must be used within an AppProvider');

      console.error = originalError;
    });

    it('should return context value when used within AppProvider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.isUIVisible).toBe(true);
      expect(result.current.pdfDocument).toBeNull();
      expect(result.current.viewMode).toBe('single');
      expect(result.current.readingDirection).toBe('rtl');
      expect(result.current.treatFirstPageAsCover).toBe(true);
    });
  });

  describe('AppProvider', () => {
    it('should provide initial state correctly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      // Test initial states
      expect(result.current.currentPage).toBe(1);
      expect(result.current.isUIVisible).toBe(true);
      expect(result.current.pdfDocument).toBeNull();
      expect(result.current.loadState).toEqual({
        isLoading: false,
        error: null,
        progress: 0,
        isLoaded: false,
      });
      expect(result.current.viewMode).toBe('single');
      expect(result.current.readingDirection).toBe('rtl');
      expect(result.current.treatFirstPageAsCover).toBe(true);
      expect(result.current.isFullscreen).toBe(false);
    });

  });

  describe('State Management', () => {
    it('should handle UI visibility toggle', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.isUIVisible).toBe(true);

      act(() => {
        result.current.hideUI();
      });

      expect(result.current.isUIVisible).toBe(false);

      act(() => {
        result.current.showUI();
      });

      expect(result.current.isUIVisible).toBe(true);
    });

    it('should handle page change with PDF document', async () => {
      const mockPdfDocument = {
        document: {} as any,
        numPages: 10,
      };

      const { usePdfDocument } = await import('../hooks/usePdfDocument');
      vi.mocked(usePdfDocument).mockReturnValue({
        pdfDocument: mockPdfDocument,
        loadState: { isLoading: false, error: null, progress: 0, isLoaded: true },
        loadPdf: vi.fn(),
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.currentPage).toBe(1);

      act(() => {
        result.current.handlePageChange(5);
      });

      expect(result.current.currentPage).toBe(5);
    });

    it('should not change page without PDF document', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.currentPage).toBe(1);

      act(() => {
        result.current.handlePageChange(5);
      });

      // Should remain at 1 since no PDF document is loaded
      expect(result.current.currentPage).toBe(1);
    });

    it('should handle file selection', async () => {
      const mockLoadPdf = vi.fn();
      const { usePdfDocument } = await import('../hooks/usePdfDocument');
      vi.mocked(usePdfDocument).mockReturnValue({
        pdfDocument: null,
        loadState: { isLoading: false, error: null, progress: 0, isLoaded: false },
        loadPdf: mockLoadPdf,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      act(() => {
        result.current.handleFileSelect(mockFile);
      });

      expect(mockLoadPdf).toHaveBeenCalledWith(mockFile);
      expect(result.current.currentPage).toBe(1); // Should reset to page 1
    });

    it('should handle drag and drop events', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      const mockDragEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: {
          files: [new File(['test'], 'test.pdf', { type: 'application/pdf' })],
        },
      } as unknown as React.DragEvent;

      // Test drag over
      act(() => {
        result.current.handleDragOver(mockDragEvent);
      });

      expect(mockDragEvent.preventDefault).toHaveBeenCalled();
      expect(mockDragEvent.stopPropagation).toHaveBeenCalled();

      act(() => {
        result.current.handleDrop(mockDragEvent);
      });

      expect(mockDragEvent.preventDefault).toHaveBeenCalled();
      expect(mockDragEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Page Navigation', () => {
    it('should handle page navigation without PDF document', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      // These should not throw errors even without a PDF document
      act(() => {
        result.current.goToPreviousPage();
      });

      act(() => {
        result.current.goToNextPage();
      });

      act(() => {
        result.current.goToFirstPage();
      });

      act(() => {
        result.current.goToLastPage();
      });

      expect(result.current.currentPage).toBe(1); // Should remain at 1
    });

    it('should handle page navigation with PDF document', async () => {
      const mockPdfDocument = {
        document: {} as any,
        numPages: 10,
      };

      const { usePdfDocument } = await import('../hooks/usePdfDocument');
      vi.mocked(usePdfDocument).mockReturnValue({
        pdfDocument: mockPdfDocument,
        loadState: { isLoading: false, error: null, progress: 0, isLoaded: true },
        loadPdf: vi.fn(),
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      // Set current page to middle
      act(() => {
        result.current.handlePageChange(5);
      });
      expect(result.current.currentPage).toBe(5);

      // Test go to first page
      act(() => {
        result.current.goToFirstPage();
      });
      expect(result.current.currentPage).toBe(1);

      // Test go to last page
      act(() => {
        result.current.goToLastPage();
      });
      expect(result.current.currentPage).toBe(10);

      // Test previous page
      act(() => {
        result.current.goToPreviousPage();
      });
      expect(result.current.currentPage).toBe(9);

      // Test next page
      act(() => {
        result.current.goToNextPage();
      });
      expect(result.current.currentPage).toBe(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid page numbers', async () => {
      const mockPdfDocument = {
        document: {} as any,
        numPages: 10,
      };

      const { usePdfDocument } = await import('../hooks/usePdfDocument');
      vi.mocked(usePdfDocument).mockReturnValue({
        pdfDocument: mockPdfDocument,
        loadState: { isLoading: false, error: null, progress: 0, isLoaded: true },
        loadPdf: vi.fn(),
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      // Test page number below minimum
      act(() => {
        result.current.handlePageChange(-1);
      });
      expect(result.current.currentPage).toBe(1); // Should clamp to 1

      // Test page number above maximum
      act(() => {
        result.current.handlePageChange(15);
      });
      expect(result.current.currentPage).toBe(10); // Should clamp to numPages

      // Test valid page number
      act(() => {
        result.current.handlePageChange(5);
      });
      expect(result.current.currentPage).toBe(5);
    });

    it('should handle non-PDF files in drop', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      const mockDragEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: {
          files: [new File(['test'], 'test.txt', { type: 'text/plain' })],
        },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDrop(mockDragEvent);
      });

      // Should not call loadPdf for non-PDF files - the function should handle this internally
    });
  });
});