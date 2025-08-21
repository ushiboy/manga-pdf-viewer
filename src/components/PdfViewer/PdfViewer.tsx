import React from 'react';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { PdfCanvas } from './PdfCanvas';
import type { PdfDocument, PdfLoadState } from '../../types/pdf';
import type { ViewMode, ReadingDirection, ZoomState, FitMode } from '../../types/settings';

interface PdfViewerProps {
  pdfDocument: PdfDocument | null;
  loadState: PdfLoadState;
  currentPage: number;
  isUIVisible: boolean;
  viewMode: ViewMode;
  readingDirection: ReadingDirection;
  treatFirstPageAsCover: boolean;
  zoomState?: ZoomState;
  calculateFitScale?: (
    pageWidth: number,
    pageHeight: number,
    containerWidth: number,
    containerHeight: number,
    fitMode: FitMode
  ) => number;
  onPageChange?: (page: number) => void;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  onZoomIn?: (currentDisplayScale?: number) => void;
  onZoomOut?: (currentDisplayScale?: number) => void;
  onPan?: (deltaX: number, deltaY: number, containerWidth?: number, containerHeight?: number, pageWidth?: number, pageHeight?: number) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = (props) => {
  const { pdfDocument, loadState } = props;

  // Loading state
  if (loadState.isLoading) {
    return <LoadingState progress={loadState.progress} />;
  }

  // Error state
  if (loadState.error) {
    return <ErrorState error={loadState.error} />;
  }

  // Empty state (no PDF selected)
  if (!pdfDocument) {
    return <EmptyState />;
  }

  // PDF display state
  return <PdfCanvas {...props} pdfDocument={pdfDocument} />;
};