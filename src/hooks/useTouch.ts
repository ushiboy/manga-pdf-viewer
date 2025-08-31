import { useCallback, useRef } from "react";
import type { ViewMode, ReadingDirection } from "../types/settings";

interface UseTouchProps {
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  onZoomIn?: (currentDisplayScale?: number) => void;
  onZoomOut?: (currentDisplayScale?: number) => void;
  onPan?: (
    offsetX: number,
    offsetY: number,
    containerWidth?: number,
    containerHeight?: number,
    pageWidth?: number,
    pageHeight?: number,
  ) => void;
  enabled?: boolean;
  viewMode?: ViewMode;
  readingDirection?: ReadingDirection;
  isZoomed?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
}

export const useTouch = ({
  onPreviousPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onPan,
  enabled = true,
  viewMode = "single",
  readingDirection = "rtl",
  isZoomed = false,
}: UseTouchProps) => {
  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const initialDistanceRef = useRef<number>(0);
  const lastScaleRef = useRef<number>(1);
  const isPinchingRef = useRef<boolean>(false);
  const panStartRef = useRef<TouchPoint | null>(null);
  const lastPanPositionRef = useRef<TouchPoint>({ x: 0, y: 0 });

  // 2点間の距離を計算
  const getDistance = useCallback(
    (touch1: React.Touch, touch2: React.Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    },
    [],
  );

  // タッチ開始ハンドラー
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!enabled) return;

      const touches = event.touches;

      if (touches.length === 1) {
        // 単一タッチ - タップまたはスワイプの開始
        const touch = touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        touchStartTimeRef.current = Date.now();
        isPinchingRef.current = false;

        // ズーム状態でのパン操作の準備
        if (isZoomed && onPan) {
          panStartRef.current = { x: touch.clientX, y: touch.clientY };
        }
      } else if (touches.length === 2) {
        // 2点タッチ - ピンチズームの開始
        event.preventDefault();
        const distance = getDistance(touches[0], touches[1]);
        initialDistanceRef.current = distance;
        lastScaleRef.current = 1;
        isPinchingRef.current = true;
        touchStartRef.current = null; // スワイプ無効化
      }
    },
    [enabled, isZoomed, onPan, getDistance],
  );

  // タッチ移動ハンドラー
  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!enabled) return;

      const touches = event.touches;

      if (
        touches.length === 2 &&
        isPinchingRef.current &&
        onZoomIn &&
        onZoomOut
      ) {
        // ピンチズーム処理
        event.preventDefault();
        const currentDistance = getDistance(touches[0], touches[1]);
        const scale = currentDistance / initialDistanceRef.current;

        const scaleChange = scale / lastScaleRef.current;
        lastScaleRef.current = scale;

        if (scaleChange > 1.02) {
          // ズームイン
          onZoomIn();
        } else if (scaleChange < 0.98) {
          // ズームアウト
          onZoomOut();
        }
      } else if (
        touches.length === 1 &&
        isZoomed &&
        onPan &&
        panStartRef.current
      ) {
        // ズーム状態でのパン操作
        event.preventDefault();
        const touch = touches[0];
        const deltaX = touch.clientX - panStartRef.current.x;
        const deltaY = touch.clientY - panStartRef.current.y;

        const newOffsetX = lastPanPositionRef.current.x + deltaX;
        const newOffsetY = lastPanPositionRef.current.y + deltaY;

        onPan(newOffsetX, newOffsetY);
      }
    },
    [enabled, isZoomed, onPan, onZoomIn, onZoomOut, getDistance],
  );

  // タップ処理
  const handleTap = useCallback(
    (touchPoint: TouchPoint, element: HTMLDivElement) => {
      if (!onPreviousPage || !onNextPage) return;

      const rect = element.getBoundingClientRect();
      const tapX = touchPoint.x - rect.left;
      const centerX = rect.width / 2;

      if (viewMode === "single") {
        if (tapX < centerX) {
          // 左半分タップ：RTLなら次のページ、LTRなら前のページ
          if (readingDirection === "rtl") {
            onNextPage();
          } else {
            onPreviousPage();
          }
        } else {
          // 右半分タップ：RTLなら前のページ、LTRなら次のページ
          if (readingDirection === "rtl") {
            onPreviousPage();
          } else {
            onNextPage();
          }
        }
      } else {
        // 見開き表示時のタップナビゲーション
        const shouldGoNext =
          (readingDirection === "rtl" && tapX < centerX) ||
          (readingDirection === "ltr" && tapX >= centerX);

        if (shouldGoNext) {
          onNextPage();
        } else {
          onPreviousPage();
        }
      }
    },
    [onPreviousPage, onNextPage, viewMode, readingDirection],
  );

  // スワイプ処理
  const handleSwipe = useCallback(
    (deltaX: number) => {
      if (!onPreviousPage || !onNextPage) return;

      if (deltaX > 0) {
        // 右スワイプ（左→右）：RTLなら次のページ、LTRなら前のページ
        if (readingDirection === "rtl") {
          onNextPage();
        } else {
          onPreviousPage();
        }
      } else {
        // 左スワイプ（右→左）：RTLなら前のページ、LTRなら次のページ
        if (readingDirection === "rtl") {
          onPreviousPage();
        } else {
          onNextPage();
        }
      }
    },
    [onPreviousPage, onNextPage, readingDirection],
  );

  // タッチ終了ハンドラー
  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!enabled) return;

      const touches = event.changedTouches;

      if (isPinchingRef.current) {
        // ピンチ終了
        isPinchingRef.current = false;
        return;
      }

      if (touches.length === 1 && touchStartRef.current) {
        const touch = touches[0];
        const touchEnd = { x: touch.clientX, y: touch.clientY };
        const touchDuration = Date.now() - touchStartTimeRef.current;

        const deltaX = touchEnd.x - touchStartRef.current.x;
        const deltaY = touchEnd.y - touchStartRef.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const SWIPE_THRESHOLD = 50; // スワイプと判定する最小距離
        const TAP_THRESHOLD = 10; // タップと判定する最大距離
        const TAP_TIME_THRESHOLD = 300; // タップと判定する最大時間

        if (distance < TAP_THRESHOLD && touchDuration < TAP_TIME_THRESHOLD) {
          // タップ処理
          handleTap(touchEnd, event.currentTarget);
        } else if (
          Math.abs(deltaX) > SWIPE_THRESHOLD &&
          Math.abs(deltaX) > Math.abs(deltaY)
        ) {
          // 水平スワイプ処理
          handleSwipe(deltaX);
        }
      }

      // リセット
      touchStartRef.current = null;
      panStartRef.current = null;
    },
    [enabled, handleTap, handleSwipe],
  );

  // パン位置の更新
  const updatePanPosition = useCallback((offsetX: number, offsetY: number) => {
    lastPanPositionRef.current = { x: offsetX, y: offsetY };
  }, []);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    updatePanPosition,
  };
};
