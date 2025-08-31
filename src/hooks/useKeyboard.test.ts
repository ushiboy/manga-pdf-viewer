import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboard } from "./useKeyboard";
import type { ReadingDirection } from "../types/settings";

// Helper function to create mock event
const createKeyboardEvent = (key: string, target?: Partial<Element>) => {
  const event = new KeyboardEvent("keydown", { key });
  if (target) {
    Object.defineProperty(event, "target", {
      value: { tagName: target.tagName || "DIV", ...target },
      enumerable: true,
    });
  }
  return event;
};

describe("useKeyboard", () => {
  const mockOnPreviousPage = vi.fn();
  const mockOnNextPage = vi.fn();
  const mockOnFullscreen = vi.fn();
  const mockOnZoomIn = vi.fn();
  const mockOnZoomOut = vi.fn();

  const defaultProps = {
    onPreviousPage: mockOnPreviousPage,
    onNextPage: mockOnNextPage,
    onFullscreen: mockOnFullscreen,
    enabled: true,
    readingDirection: "rtl" as ReadingDirection,
    onZoomIn: mockOnZoomIn,
    onZoomOut: mockOnZoomOut,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any remaining event listeners
    document.removeEventListener("keydown", vi.fn());
  });

  describe("RTL (Right-to-Left) Reading Direction", () => {
    it("should call onNextPage when ArrowLeft is pressed", () => {
      renderHook(() =>
        useKeyboard({ ...defaultProps, readingDirection: "rtl" }),
      );

      const event = createKeyboardEvent("ArrowLeft");
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      document.dispatchEvent(event);

      expect(mockOnNextPage).toHaveBeenCalledTimes(1);
      expect(mockOnPreviousPage).not.toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should call onPreviousPage when ArrowRight is pressed", () => {
      renderHook(() =>
        useKeyboard({ ...defaultProps, readingDirection: "rtl" }),
      );

      const event = createKeyboardEvent("ArrowRight");
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      document.dispatchEvent(event);

      expect(mockOnPreviousPage).toHaveBeenCalledTimes(1);
      expect(mockOnNextPage).not.toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should handle legacy key names (Left, Right)", () => {
      renderHook(() =>
        useKeyboard({ ...defaultProps, readingDirection: "rtl" }),
      );

      // Test legacy "Left" key
      document.dispatchEvent(createKeyboardEvent("Left"));
      expect(mockOnNextPage).toHaveBeenCalledTimes(1);

      // Test legacy "Right" key
      document.dispatchEvent(createKeyboardEvent("Right"));
      expect(mockOnPreviousPage).toHaveBeenCalledTimes(1);
    });
  });

  describe("LTR (Left-to-Right) Reading Direction", () => {
    it("should call onPreviousPage when ArrowLeft is pressed", () => {
      renderHook(() =>
        useKeyboard({ ...defaultProps, readingDirection: "ltr" }),
      );

      const event = createKeyboardEvent("ArrowLeft");
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      document.dispatchEvent(event);

      expect(mockOnPreviousPage).toHaveBeenCalledTimes(1);
      expect(mockOnNextPage).not.toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should call onNextPage when ArrowRight is pressed", () => {
      renderHook(() =>
        useKeyboard({ ...defaultProps, readingDirection: "ltr" }),
      );

      const event = createKeyboardEvent("ArrowRight");
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      document.dispatchEvent(event);

      expect(mockOnNextPage).toHaveBeenCalledTimes(1);
      expect(mockOnPreviousPage).not.toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("Fullscreen Functionality", () => {
    it("should call onFullscreen when F11 is pressed", () => {
      renderHook(() => useKeyboard(defaultProps));

      const event = createKeyboardEvent("F11");
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      document.dispatchEvent(event);

      expect(mockOnFullscreen).toHaveBeenCalledTimes(1);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should not call onFullscreen when F11 is pressed and onFullscreen is not provided", () => {
      const propsWithoutFullscreen = {
        ...defaultProps,
        onFullscreen: undefined,
      };

      renderHook(() => useKeyboard(propsWithoutFullscreen));

      const event = createKeyboardEvent("F11");
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      document.dispatchEvent(event);

      expect(mockOnFullscreen).not.toHaveBeenCalled();
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe("Zoom Functionality", () => {
    it("should call onZoomIn when + key is pressed", () => {
      renderHook(() => useKeyboard(defaultProps));

      const event = createKeyboardEvent("+");
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      document.dispatchEvent(event);

      expect(mockOnZoomIn).toHaveBeenCalledTimes(1);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should call onZoomOut when - key is pressed", () => {
      renderHook(() => useKeyboard(defaultProps));

      const event = createKeyboardEvent("-");
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      document.dispatchEvent(event);

      expect(mockOnZoomOut).toHaveBeenCalledTimes(1);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should not call zoom functions when they are not provided", () => {
      const propsWithoutZoom = {
        ...defaultProps,
        onZoomIn: undefined,
        onZoomOut: undefined,
      };

      renderHook(() => useKeyboard(propsWithoutZoom));

      const plusEvent = createKeyboardEvent("+");
      const minusEvent = createKeyboardEvent("-");
      const plusPreventDefaultSpy = vi.spyOn(plusEvent, "preventDefault");
      const minusPreventDefaultSpy = vi.spyOn(minusEvent, "preventDefault");

      document.dispatchEvent(plusEvent);
      document.dispatchEvent(minusEvent);

      expect(mockOnZoomIn).not.toHaveBeenCalled();
      expect(mockOnZoomOut).not.toHaveBeenCalled();
      expect(plusPreventDefaultSpy).not.toHaveBeenCalled();
      expect(minusPreventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe("Enabled/Disabled State", () => {
    it("should not handle events when disabled", () => {
      renderHook(() => useKeyboard({ ...defaultProps, enabled: false }));

      document.dispatchEvent(createKeyboardEvent("ArrowLeft"));
      document.dispatchEvent(createKeyboardEvent("F11"));
      document.dispatchEvent(createKeyboardEvent("+"));

      expect(mockOnNextPage).not.toHaveBeenCalled();
      expect(mockOnPreviousPage).not.toHaveBeenCalled();
      expect(mockOnFullscreen).not.toHaveBeenCalled();
      expect(mockOnZoomIn).not.toHaveBeenCalled();
    });
  });

  describe("Input Field Focus Handling", () => {
    it("should not handle events when focus is on INPUT element", () => {
      renderHook(() => useKeyboard(defaultProps));

      const event = createKeyboardEvent("ArrowLeft", { tagName: "INPUT" });
      document.dispatchEvent(event);

      expect(mockOnNextPage).not.toHaveBeenCalled();
      expect(mockOnPreviousPage).not.toHaveBeenCalled();
    });

    it("should not handle events when focus is on TEXTAREA element", () => {
      renderHook(() => useKeyboard(defaultProps));

      const event = createKeyboardEvent("ArrowLeft", { tagName: "TEXTAREA" });
      document.dispatchEvent(event);

      expect(mockOnNextPage).not.toHaveBeenCalled();
      expect(mockOnPreviousPage).not.toHaveBeenCalled();
    });

    it("should handle events when focus is on other elements", () => {
      renderHook(() =>
        useKeyboard({ ...defaultProps, readingDirection: "rtl" }),
      );

      const event = createKeyboardEvent("ArrowLeft", { tagName: "DIV" });
      document.dispatchEvent(event);

      expect(mockOnNextPage).toHaveBeenCalledTimes(1);
    });
  });

  describe("Unknown Keys", () => {
    it("should not handle unknown keys", () => {
      renderHook(() => useKeyboard(defaultProps));

      document.dispatchEvent(createKeyboardEvent("a"));
      document.dispatchEvent(createKeyboardEvent("Space"));
      document.dispatchEvent(createKeyboardEvent("Enter"));

      expect(mockOnNextPage).not.toHaveBeenCalled();
      expect(mockOnPreviousPage).not.toHaveBeenCalled();
      expect(mockOnFullscreen).not.toHaveBeenCalled();
      expect(mockOnZoomIn).not.toHaveBeenCalled();
      expect(mockOnZoomOut).not.toHaveBeenCalled();
    });
  });

  describe("Event Listener Cleanup", () => {
    it("should remove event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

      const { unmount } = renderHook(() => useKeyboard(defaultProps));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );
    });

    it("should update event listener when dependencies change", () => {
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

      const { rerender } = renderHook((props) => useKeyboard(props), {
        initialProps: {
          ...defaultProps,
          readingDirection: "rtl" as ReadingDirection,
        },
      });

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

      rerender({
        ...defaultProps,
        readingDirection: "ltr" as ReadingDirection,
      });

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    });
  });
});
