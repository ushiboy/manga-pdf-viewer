import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsPanel } from "./SettingsPanel";
import type { ViewMode, ReadingDirection } from "../../types/settings";

describe("SettingsPanel", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    viewMode: "single" as ViewMode,
    readingDirection: "rtl" as ReadingDirection,
    treatFirstPageAsCover: true,
    onToggleViewMode: vi.fn(),
    onToggleReadingDirection: vi.fn(),
    onToggleTreatFirstPageAsCover: vi.fn(),
    onResetSettings: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm for reset settings tests
    Object.defineProperty(window, "confirm", {
      value: vi.fn(() => true),
      writable: true,
    });
  });

  describe("Visibility Control", () => {
    it("should render when isOpen is true", () => {
      render(<SettingsPanel {...defaultProps} isOpen={true} />);

      expect(screen.getByText("設定")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<SettingsPanel {...defaultProps} isOpen={false} />);

      expect(screen.queryByText("設定")).not.toBeInTheDocument();
    });
  });

  describe("Modal Interactions", () => {
    it("should call onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<SettingsPanel {...defaultProps} />);

      const closeButton = screen.getByRole("button", {
        name: "設定パネルを閉じる",
      });
      await user.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalledOnce();
    });

    it("should call onClose when overlay is clicked", async () => {
      const user = userEvent.setup();
      const { container } = render(<SettingsPanel {...defaultProps} />);

      // Click the overlay (first child of the modal container)
      const overlay = container.querySelector(".absolute.inset-0");
      expect(overlay).toBeInTheDocument();

      await user.click(overlay!);
      expect(defaultProps.onClose).toHaveBeenCalledOnce();
    });
  });

  describe("View Mode Settings", () => {
    it("should show single page as selected when viewMode is single", () => {
      render(<SettingsPanel {...defaultProps} viewMode="single" />);

      const singlePageRadio = screen.getByRole("radio", { name: "単一ページ" });
      const spreadPageRadio = screen.getByRole("radio", {
        name: "見開きページ",
      });

      expect(singlePageRadio).toBeChecked();
      expect(spreadPageRadio).not.toBeChecked();
    });

    it("should show spread page as selected when viewMode is spread", () => {
      render(<SettingsPanel {...defaultProps} viewMode="spread" />);

      const singlePageRadio = screen.getByRole("radio", { name: "単一ページ" });
      const spreadPageRadio = screen.getByRole("radio", {
        name: "見開きページ",
      });

      expect(singlePageRadio).not.toBeChecked();
      expect(spreadPageRadio).toBeChecked();
    });

    it("should call onToggleViewMode when view mode option is clicked", async () => {
      const user = userEvent.setup();
      render(<SettingsPanel {...defaultProps} viewMode="single" />);

      const spreadPageRadio = screen.getByRole("radio", {
        name: "見開きページ",
      });
      await user.click(spreadPageRadio);

      expect(defaultProps.onToggleViewMode).toHaveBeenCalledOnce();
    });
  });

  describe("Reading Direction Settings", () => {
    it("should show RTL as selected when readingDirection is rtl", () => {
      render(<SettingsPanel {...defaultProps} readingDirection="rtl" />);

      const rtlRadio = screen.getByRole("radio", { name: "右→左（日本語）" });
      const ltrRadio = screen.getByRole("radio", { name: "左→右（英語）" });

      expect(rtlRadio).toBeChecked();
      expect(ltrRadio).not.toBeChecked();
    });

    it("should show LTR as selected when readingDirection is ltr", () => {
      render(<SettingsPanel {...defaultProps} readingDirection="ltr" />);

      const rtlRadio = screen.getByRole("radio", { name: "右→左（日本語）" });
      const ltrRadio = screen.getByRole("radio", { name: "左→右（英語）" });

      expect(rtlRadio).not.toBeChecked();
      expect(ltrRadio).toBeChecked();
    });

    it("should call onToggleReadingDirection when reading direction option is clicked", async () => {
      const user = userEvent.setup();
      render(<SettingsPanel {...defaultProps} readingDirection="rtl" />);

      const ltrRadio = screen.getByRole("radio", { name: "左→右（英語）" });
      await user.click(ltrRadio);

      expect(defaultProps.onToggleReadingDirection).toHaveBeenCalledOnce();
    });
  });

  describe("Cover Mode Settings", () => {
    it("should show cover mode as checked when treatFirstPageAsCover is true", () => {
      render(<SettingsPanel {...defaultProps} treatFirstPageAsCover={true} />);

      const coverModeCheckbox = screen.getByRole("checkbox", {
        name: "1ページ目を表紙として単独表示",
      });
      expect(coverModeCheckbox).toBeChecked();
    });

    it("should show cover mode as unchecked when treatFirstPageAsCover is false", () => {
      render(<SettingsPanel {...defaultProps} treatFirstPageAsCover={false} />);

      const coverModeCheckbox = screen.getByRole("checkbox", {
        name: "1ページ目を表紙として単独表示",
      });
      expect(coverModeCheckbox).not.toBeChecked();
    });

    it("should call onToggleTreatFirstPageAsCover when cover mode checkbox is clicked", async () => {
      const user = userEvent.setup();
      render(<SettingsPanel {...defaultProps} />);

      const coverModeCheckbox = screen.getByRole("checkbox", {
        name: "1ページ目を表紙として単独表示",
      });
      await user.click(coverModeCheckbox);

      expect(defaultProps.onToggleTreatFirstPageAsCover).toHaveBeenCalledOnce();
    });
  });

  describe("Settings Reset", () => {
    it("should call onResetSettings and onClose when reset button is clicked and confirmed", async () => {
      const user = userEvent.setup();
      vi.mocked(window.confirm).mockReturnValue(true);

      render(<SettingsPanel {...defaultProps} />);

      const resetButton = screen.getByRole("button", {
        name: "🔄 設定を初期値に戻す",
      });
      await user.click(resetButton);

      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining("設定を初期値に戻しますか？"),
      );
      expect(defaultProps.onResetSettings).toHaveBeenCalledOnce();
      expect(defaultProps.onClose).toHaveBeenCalledOnce();
    });

    it("should not call onResetSettings when reset is cancelled", async () => {
      const user = userEvent.setup();
      vi.mocked(window.confirm).mockReturnValue(false);

      render(<SettingsPanel {...defaultProps} />);

      const resetButton = screen.getByRole("button", {
        name: "🔄 設定を初期値に戻す",
      });
      await user.click(resetButton);

      expect(window.confirm).toHaveBeenCalledOnce();
      expect(defaultProps.onResetSettings).not.toHaveBeenCalled();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });
});
