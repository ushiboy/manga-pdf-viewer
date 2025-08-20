import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PWAUpdateNotification } from './PWAUpdateNotification';

// Mock virtual:pwa-register/react
const mockUpdateServiceWorker = vi.fn();
const mockSetOfflineReady = vi.fn();
const mockSetNeedRefresh = vi.fn();

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn(() => ({
    offlineReady: [false, mockSetOfflineReady],
    needRefresh: [false, mockSetNeedRefresh],
    updateServiceWorker: mockUpdateServiceWorker,
  })),
}));

// Import the mocked hook
import { useRegisterSW } from 'virtual:pwa-register/react';
const mockUseRegisterSW = vi.mocked(useRegisterSW);

describe('PWAUpdateNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default mock implementation
    mockUseRegisterSW.mockReturnValue({
      offlineReady: [false, mockSetOfflineReady],
      needRefresh: [false, mockSetNeedRefresh],
      updateServiceWorker: mockUpdateServiceWorker,
    });
  });

  describe('Visibility Control', () => {
    it('should not render when neither offlineReady nor needRefresh is true', () => {
      const { queryByText } = render(<PWAUpdateNotification />);
      
      expect(queryByText('アプリがオフラインで利用可能になりました！')).not.toBeInTheDocument();
      expect(queryByText('アプリの新しいバージョンが利用可能です')).not.toBeInTheDocument();
    });

    it('should render when offlineReady is true', () => {
      mockUseRegisterSW.mockReturnValue({
        offlineReady: [true, mockSetOfflineReady],
        needRefresh: [false, mockSetNeedRefresh],
        updateServiceWorker: mockUpdateServiceWorker,
      });

      const { getByText } = render(<PWAUpdateNotification />);
      
      expect(getByText('アプリがオフラインで利用可能になりました！')).toBeInTheDocument();
    });

    it('should render when needRefresh is true', () => {
      mockUseRegisterSW.mockReturnValue({
        offlineReady: [false, mockSetOfflineReady],
        needRefresh: [true, mockSetNeedRefresh],
        updateServiceWorker: mockUpdateServiceWorker,
      });

      const { getByText } = render(<PWAUpdateNotification />);
      
      expect(getByText('アプリの新しいバージョンが利用可能です')).toBeInTheDocument();
    });

    it('should render when both offlineReady and needRefresh are true', () => {
      mockUseRegisterSW.mockReturnValue({
        offlineReady: [true, mockSetOfflineReady],
        needRefresh: [true, mockSetNeedRefresh],
        updateServiceWorker: mockUpdateServiceWorker,
      });

      const { getByText } = render(<PWAUpdateNotification />);
      
      // Should show offlineReady message when both are true (offlineReady takes priority)
      expect(getByText('アプリがオフラインで利用可能になりました！')).toBeInTheDocument();
      // But should also show update prompt text because needRefresh is true
      expect(getByText('更新を適用しますか？')).toBeInTheDocument();
    });
  });

  describe('Offline Ready State', () => {
    beforeEach(() => {
      mockUseRegisterSW.mockReturnValue({
        offlineReady: [true, mockSetOfflineReady],
        needRefresh: [false, mockSetNeedRefresh],
        updateServiceWorker: mockUpdateServiceWorker,
      });
    });

    it('should show offline ready message', () => {
      const { getByText } = render(<PWAUpdateNotification />);
      
      expect(getByText('アプリがオフラインで利用可能になりました！')).toBeInTheDocument();
    });

    it('should show close button only', () => {
      const { getByRole, queryByRole } = render(<PWAUpdateNotification />);
      
      expect(getByRole('button', { name: '通知を閉じる' })).toBeInTheDocument();
      expect(queryByRole('button', { name: 'アプリを更新する' })).not.toBeInTheDocument();
    });

    it('should call setters when close button is clicked', async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<PWAUpdateNotification />);
      
      const closeButton = getByRole('button', { name: '通知を閉じる' });
      await user.click(closeButton);
      
      expect(mockSetOfflineReady).toHaveBeenCalledWith(false);
      expect(mockSetNeedRefresh).toHaveBeenCalledWith(false);
    });
  });

  describe('Need Refresh State', () => {
    beforeEach(() => {
      mockUseRegisterSW.mockReturnValue({
        offlineReady: [false, mockSetOfflineReady],
        needRefresh: [true, mockSetNeedRefresh],
        updateServiceWorker: mockUpdateServiceWorker,
      });
    });

    it('should show update available message', () => {
      const { getByText } = render(<PWAUpdateNotification />);
      
      expect(getByText('アプリの新しいバージョンが利用可能です')).toBeInTheDocument();
    });

    it('should show additional update prompt text', () => {
      const { getByText } = render(<PWAUpdateNotification />);
      
      expect(getByText('更新を適用しますか？')).toBeInTheDocument();
    });

    it('should show both update and close buttons', () => {
      const { getByRole } = render(<PWAUpdateNotification />);
      
      expect(getByRole('button', { name: 'アプリを更新する' })).toBeInTheDocument();
      expect(getByRole('button', { name: '通知を閉じる' })).toBeInTheDocument();
    });

    it('should call updateServiceWorker when update button is clicked', async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<PWAUpdateNotification />);
      
      const updateButton = getByRole('button', { name: 'アプリを更新する' });
      await user.click(updateButton);
      
      expect(mockUpdateServiceWorker).toHaveBeenCalledWith(true);
    });

    it('should call setters when close button is clicked', async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<PWAUpdateNotification />);
      
      const closeButton = getByRole('button', { name: '通知を閉じる' });
      await user.click(closeButton);
      
      expect(mockSetOfflineReady).toHaveBeenCalledWith(false);
      expect(mockSetNeedRefresh).toHaveBeenCalledWith(false);
    });
  });

});