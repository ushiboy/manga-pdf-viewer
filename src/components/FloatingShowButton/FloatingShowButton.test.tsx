import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FloatingShowButton } from "./FloatingShowButton";

describe("FloatingShowButton", () => {
  const defaultProps = {
    isVisible: false,
    onShow: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Visibility Control", () => {
    it("should render when isVisible is false", () => {
      const { getByTitle } = render(
        <FloatingShowButton {...defaultProps} isVisible={false} />,
      );

      const button = getByTitle("UI表示");
      expect(button).toBeInTheDocument();
    });

    it("should not render when isVisible is true", () => {
      const { queryByTitle } = render(
        <FloatingShowButton {...defaultProps} isVisible={true} />,
      );

      const button = queryByTitle("UI表示");
      expect(button).not.toBeInTheDocument();
    });
  });

  describe("Button Interactions", () => {
    it("should call onShow when button is clicked", async () => {
      const user = userEvent.setup();
      const { getByTitle } = render(<FloatingShowButton {...defaultProps} />);

      const button = getByTitle("UI表示");
      await user.click(button);

      expect(defaultProps.onShow).toHaveBeenCalledOnce();
    });
  });

  describe("Conditional Rendering", () => {
    it("should render nothing when isVisible is true (early return)", () => {
      const { queryByRole } = render(
        <FloatingShowButton {...defaultProps} isVisible={true} />,
      );

      const regionElement = queryByRole("region");
      expect(regionElement).not.toBeInTheDocument();
    });

    it("should render button container when isVisible is false", () => {
      const { getByRole } = render(
        <FloatingShowButton {...defaultProps} isVisible={false} />,
      );

      const regionElement = getByRole("region");
      expect(regionElement).toBeInTheDocument();
    });
  });
});
