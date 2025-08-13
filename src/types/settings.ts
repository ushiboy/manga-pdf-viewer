export type ViewMode = 'single' | 'spread';

export type ReadingDirection = 'rtl' | 'ltr'; // right-to-left (日本語) / left-to-right (英語)

export interface ViewSettings {
  viewMode: ViewMode;
  readingDirection: ReadingDirection;
  theme: 'light' | 'dark' | 'system';
}

export const DEFAULT_SETTINGS: ViewSettings = {
  viewMode: 'single',
  readingDirection: 'rtl',
  theme: 'system',
};