export type ViewMode = 'single' | 'spread';

export type ReadingDirection = 'rtl' | 'ltr'; // right-to-left (日本語) / left-to-right (英語)

export type FitMode = 'page' | 'width' | 'height' | 'custom';

export interface ViewSettings {
  viewMode: ViewMode;
  readingDirection: ReadingDirection;
  theme: 'light' | 'dark' | 'system';
  treatFirstPageAsCover: boolean;
}

export interface ZoomState {
  scale: number;
  fitMode: FitMode;
  minScale: number;
  maxScale: number;
  offsetX: number;
  offsetY: number;
}

export const DEFAULT_SETTINGS: ViewSettings = {
  viewMode: 'single',
  readingDirection: 'rtl',
  theme: 'system',
  treatFirstPageAsCover: true,
};

export const DEFAULT_ZOOM_STATE: ZoomState = {
  scale: 1.0,
  fitMode: 'page',
  minScale: 0.1,
  maxScale: 5.0,
  offsetX: 0,
  offsetY: 0,
};