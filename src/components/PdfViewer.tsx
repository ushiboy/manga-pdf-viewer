import React from 'react';

interface PdfViewerProps {
  isFileLoaded: boolean;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ isFileLoaded }) => {
  if (!isFileLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-6xl">📚</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            漫画本PDFビューワー
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            PDFファイルを選択してください
          </p>
          <div className="space-y-2 text-sm text-gray-400 dark:text-gray-500">
            <p>ドラッグ&ドロップまたはファイル選択ボタンから読み込み</p>
            <p>キーボード: ←→（ページめくり）、F11（フルスクリーン）</p>
            <p>マウス: クリック（ページめくり）、ホイール（ズーム）</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800 relative">
      <div className="relative">
        <div className="w-96 h-[500px] bg-white dark:bg-gray-700 shadow-lg rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📄</div>
            <p>PDFページがここに表示されます</p>
            <p className="text-sm mt-2">（実装予定）</p>
          </div>
        </div>
      </div>
    </div>
  );
};