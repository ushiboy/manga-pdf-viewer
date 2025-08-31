import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSettings } from "./useSettings";
import { DEFAULT_SETTINGS } from "../types/settings";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock console.warn to avoid noise in tests
const originalConsoleWarn = console.warn;

describe("useSettings", () => {
  beforeEach(() => {
    console.warn = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
  });

  it("should load stored settings on initialization", () => {
    const storedSettings = {
      viewMode: "spread",
      readingDirection: "ltr",
      theme: "dark",
      treatFirstPageAsCover: false,
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedSettings));

    const { result } = renderHook(() => useSettings());

    expect(result.current.settings).toEqual({
      ...DEFAULT_SETTINGS,
      ...storedSettings,
    });
  });

  it("should handle malformed JSON in localStorage gracefully", () => {
    localStorageMock.getItem.mockReturnValue("invalid json");

    const { result } = renderHook(() => useSettings());

    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    expect(console.warn).toHaveBeenCalledWith(
      "設定の読み込みに失敗しました:",
      expect.any(Error),
    );
  });

  describe("setViewMode", () => {
    it("should update view mode and save to localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.setViewMode("spread");
      });

      expect(result.current.settings.viewMode).toBe("spread");
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "manga-pdf-viewer-settings",
        JSON.stringify({ ...DEFAULT_SETTINGS, viewMode: "spread" }),
      );
    });
  });

  describe("setReadingDirection", () => {
    it("should update reading direction and save to localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.setReadingDirection("ltr");
      });

      expect(result.current.settings.readingDirection).toBe("ltr");
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "manga-pdf-viewer-settings",
        JSON.stringify({ ...DEFAULT_SETTINGS, readingDirection: "ltr" }),
      );
    });
  });

  describe("setTheme", () => {
    it("should update theme and save to localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.setTheme("dark");
      });

      expect(result.current.settings.theme).toBe("dark");
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "manga-pdf-viewer-settings",
        JSON.stringify({ ...DEFAULT_SETTINGS, theme: "dark" }),
      );
    });
  });

  describe("setTreatFirstPageAsCover", () => {
    it("should update treatFirstPageAsCover and save to localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.setTreatFirstPageAsCover(false);
      });

      expect(result.current.settings.treatFirstPageAsCover).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "manga-pdf-viewer-settings",
        JSON.stringify({ ...DEFAULT_SETTINGS, treatFirstPageAsCover: false }),
      );
    });
  });

  describe("toggleViewMode", () => {
    it("should toggle from single to spread", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ ...DEFAULT_SETTINGS, viewMode: "single" }),
      );

      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.toggleViewMode();
      });

      expect(result.current.settings.viewMode).toBe("spread");
    });

    it("should toggle from spread to single", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ ...DEFAULT_SETTINGS, viewMode: "spread" }),
      );

      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.toggleViewMode();
      });

      expect(result.current.settings.viewMode).toBe("single");
    });
  });

  describe("toggleReadingDirection", () => {
    it("should toggle from rtl to ltr", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ ...DEFAULT_SETTINGS, readingDirection: "rtl" }),
      );

      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.toggleReadingDirection();
      });

      expect(result.current.settings.readingDirection).toBe("ltr");
    });

    it("should toggle from ltr to rtl", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ ...DEFAULT_SETTINGS, readingDirection: "ltr" }),
      );

      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.toggleReadingDirection();
      });

      expect(result.current.settings.readingDirection).toBe("rtl");
    });
  });

  describe("toggleTreatFirstPageAsCover", () => {
    it("should toggle treatFirstPageAsCover from true to false", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ ...DEFAULT_SETTINGS, treatFirstPageAsCover: true }),
      );

      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.toggleTreatFirstPageAsCover();
      });

      expect(result.current.settings.treatFirstPageAsCover).toBe(false);
    });

    it("should toggle treatFirstPageAsCover from false to true", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ ...DEFAULT_SETTINGS, treatFirstPageAsCover: false }),
      );

      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.toggleTreatFirstPageAsCover();
      });

      expect(result.current.settings.treatFirstPageAsCover).toBe(true);
    });
  });

  describe("updateSettings", () => {
    it("should update multiple settings at once", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useSettings());

      const newSettings = {
        viewMode: "spread" as const,
        readingDirection: "ltr" as const,
        theme: "dark" as const,
      };

      act(() => {
        result.current.updateSettings(newSettings);
      });

      expect(result.current.settings).toEqual({
        ...DEFAULT_SETTINGS,
        ...newSettings,
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "manga-pdf-viewer-settings",
        JSON.stringify({ ...DEFAULT_SETTINGS, ...newSettings }),
      );
    });
  });

  describe("resetToDefaults", () => {
    it("should reset settings to defaults", () => {
      const customSettings = {
        viewMode: "spread",
        readingDirection: "ltr",
        theme: "dark",
        treatFirstPageAsCover: false,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(customSettings));

      const { result } = renderHook(() => useSettings());

      // Verify custom settings are loaded
      expect(result.current.settings).toEqual({
        ...DEFAULT_SETTINGS,
        ...customSettings,
      });

      act(() => {
        result.current.resetToDefaults();
      });

      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "manga-pdf-viewer-settings",
        JSON.stringify(DEFAULT_SETTINGS),
      );
    });
  });

  describe("localStorage error handling", () => {
    it("should handle localStorage setItem errors gracefully", () => {
      localStorageMock.getItem.mockReturnValue(null);
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.setViewMode("spread");
      });

      // Settings should still be updated in memory
      expect(result.current.settings.viewMode).toBe("spread");
      expect(console.warn).toHaveBeenCalledWith(
        "設定の保存に失敗しました:",
        expect.any(Error),
      );
    });
  });
});
