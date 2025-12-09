import React from "react";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxPagesToShow = 5,
  showInfo = false,
}) {
  if (!totalPages || totalPages <= 1) return null;

  const halfLimit = Math.floor(maxPagesToShow / 2);

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);

      let start = Math.max(2, currentPage - halfLimit);
      let end = Math.min(totalPages - 1, currentPage + halfLimit);

      if (currentPage < maxPagesToShow - 1) {
        end = maxPagesToShow - 1;
      }
      if (currentPage > totalPages - (maxPagesToShow - 2)) {
        start = totalPages - (maxPagesToShow - 2);
      }

      if (start > 2) pageNumbers.push("...");

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) pageNumbers.push(i);
      }

      if (end < totalPages - 1) pageNumbers.push("...");

      if (totalPages > 1) pageNumbers.push(totalPages);
    }

    return [...new Set(pageNumbers)];
  };

  const pages = getPageNumbers();

  return (
    <div className="flex justify-between items-center mt-4 border-t pt-4">
      {showInfo ? (
        <span className="text-sm text-gray-700">
          Page{" "}
          <strong className="font-semibold text-gray-900">{currentPage}</strong>{" "}
          of{" "}
          <strong className="font-semibold text-gray-900">{totalPages}</strong>
        </span>
      ) : (
        <div />
      )}

      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-medium border border-gray-300 ${
            currentPage === 1
              ? "text-gray-400 bg-gray-50 cursor-not-allowed"
              : "text-gray-700 bg-white hover:bg-gray-100"
          }`}
        >
          Previous
        </button>

        {pages.map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 bg-white"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? "page" : undefined}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 ${
                currentPage === page
                  ? "bg-blue-600 text-white z-10 hover:bg-blue-700"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-sm font-medium border border-gray-300 ${
            currentPage === totalPages
              ? "text-gray-400 bg-gray-50 cursor-not-allowed"
              : "text-gray-700 bg-white hover:bg-gray-100"
          }`}
        >
          Next
        </button>
      </nav>
    </div>
  );
}
