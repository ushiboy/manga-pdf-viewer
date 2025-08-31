import React, { useState, useEffect } from "react";

interface PageInputProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PageInput: React.FC<PageInputProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [inputValue, setInputValue] = useState(currentPage.toString());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputSubmit();
    }
  };

  const handleInputBlur = () => {
    handleInputSubmit();
  };

  const handleInputSubmit = () => {
    const pageNum = parseInt(inputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    } else {
      // 無効な値の場合は現在のページに戻す
      setInputValue(currentPage.toString());
    }
  };

  // currentPageが変更されたときにinputValueも更新
  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  return (
    <div className="flex items-center space-x-2">
      <input
        type="number"
        min="1"
        max={totalPages}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onBlur={handleInputBlur}
        aria-label="Current page number"
        className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <span className="text-sm text-gray-600 dark:text-gray-400">
        / {totalPages}
      </span>
    </div>
  );
};
