import React from "react";

export const EmptyState: React.FC = () => {
  return (
    <div
      className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
      role="main"
      aria-label="PDFファイル選択画面"
    >
      <div className="text-center">
        <div
          className="w-32 h-32 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-6xl">📚</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          漫画本PDFビューワー
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          PDFファイルを選択してください
        </p>
        <div
          className="space-y-2 text-sm text-gray-400 dark:text-gray-500"
          role="region"
          aria-label="操作方法"
        >
          <p>ドラッグ&ドロップまたはファイル選択ボタンから読み込み</p>
          <p>キーボード: ←→（ページめくり）、F11（フルスクリーン）</p>
          <p>マウス: クリック（ページめくり）、ホイール（ズーム）</p>
        </div>
      </div>
    </div>
  );
};
