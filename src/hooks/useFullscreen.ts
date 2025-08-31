import { useState, useEffect, useCallback } from "react";

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // フルスクリーン状態の更新
  const updateFullscreenState = useCallback(() => {
    const fullscreenElement =
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement;

    setIsFullscreen(!!fullscreenElement);
  }, []);

  // フルスクリーンモードに入る
  const enterFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        const element = document.documentElement;

        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).mozRequestFullScreen) {
          await (element as any).mozRequestFullScreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        }
      } catch (error) {
        console.error("フルスクリーンモードに入れませんでした:", error);
      }
    }
  }, []);

  // フルスクリーンモードを終了
  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      } catch (error) {
        console.error("フルスクリーンモードを終了できませんでした:", error);
      }
    }
  }, []);

  // フルスクリーンモードの切り替え
  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // フルスクリーン状態の変化を監視
  useEffect(() => {
    const events = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "msfullscreenchange",
    ];

    events.forEach((event) => {
      document.addEventListener(event, updateFullscreenState);
    });

    // 初期状態を設定
    updateFullscreenState();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateFullscreenState);
      });
    };
  }, [updateFullscreenState]);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
};
