import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { PdfViewer } from './PdfViewer';
import type { PdfDocument, PdfLoadState } from '../types/pdf';
import type { ViewMode, ReadingDirection, ZoomState, FitMode } from '../types/settings';

// Mock PDF.js page object
const mockPdfPage = {
  getViewport: vi.fn((options: { scale: number }) => ({
    width: 800 * options.scale,
    height: 1200 * options.scale,
  })),
  render: vi.fn(() => ({
    promise: Promise.resolve(),
    cancel: vi.fn(),
  })),
};

// Mock PDF document
const mockPdfDocument: PdfDocument = {
  document: {
    getPage: vi.fn(() => Promise.resolve(mockPdfPage)),
  } as any,
  numPages: 10,
};

describe('PdfViewer', () => {
  const defaultProps = {
    pdfDocument: mockPdfDocument,
    loadState: { isLoading: false, error: null, progress: 0, isLoaded: false } as PdfLoadState,
    currentPage: 1,
    isUIVisible: true,
    viewMode: 'single' as ViewMode,
    readingDirection: 'rtl' as ReadingDirection,
    treatFirstPageAsCover: true,
    onPageChange: vi.fn(),
    onPreviousPage: vi.fn(),
    onNextPage: vi.fn(),
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onPan: vi.fn(),
  };

  const mockZoomState: ZoomState = {
    scale: 1.5,
    fitMode: 'width' as FitMode,
    offsetX: 0,
    offsetY: 0,
    minScale: 0.1,
    maxScale: 5.0,
  };

  const mockCalculateFitScale = vi.fn(() => 1.0);

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockPdfPage.getViewport.mockReturnValue({ width: 800, height: 1200 });
    mockPdfPage.render.mockReturnValue({
      promise: Promise.resolve(),
      cancel: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should render loading spinner when isLoading is true', () => {
      const loadState = { isLoading: true, error: null, progress: 0, isLoaded: false };
      const { getByText, getByRole } = render(
        <PdfViewer {...defaultProps} loadState={loadState} />
      );
      
      expect(getByRole('status', { name: 'PDF読み込み中' })).toBeInTheDocument();
      expect(getByText('PDFを読み込んでいます...')).toBeInTheDocument();
      
      const statusContainer = getByRole('status', { name: 'PDF読み込み中' });
      expect(statusContainer.querySelector('div')).toBeInTheDocument();
    });

    it('should render progress bar when loading with progress', () => {
      const loadState = { isLoading: true, error: null, progress: 50, isLoaded: false };
      const { getByRole } = render(
        <PdfViewer {...defaultProps} loadState={loadState} />
      );
      
      const progressBar = getByRole('progressbar', { name: '読み込み進行状況 50%' });
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('Error State', () => {
    it('should render error message when loadState has error', () => {
      const loadState = { isLoading: false, error: 'ファイルが見つかりません', progress: 0, isLoaded: false };
      const { getByText } = render(
        <PdfViewer {...defaultProps} loadState={loadState} />
      );
      
      expect(getByText('エラー')).toBeInTheDocument();
      expect(getByText('ファイルが見つかりません')).toBeInTheDocument();
    });
  });

  describe('No Document State', () => {
    it('should render file selection prompt when pdfDocument is null', () => {
      const { getByText } = render(
        <PdfViewer {...defaultProps} pdfDocument={null} />
      );
      
      expect(getByText('漫画本PDFビューワー')).toBeInTheDocument();
      expect(getByText('PDFファイルを選択してください')).toBeInTheDocument();
      expect(getByText('ドラッグ&ドロップまたはファイル選択ボタンから読み込み')).toBeInTheDocument();
    });
  });

  describe('PDF Rendering', () => {
    it('should render PDF display area', () => {
      const { getByRole } = render(
        <PdfViewer {...defaultProps} />
      );
      
      const pdfViewer = getByRole('main', { name: /PDFビューワー ページ 1 \/ 10/ });
      expect(pdfViewer).toBeInTheDocument();
      
      const pdfDisplayArea = getByRole('region', { name: 'PDF表示領域' });
      expect(pdfDisplayArea).toBeInTheDocument();
    });

    it('should show single page layout in single view mode', () => {
      const { getByRole } = render(
        <PdfViewer {...defaultProps} viewMode="single" />
      );
      
      const pdfViewer = getByRole('main', { name: /単ページ表示/ });
      expect(pdfViewer).toBeInTheDocument();
    });

    it('should show spread layout in spread view mode', () => {
      const { getByRole } = render(
        <PdfViewer {...defaultProps} viewMode="spread" />
      );
      
      const pdfViewer = getByRole('main', { name: /見開き表示/ });
      expect(pdfViewer).toBeInTheDocument();
    });
  });

  describe('View Mode Changes', () => {
    it('should update aria-label when viewMode changes from single to spread', () => {
      const { getByRole, rerender } = render(
        <PdfViewer {...defaultProps} viewMode="single" />
      );
      
      expect(getByRole('main', { name: /単ページ表示/ })).toBeInTheDocument();
      
      rerender(<PdfViewer {...defaultProps} viewMode="spread" />);
      
      expect(getByRole('main', { name: /見開き表示/ })).toBeInTheDocument();
    });
  });

  describe('Zoom Functionality', () => {
    it('should show grab cursor when in custom zoom mode', () => {
      const customZoomState = { ...mockZoomState, fitMode: 'custom' as FitMode };
      const { container } = render(
        <PdfViewer 
          {...defaultProps} 
          zoomState={customZoomState}
          calculateFitScale={mockCalculateFitScale}
        />
      );
      
      const viewerContainer = container.firstChild as HTMLElement;
      expect(viewerContainer).toHaveClass('cursor-grab');
    });

    it('should show pointer cursor when not in custom zoom mode', () => {
      const { container } = render(
        <PdfViewer 
          {...defaultProps} 
          zoomState={mockZoomState}
          calculateFitScale={mockCalculateFitScale}
        />
      );
      
      const viewerContainer = container.firstChild as HTMLElement;
      expect(viewerContainer).toHaveClass('cursor-pointer');
    });

    it('should accept zoom-related props', () => {
      const { getByRole } = render(
        <PdfViewer 
          {...defaultProps} 
          zoomState={mockZoomState}
          calculateFitScale={mockCalculateFitScale}
        />
      );
      
      const pdfViewer = getByRole('main', { name: /PDFビューワー/ });
      expect(pdfViewer).toBeInTheDocument();
    });
  });

  describe('Click Navigation', () => {
    it('should render clickable area for navigation', () => {
      const { container } = render(
        <PdfViewer {...defaultProps} viewMode="single" />
      );
      
      const viewerContainer = container.firstChild as HTMLElement;
      expect(viewerContainer).toHaveClass('cursor-pointer');
    });

    it('should not show click cursor when in custom zoom mode', () => {
      const customZoomState = { ...mockZoomState, fitMode: 'custom' as FitMode };
      const { container } = render(
        <PdfViewer 
          {...defaultProps} 
          zoomState={customZoomState}
          calculateFitScale={mockCalculateFitScale}
        />
      );
      
      const viewerContainer = container.firstChild as HTMLElement;
      expect(viewerContainer).toHaveClass('cursor-grab');
      expect(viewerContainer).not.toHaveClass('cursor-pointer');
    });
  });

});