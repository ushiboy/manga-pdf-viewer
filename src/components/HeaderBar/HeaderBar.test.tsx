import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeaderBar } from "./HeaderBar";
import type { ViewMode, ReadingDirection } from "../../types/settings";

describe("HeaderBar", () => {
  const defaultProps = {
    isVisible: true,
    onFileSelect: vi.fn(),
    onHide: vi.fn(),
    viewMode: "single" as ViewMode,
    readingDirection: "rtl" as ReadingDirection,
    onToggleViewMode: vi.fn(),
    onToggleReadingDirection: vi.fn(),
    isFullscreen: false,
    onToggleFullscreen: vi.fn(),
    onOpenSettings: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Visibility", () => {
    it("should be visible when isVisible is true", () => {
      const { getByRole } = render(
        <HeaderBar {...defaultProps} isVisible={true} />,
      );

      const headerBar = getByRole("toolbar");
      expect(headerBar).toHaveClass("translate-y-0", "opacity-100");
    });

    it("should be hidden when isVisible is false", () => {
      const { getByRole } = render(
        <HeaderBar {...defaultProps} isVisible={false} />,
      );

      const headerBar = getByRole("toolbar");
      expect(headerBar).toHaveClass("-translate-y-full", "opacity-0");
    });
  });

  describe("Buttons and Interactions", () => {
    it("should call onHide when hide button is clicked", async () => {
      const user = userEvent.setup();
      const { getByTitle } = render(<HeaderBar {...defaultProps} />);

      const hideButton = getByTitle("UI非表示");
      await user.click(hideButton);

      expect(defaultProps.onHide).toHaveBeenCalledOnce();
    });

    it("should trigger file input when file select button is clicked", async () => {
      const user = userEvent.setup();
      const { getByText, getByLabelText } = render(
        <HeaderBar {...defaultProps} />,
      );

      const fileButton = getByText("ファイル選択");
      const fileInput = getByLabelText(
        "PDF file selection",
      ) as HTMLInputElement;

      // Mock the click method since it's called programmatically
      const clickSpy = vi
        .spyOn(fileInput, "click")
        .mockImplementation(() => {});

      await user.click(fileButton);

      expect(clickSpy).toHaveBeenCalledOnce();
      clickSpy.mockRestore();
    });

    it("should call onFileSelect when a file is selected", () => {
      const { getByLabelText } = render(<HeaderBar {...defaultProps} />);

      const fileInput = getByLabelText(
        "PDF file selection",
      ) as HTMLInputElement;
      const mockFile = new File(["dummy content"], "test.pdf", {
        type: "application/pdf",
      });

      // Mock the files property
      Object.defineProperty(fileInput, "files", {
        value: [mockFile],
        configurable: true,
      });

      fireEvent.change(fileInput);

      expect(defaultProps.onFileSelect).toHaveBeenCalledWith(mockFile);
    });

    it("should not call onFileSelect when no file is selected", () => {
      const { getByLabelText } = render(<HeaderBar {...defaultProps} />);

      const fileInput = getByLabelText(
        "PDF file selection",
      ) as HTMLInputElement;

      // Mock empty files
      Object.defineProperty(fileInput, "files", {
        value: null,
        configurable: true,
      });

      fireEvent.change(fileInput);

      expect(defaultProps.onFileSelect).not.toHaveBeenCalled();
    });

    it("should call onToggleViewMode when view mode button is clicked", async () => {
      const user = userEvent.setup();
      const { getByTitle } = render(<HeaderBar {...defaultProps} />);

      const viewModeButton = getByTitle(/表示方式:/);
      await user.click(viewModeButton);

      expect(defaultProps.onToggleViewMode).toHaveBeenCalledOnce();
    });

    it("should call onToggleReadingDirection when reading direction button is clicked", async () => {
      const user = userEvent.setup();
      const { getByTitle } = render(<HeaderBar {...defaultProps} />);

      const readingDirectionButton = getByTitle(/読み方向:/);
      await user.click(readingDirectionButton);

      expect(defaultProps.onToggleReadingDirection).toHaveBeenCalledOnce();
    });

    it("should call onToggleFullscreen when fullscreen button is clicked", async () => {
      const user = userEvent.setup();
      const { getByTitle } = render(<HeaderBar {...defaultProps} />);

      const fullscreenButton = getByTitle(/フルスクリーン \(F11\)/);
      await user.click(fullscreenButton);

      expect(defaultProps.onToggleFullscreen).toHaveBeenCalledOnce();
    });

    it("should call onOpenSettings when settings button is clicked", async () => {
      const user = userEvent.setup();
      const { getByTitle } = render(<HeaderBar {...defaultProps} />);

      const settingsButton = getByTitle(/設定/);
      await user.click(settingsButton);

      expect(defaultProps.onOpenSettings).toHaveBeenCalledOnce();
    });
  });

  describe("View Mode Display", () => {
    it("should display view mode button with correct title when viewMode is single", () => {
      const { getByTitle } = render(
        <HeaderBar {...defaultProps} viewMode="single" />,
      );

      const viewModeButton = getByTitle(/表示方式: 単一ページ/);
      expect(viewModeButton).toBeInTheDocument();
    });

    it("should display view mode button with correct title when viewMode is spread", () => {
      const { getByTitle } = render(
        <HeaderBar {...defaultProps} viewMode="spread" />,
      );

      const viewModeButton = getByTitle(/表示方式: 見開きページ/);
      expect(viewModeButton).toBeInTheDocument();
    });
  });

  describe("Reading Direction Display", () => {
    it("should display reading direction button with correct title when readingDirection is rtl", () => {
      const { getByTitle } = render(
        <HeaderBar {...defaultProps} readingDirection="rtl" />,
      );

      const readingDirectionButton = getByTitle(/読み方向: 右→左（日本語）/);
      expect(readingDirectionButton).toBeInTheDocument();
    });

    it("should display reading direction button with correct title when readingDirection is ltr", () => {
      const { getByTitle } = render(
        <HeaderBar {...defaultProps} readingDirection="ltr" />,
      );

      const readingDirectionButton = getByTitle(/読み方向: 左→右（英語）/);
      expect(readingDirectionButton).toBeInTheDocument();
    });
  });

  describe("Fullscreen Display", () => {
    it("should display fullscreen button with correct title when not in fullscreen", () => {
      const { getByTitle } = render(
        <HeaderBar {...defaultProps} isFullscreen={false} />,
      );

      const fullscreenButton = getByTitle(/フルスクリーン \(F11\)/);
      expect(fullscreenButton).toBeInTheDocument();
    });

    it("should display fullscreen button with correct title when in fullscreen", () => {
      const { getByTitle } = render(
        <HeaderBar {...defaultProps} isFullscreen={true} />,
      );

      const fullscreenButton = getByTitle(/フルスクリーン終了 \(F11\)/);
      expect(fullscreenButton).toBeInTheDocument();
    });
  });

  describe("File Input Properties", () => {
    it("should have correct file input attributes", () => {
      const { getByLabelText } = render(<HeaderBar {...defaultProps} />);

      const fileInput = getByLabelText(
        "PDF file selection",
      ) as HTMLInputElement;
      expect(fileInput).toHaveAttribute("type", "file");
      expect(fileInput).toHaveAttribute("accept", ".pdf");
      expect(fileInput).toHaveAttribute("aria-label", "PDF file selection");
      expect(fileInput).toHaveAttribute(
        "aria-describedby",
        "file-select-description",
      );
      expect(fileInput).toHaveClass("hidden");
    });
  });

  describe("Optional Props", () => {
    it("should handle missing onToggleFullscreen prop", async () => {
      const user = userEvent.setup();
      const propsWithoutFullscreen = {
        ...defaultProps,
        onToggleFullscreen: undefined,
      };

      const { getByTitle } = render(<HeaderBar {...propsWithoutFullscreen} />);

      const fullscreenButton = getByTitle(/フルスクリーン \(F11\)/);
      await user.click(fullscreenButton);

      // Should not throw an error
      expect(true).toBe(true);
    });

    it("should default isFullscreen to false when not provided", () => {
      const propsWithoutFullscreen = {
        ...defaultProps,
        isFullscreen: undefined,
      };

      const { getByTitle } = render(<HeaderBar {...propsWithoutFullscreen} />);

      const fullscreenButton = getByTitle(/フルスクリーン \(F11\)/);
      expect(fullscreenButton).toBeInTheDocument();
    });
  });
});
