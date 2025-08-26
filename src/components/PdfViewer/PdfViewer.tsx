import React from 'react';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { PdfCanvas } from './PdfCanvas';
import { useAppContext } from '../../contexts';

export const PdfViewer: React.FC = () => {
  const { pdfDocument, loadState } = useAppContext();

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
  return <PdfCanvas pdfDocument={pdfDocument} />;
};