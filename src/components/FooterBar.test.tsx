import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FooterBar } from './FooterBar';
import type { ViewMode, ReadingDirection } from '../types/settings';

describe('FooterBar', () => {
  const defaultProps = {
    isVisible: true,
    currentPage: 3,
    totalPages: 10,
    viewMode: 'single' as ViewMode,
    readingDirection: 'rtl' as ReadingDirection,
    onPageChange: vi.fn(),
    onPreviousPage: vi.fn(),
    onNextPage: vi.fn(),
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onToggleFitMode: vi.fn(),
    onGoToFirst: vi.fn(),
    onGoToLast: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Visibility', () => {
    it('should be visible when isVisible is true', () => {
      const { getByRole } = render(<FooterBar {...defaultProps} isVisible={true} />);
      
      const footerBar = getByRole('toolbar');
      expect(footerBar).toHaveClass('translate-y-0', 'opacity-100');
    });

    it('should be hidden when isVisible is false', () => {
      const { getByRole } = render(<FooterBar {...defaultProps} isVisible={false} />);
      
      const footerBar = getByRole('toolbar');
      expect(footerBar).toHaveClass('translate-y-full', 'opacity-0');
    });
  });

  describe('Zoom Controls', () => {
    it('should call onZoomOut when zoom out button is clicked', async () => {
      const user = userEvent.setup();
      const { getByTitle } = render(<FooterBar {...defaultProps} />);
      
      const zoomOutButton = getByTitle('ズームアウト');
      await user.click(zoomOutButton);
      
      expect(defaultProps.onZoomOut).toHaveBeenCalledOnce();
    });

    it('should call onZoomIn when zoom in button is clicked', async () => {
      const user = userEvent.setup();
      const { getByTitle } = render(<FooterBar {...defaultProps} />);
      
      const zoomInButton = getByTitle('ズームイン');
      await user.click(zoomInButton);
      
      expect(defaultProps.onZoomIn).toHaveBeenCalledOnce();
    });

    it('should call onToggleFitMode when fit mode button is clicked', async () => {
      const user = userEvent.setup();
      const { getByTitle } = render(<FooterBar {...defaultProps} />);
      
      const fitModeButton = getByTitle('フィット表示');
      await user.click(fitModeButton);
      
      expect(defaultProps.onToggleFitMode).toHaveBeenCalledOnce();
    });

    it('should disable zoom out button when onZoomOut is not provided', () => {
      const propsWithoutZoomOut = { ...defaultProps };
      delete propsWithoutZoomOut.onZoomOut;
      
      const { getByTitle } = render(<FooterBar {...propsWithoutZoomOut} />);
      
      const zoomOutButton = getByTitle('ズームアウト');
      expect(zoomOutButton).toBeDisabled();
    });

    it('should disable zoom in button when onZoomIn is not provided', () => {
      const propsWithoutZoomIn = { ...defaultProps };
      delete propsWithoutZoomIn.onZoomIn;
      
      const { getByTitle } = render(<FooterBar {...propsWithoutZoomIn} />);
      
      const zoomInButton = getByTitle('ズームイン');
      expect(zoomInButton).toBeDisabled();
    });
  });

  describe('Page Input', () => {
    it('should display current page in input field', () => {
      const { getByLabelText } = render(<FooterBar {...defaultProps} currentPage={5} />);
      
      const pageInput = getByLabelText('Current page number') as HTMLInputElement;
      expect(pageInput.value).toBe('5');
    });

    it('should display total pages', () => {
      const { getByText } = render(<FooterBar {...defaultProps} totalPages={15} />);
      
      expect(getByText('/ 15')).toBeInTheDocument();
    });

    it('should call onPageChange when valid page number is entered and Enter is pressed', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(<FooterBar {...defaultProps} />);
      
      const pageInput = getByLabelText('Current page number') as HTMLInputElement;
      
      await user.clear(pageInput);
      await user.type(pageInput, '7');
      await user.keyboard('{Enter}');
      
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(7);
    });

    it('should call onPageChange when valid page number is entered and input loses focus', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(<FooterBar {...defaultProps} />);
      
      const pageInput = getByLabelText('Current page number') as HTMLInputElement;
      
      await user.clear(pageInput);
      await user.type(pageInput, '8');
      await user.tab(); // Trigger blur
      
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(8);
    });

    it('should reset input to current page when invalid page number is entered', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(<FooterBar {...defaultProps} currentPage={3} />);
      
      const pageInput = getByLabelText('Current page number') as HTMLInputElement;
      
      await user.clear(pageInput);
      await user.type(pageInput, '15'); // Greater than totalPages (10)
      await user.keyboard('{Enter}');
      
      expect(defaultProps.onPageChange).not.toHaveBeenCalled();
      expect(pageInput.value).toBe('3'); // Reset to current page
    });

    it('should update input value when currentPage prop changes', () => {
      const { getByLabelText, rerender } = render(<FooterBar {...defaultProps} currentPage={3} />);
      
      const pageInput = getByLabelText('Current page number') as HTMLInputElement;
      expect(pageInput.value).toBe('3');
      
      rerender(<FooterBar {...defaultProps} currentPage={7} />);
      expect(pageInput.value).toBe('7');
    });
  });

  describe('Navigation Controls - LTR Mode', () => {
    const ltrProps = { ...defaultProps, readingDirection: 'ltr' as ReadingDirection };

    it('should have correct button titles in LTR mode', () => {
      const { getByTitle } = render(<FooterBar {...ltrProps} />);
      
      expect(getByTitle('先頭ページ')).toBeInTheDocument();
      expect(getByTitle('前のページ')).toBeInTheDocument();
      expect(getByTitle('次のページ')).toBeInTheDocument();
      expect(getByTitle('末尾ページ')).toBeInTheDocument();
    });

    it('should call onGoToFirst when first page button is clicked in LTR', async () => {
      const user = userEvent.setup();
      const { getByTitle } = render(<FooterBar {...ltrProps} />);
      
      const firstButton = getByTitle('先頭ページ');
      await user.click(firstButton);
      
      expect(ltrProps.onGoToFirst).toHaveBeenCalledOnce();
    });

    it('should call onPreviousPage when previous button is clicked in LTR', async () => {
      const user = userEvent.setup();
      const { getByTitle } = render(<FooterBar {...ltrProps} />);
      
      const prevButton = getByTitle('前のページ');
      await user.click(prevButton);
      
      expect(ltrProps.onPreviousPage).toHaveBeenCalledOnce();
    });

    it('should call onNextPage when next button is clicked in LTR', async () => {
      const user = userEvent.setup();
      const { getByTitle } = render(<FooterBar {...ltrProps} />);
      
      const nextButton = getByTitle('次のページ');
      await user.click(nextButton);
      
      expect(ltrProps.onNextPage).toHaveBeenCalledOnce();
    });

    it('should disable first and previous buttons at first page in LTR', () => {
      const { getByTitle } = render(<FooterBar {...ltrProps} currentPage={1} />);
      
      const firstButton = getByTitle('先頭ページ');
      const prevButton = getByTitle('前のページ');
      
      expect(firstButton).toBeDisabled();
      expect(prevButton).toBeDisabled();
    });
  });

  describe('Navigation Controls - RTL Mode', () => {
    const rtlProps = { ...defaultProps, readingDirection: 'rtl' as ReadingDirection };

    it('should have correct button titles in RTL mode', () => {
      const { getByTitle } = render(<FooterBar {...rtlProps} />);
      
      expect(getByTitle('末尾ページ')).toBeInTheDocument(); // First button maps to last in RTL
      expect(getByTitle('次のページ')).toBeInTheDocument(); // Prev button maps to next in RTL
      expect(getByTitle('前のページ')).toBeInTheDocument(); // Next button maps to prev in RTL
      expect(getByTitle('先頭ページ')).toBeInTheDocument(); // Last button maps to first in RTL
    });

    it('should call onGoToLast when first button is clicked in RTL (reversed)', async () => {
      const user = userEvent.setup();
      const { getByTitle } = render(<FooterBar {...rtlProps} />);
      
      const firstButton = getByTitle('末尾ページ');
      await user.click(firstButton);
      
      expect(rtlProps.onGoToLast).toHaveBeenCalledOnce();
    });

    it('should call onNextPage when previous button is clicked in RTL (reversed)', async () => {
      const user = userEvent.setup();
      const { getByTitle } = render(<FooterBar {...rtlProps} />);
      
      const prevButton = getByTitle('次のページ');
      await user.click(prevButton);
      
      expect(rtlProps.onNextPage).toHaveBeenCalledOnce();
    });

    it('should call onPreviousPage when next button is clicked in RTL (reversed)', async () => {
      const user = userEvent.setup();
      const { getByTitle } = render(<FooterBar {...rtlProps} />);
      
      const nextButton = getByTitle('前のページ');
      await user.click(nextButton);
      
      expect(rtlProps.onPreviousPage).toHaveBeenCalledOnce();
    });
  });

  describe('View Mode Behavior', () => {
    describe('Single Page Mode', () => {
      const singlePageProps = { ...defaultProps, viewMode: 'single' as ViewMode, readingDirection: 'rtl' as ReadingDirection };

      it('should disable navigation buttons when at last page in single mode RTL', () => {
        const { getByTitle } = render(<FooterBar {...singlePageProps} currentPage={10} totalPages={10} />);
        
        // In RTL mode at last page (page 10), the "previous" and "first" buttons should be disabled
        const prevButton = getByTitle('次のページ'); // RTL reversed: prev becomes next
        const firstButton = getByTitle('末尾ページ'); // RTL reversed: first becomes last
        
        expect(prevButton).toBeDisabled();
        expect(firstButton).toBeDisabled();
      });

      it('should disable navigation buttons when at first page in single mode RTL', () => {
        const { getByTitle } = render(<FooterBar {...singlePageProps} currentPage={1} totalPages={10} />);
        
        // In RTL mode at first page (page 1), the "next" and "last" buttons should be disabled
        const nextButton = getByTitle('前のページ'); // RTL reversed: next becomes prev
        const lastButton = getByTitle('先頭ページ'); // RTL reversed: last becomes first
        
        expect(nextButton).toBeDisabled();
        expect(lastButton).toBeDisabled();
      });
    });

    describe('Spread Page Mode', () => {
      const spreadPageProps = { ...defaultProps, viewMode: 'spread' as ViewMode, readingDirection: 'rtl' as ReadingDirection };

      it('should handle spread page navigation logic correctly', () => {
        // Test at second-to-last page in spread mode
        const { getByTitle } = render(<FooterBar {...spreadPageProps} currentPage={9} totalPages={10} />);
        
        // In RTL spread mode, navigation should be based on spread logic
        const prevButton = getByTitle('次のページ'); // RTL reversed
        const firstButton = getByTitle('末尾ページ'); // RTL reversed
        
        // At page 9 of 10, in spread mode, should be disabled
        expect(prevButton).toBeDisabled();
        expect(firstButton).toBeDisabled();
      });
    });
  });

  describe('Button Icons', () => {
    it('should display correct emoji icons', () => {
      const { getByTitle } = render(<FooterBar {...defaultProps} />);
      
      expect(getByTitle('ズームアウト')).toHaveTextContent('➖');
      expect(getByTitle('ズームイン')).toHaveTextContent('➕');
      expect(getByTitle('フィット表示')).toHaveTextContent('🔍');
      expect(getByTitle('末尾ページ')).toHaveTextContent('⏮️');
      expect(getByTitle('次のページ')).toHaveTextContent('⬅️');
      expect(getByTitle('前のページ')).toHaveTextContent('➡️');
      expect(getByTitle('先頭ページ')).toHaveTextContent('⏭️');
    });
  });

  describe('Optional Props', () => {
    it('should handle missing navigation handlers', () => {
      const propsWithoutHandlers = {
        ...defaultProps,
        onPreviousPage: undefined,
        onNextPage: undefined,
        onGoToFirst: undefined,
        onGoToLast: undefined,
      };
      
      const { getByTitle } = render(<FooterBar {...propsWithoutHandlers} />);
      
      // All navigation buttons should be disabled when handlers are missing
      expect(getByTitle('末尾ページ')).toBeDisabled();
      expect(getByTitle('次のページ')).toBeDisabled();
      expect(getByTitle('前のページ')).toBeDisabled();
      expect(getByTitle('先頭ページ')).toBeDisabled();
    });
  });

  describe('Input Validation', () => {
    it('should reject non-numeric input', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(<FooterBar {...defaultProps} currentPage={5} />);
      
      const pageInput = getByLabelText('Current page number') as HTMLInputElement;
      
      await user.clear(pageInput);
      await user.type(pageInput, 'abc');
      await user.keyboard('{Enter}');
      
      expect(defaultProps.onPageChange).not.toHaveBeenCalled();
      expect(pageInput.value).toBe('5'); // Reset to current page
    });

    it('should reject page numbers below 1', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(<FooterBar {...defaultProps} currentPage={5} />);
      
      const pageInput = getByLabelText('Current page number') as HTMLInputElement;
      
      await user.clear(pageInput);
      await user.type(pageInput, '0');
      await user.keyboard('{Enter}');
      
      expect(defaultProps.onPageChange).not.toHaveBeenCalled();
      expect(pageInput.value).toBe('5'); // Reset to current page
    });

    it('should have correct input attributes', () => {
      const { getByLabelText } = render(<FooterBar {...defaultProps} totalPages={20} />);
      
      const pageInput = getByLabelText('Current page number') as HTMLInputElement;
      
      expect(pageInput).toHaveAttribute('type', 'number');
      expect(pageInput).toHaveAttribute('min', '1');
      expect(pageInput).toHaveAttribute('max', '20');
      expect(pageInput).toHaveAttribute('aria-label', 'Current page number');
    });
  });
});