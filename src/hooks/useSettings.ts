import { useState, useEffect, useCallback } from "react";
import type {
  ViewSettings,
  ViewMode,
  ReadingDirection,
} from "../types/settings";
import { DEFAULT_SETTINGS } from "../types/settings";

const STORAGE_KEY = "manga-pdf-viewer-settings";

const loadSettings = (): ViewSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn("設定の読み込みに失敗しました:", error);
  }
  return DEFAULT_SETTINGS;
};

const saveSettings = (settings: ViewSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("設定の保存に失敗しました:", error);
  }
};

export const useSettings = () => {
  const [settings, setSettings] = useState<ViewSettings>(loadSettings);

  const updateSettings = useCallback(
    (newSettings: Partial<ViewSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      saveSettings(updatedSettings);
    },
    [settings],
  );

  const setViewMode = useCallback(
    (viewMode: ViewMode) => {
      updateSettings({ viewMode });
    },
    [updateSettings],
  );

  const setReadingDirection = useCallback(
    (readingDirection: ReadingDirection) => {
      updateSettings({ readingDirection });
    },
    [updateSettings],
  );

  const setTheme = useCallback(
    (theme: ViewSettings["theme"]) => {
      updateSettings({ theme });
    },
    [updateSettings],
  );

  const setTreatFirstPageAsCover = useCallback(
    (treatFirstPageAsCover: boolean) => {
      updateSettings({ treatFirstPageAsCover });
    },
    [updateSettings],
  );

  const toggleViewMode = useCallback(() => {
    setViewMode(settings.viewMode === "single" ? "spread" : "single");
  }, [settings.viewMode, setViewMode]);

  const toggleReadingDirection = useCallback(() => {
    setReadingDirection(settings.readingDirection === "rtl" ? "ltr" : "rtl");
  }, [settings.readingDirection, setReadingDirection]);

  const toggleTreatFirstPageAsCover = useCallback(() => {
    setTreatFirstPageAsCover(!settings.treatFirstPageAsCover);
  }, [settings.treatFirstPageAsCover, setTreatFirstPageAsCover]);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }, []);

  // 初期読み込み時に設定をlocalStorageから復元
  useEffect(() => {
    const initialSettings = loadSettings();
    if (JSON.stringify(initialSettings) !== JSON.stringify(settings)) {
      setSettings(initialSettings);
    }
  }, []);

  return {
    settings,
    setViewMode,
    setReadingDirection,
    setTheme,
    setTreatFirstPageAsCover,
    toggleViewMode,
    toggleReadingDirection,
    toggleTreatFirstPageAsCover,
    updateSettings,
    resetToDefaults,
  };
};
