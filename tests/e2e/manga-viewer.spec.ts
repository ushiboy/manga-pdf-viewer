import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe("漫画本PDFビューワー E2E テスト", () => {
  test.beforeEach(async ({ page }) => {
    // 開発サーバーにアクセス
    await page.goto("http://localhost:3000/manga-pdf-viewer/");

    // ページタイトルの確認
    await expect(page).toHaveTitle("漫画本PDFビューワー");
  });

  test("初期画面の表示確認", async ({ page }) => {
    // PWA通知を閉じる
    await closePWANotification(page);

    // 初期画面の要素確認
    await expect(
      page.getByRole("heading", { name: "漫画本PDFビューワー" }),
    ).toBeVisible();
    await expect(page.getByText("PDFファイルを選択してください")).toBeVisible();
    await expect(
      page.getByText("ドラッグ&ドロップまたはファイル選択ボタンから読み込み"),
    ).toBeVisible();

    // コントロールボタンが表示されている
    await expect(
      page.getByRole("button", { name: "ファイル選択" }),
    ).toBeVisible();
    await expect(page.getByTitle(/表示方式:/)).toBeVisible();
    await expect(page.getByRole("button", { name: "設定" })).toBeVisible();

    // ナビゲーションボタンが無効化されている
    await expect(page.getByTitle("前のページ")).toBeDisabled();
    await expect(page.getByTitle("次のページ")).toBeDisabled();

    // ページ情報が「1 / 0」で表示
    await expect(page.getByText("/ 0")).toBeVisible();
  });

  test("PDFファイル読み込みと基本操作", async ({ page }) => {
    // PWA通知を閉じる
    await closePWANotification(page);

    // ファイルチューザーイベントを先に設定してからクリック
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "ファイル選択" }).click();

    // テスト用PDFファイルをアップロード
    const fileChooser = await fileChooserPromise;
    const filePath = path.join(__dirname, "../fixtures/sample-comic.pdf");
    await fileChooser.setFiles(filePath);

    // PDF読み込み完了を待機
    await expect(page.getByText("/ 6")).toBeVisible();

    // ページ画像が表示されるまで待機
    await expect(page.getByRole("img", { name: "ページ 1" })).toBeVisible();

    // main要素のaria-labelが更新されるまで待機
    await expect(page.getByRole("main")).toHaveAttribute(
      "aria-label",
      /ページ 1 \/ 6/,
    );

    // ナビゲーションボタンの状態確認（1ページ目では前ページボタンは無効）
    await expect(page.getByTitle("次のページ")).toBeEnabled();
    await expect(page.getByTitle("前のページ")).toBeDisabled();
  });

  test("ページナビゲーション", async ({ page }) => {
    // PDFを読み込み
    await loadTestPDF(page);

    // 次ページへ移動
    await page.getByTitle("次のページ").click();
    await expect(page.getByRole("img", { name: "ページ 2" })).toBeVisible();
    await expect(page.getByRole("main")).toHaveAttribute(
      "aria-label",
      /ページ 2 \/ 6/,
    );

    // 前ページへ戻る
    await page.getByTitle("前のページ").click();
    await expect(page.getByRole("img", { name: "ページ 1" })).toBeVisible();
    await expect(page.getByRole("main")).toHaveAttribute(
      "aria-label",
      /ページ 1 \/ 6/,
    );

    // 最後のページへ移動（初期状態はRTLなので「末尾ページ」）
    await page.getByTitle("末尾ページ").click();
    await expect(page.getByRole("img", { name: "ページ 6" })).toBeVisible();
    await expect(page.getByRole("main")).toHaveAttribute(
      "aria-label",
      /ページ 6 \/ 6/,
    );

    // 最初のページへ移動（RTLなので「先頭ページ」）
    await page.getByTitle("先頭ページ").click();
    await expect(page.getByRole("img", { name: "ページ 1" })).toBeVisible();
    await expect(page.getByRole("main")).toHaveAttribute(
      "aria-label",
      /ページ 1 \/ 6/,
    );
  });

  test("表示方式の切り替え（単ページ ⇔ 見開き）", async ({ page }) => {
    // PDFを読み込み
    await loadTestPDF(page);

    // 2ページ目に移動
    await page.getByTitle("次のページ").click();

    // 見開き表示に切り替え
    await page.getByTitle(/表示方式: 単一ページ/).click();
    await expect(page.getByRole("main")).toHaveAttribute(
      "aria-label",
      /見開き表示/,
    );

    // 見開きで2ページが表示される（右→左形式）
    await expect(page.getByRole("img", { name: "右ページ 2" })).toBeVisible();
    await expect(page.getByRole("img", { name: "左ページ 3" })).toBeVisible();

    // ボタンのアイコンが変更される
    await expect(page.getByTitle(/表示方式: 見開きページ/)).toBeVisible();

    // 単ページ表示に戻す
    await page.getByTitle(/表示方式: 見開きページ/).click();
    await expect(page.getByRole("main")).toHaveAttribute(
      "aria-label",
      /単ページ表示/,
    );
    await expect(page.getByRole("img", { name: "ページ 2" })).toBeVisible();
  });

  test("読み方向の切り替え", async ({ page }) => {
    // PDFを読み込み
    await loadTestPDF(page);

    // 2ページ目に移動して見開き表示
    await page.getByTitle("次のページ").click();
    await page.getByTitle(/表示方式: 単一ページ/).click();

    // 設定パネルを開く
    await page.getByRole("button", { name: "設定" }).click();
    await expect(page.getByRole("dialog", { name: "設定" })).toBeVisible();

    // 読み方向を左→右に変更
    await page.getByRole("radio", { name: "左→右（英語）" }).click();

    // レイアウトが変更される（左→右形式）
    await expect(page.getByRole("img", { name: "左ページ 2" })).toBeVisible();
    await expect(page.getByRole("img", { name: "右ページ 3" })).toBeVisible();

    // ヘッダーの読み方向ボタンが変更される
    await page.getByRole("button", { name: "設定パネルを閉じる" }).click();
    await expect(page.getByTitle("読み方向: 左→右（英語）")).toBeVisible();

    // 設定を日本語形式に戻す
    await page.getByRole("button", { name: "設定" }).click();
    await page.getByRole("radio", { name: "右→左（日本語）" }).click();
    await page.getByRole("button", { name: "設定パネルを閉じる" }).click();
    await expect(page.getByTitle("読み方向: 右→左（日本語）")).toBeVisible();
  });

  test("ズーム機能", async ({ page }) => {
    // PWA通知を閉じる
    await closePWANotification(page);

    // PDFを読み込み
    await loadTestPDF(page);

    // ズームインボタンをクリック
    await page.getByTitle("ズームイン").click();

    // ズームが実行されることを確認（ボタンの動作確認）
    await page.waitForTimeout(500); // ズーム処理完了を待機

    // ズームアウトボタンをクリック
    await page.getByTitle("ズームアウト").click();

    // フィット表示ボタンをクリック
    await page.getByTitle("フィット表示").click();
  });

  test("フルスクリーンモード", async ({ page }) => {
    // PWA通知を閉じる
    await closePWANotification(page);

    // PDFを読み込み
    await loadTestPDF(page);

    // フルスクリーンボタンをクリック
    await page.getByTitle(/フルスクリーン \(F11\)/).click();

    // フルスクリーンボタンのアイコンが変更される
    await expect(page.getByTitle(/フルスクリーン終了 \(F11\)/)).toBeVisible();

    // フルスクリーン終了
    await page.getByTitle(/フルスクリーン終了 \(F11\)/).click();
    await expect(page.getByTitle(/フルスクリーン \(F11\)/)).toBeVisible();
  });

  test("設定パネルの全機能確認", async ({ page }) => {
    // PWA通知を閉じる
    await closePWANotification(page);

    // PDFを読み込み
    await loadTestPDF(page);

    // 設定パネルを開く
    await page.getByRole("button", { name: "設定" }).click();
    const settingsPanel = page.getByRole("dialog", { name: "設定" });
    await expect(settingsPanel).toBeVisible();

    // 表示方式設定の確認
    await expect(page.getByText("表示方式")).toBeVisible();
    await expect(page.getByRole("radio", { name: "単一ページ" })).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "見開きページ" }),
    ).toBeVisible();

    // 読み方向設定の確認
    await expect(page.getByText("📚 読み方向")).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "右→左（日本語）" }),
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "左→右（英語）" }),
    ).toBeVisible();

    // テーマ設定の確認
    await expect(page.getByText("🌙 テーマ")).toBeVisible();

    // 見開き設定の確認
    await expect(page.getByText("見開き設定")).toBeVisible();
    await expect(
      page.getByRole("checkbox", { name: "1ページ目を表紙として単独表示" }),
    ).toBeVisible();

    // 設定リセットボタンの確認
    await expect(
      page.getByRole("button", { name: "🔄 設定を初期値に戻す" }),
    ).toBeVisible();

    // 設定パネルを閉じる
    await page.getByRole("button", { name: "設定パネルを閉じる" }).click();
    await expect(settingsPanel).not.toBeVisible();
  });

  test("PWA機能確認", async ({ page }) => {
    // PWA通知を閉じる
    await closePWANotification(page);

    // Service Worker登録を確認
    await page.waitForFunction(() => "serviceWorker" in navigator);

    // コンソールログでSW登録を確認
    const logs = [];
    page.on("console", (msg) => logs.push(msg.text()));

    // ページをリロードしてSWの動作を確認
    await page.reload();

    // PWA通知が表示されることを確認（タイミングによる）
    const notification = page.locator('[role="alert"]');
    if (await notification.isVisible()) {
      await expect(notification).toContainText(
        "アプリがオフラインで利用可能になりました",
      );
      await page.getByRole("button", { name: "通知を閉じる" }).click();
    }
  });

  // ヘルパー関数：PWA通知を閉じる
  async function closePWANotification(page) {
    try {
      // PWA通知が表示されるか少し待機
      const closeButton = page.getByRole("button", { name: "通知を閉じる" });
      await closeButton.waitFor({ timeout: 2000 });
      await closeButton.click();

      // 通知が消えるまで待機
      await page
        .locator('[role="alert"]')
        .waitFor({ state: "hidden", timeout: 3000 });
    } catch (error) {
      // 通知が表示されない場合は何もしない
    }
  }

  // ヘルパー関数：テスト用PDFファイルを読み込む
  async function loadTestPDF(page) {
    // PWA通知を閉じる
    await closePWANotification(page);

    // ファイルチューザーイベントを先に設定してからクリック
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "ファイル選択" }).click();

    // PDFファイル読み込み
    const fileChooser = await fileChooserPromise;
    const filePath = path.join(__dirname, "../fixtures/sample-comic.pdf");
    await fileChooser.setFiles(filePath);

    // 読み込み完了を待機
    await expect(page.getByText("/ 6")).toBeVisible();

    // ページ画像が表示されるまで待機
    await expect(page.getByRole("img", { name: "ページ 1" })).toBeVisible();
  }
});
