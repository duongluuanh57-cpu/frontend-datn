'use client';

import React from 'react';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  itemsPerPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  isVi: boolean;
  label: string;
}

export function AdminPagination({
  currentPage,
  totalPages,
  total,
  itemsPerPage,
  setCurrentPage,
  isVi,
  label
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border border-[#f0e9e4] border-t-0 rounded-b-2xl shadow-sm -mt-px">
      <p className="text-sm text-[#7A5C5C] font-medium m-0">
        {isVi
          ? `Hiển thị từ ${(currentPage - 1) * itemsPerPage + 1} đến ${Math.min(currentPage * itemsPerPage, total)} trong tổng số ${total} ${label}`
          : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, total)} of ${total} ${label}`}
      </p>

      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-semibold border border-[#e8e0da] rounded-lg transition-all disabled:cursor-not-allowed disabled:text-[#c8b8b0] text-[#3d2e24] hover:bg-gray-50"
        >
          {isVi ? 'Trước' : 'Previous'}
        </button>

        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          const isActive = currentPage === pageNum;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentPage(pageNum)}
              className={`w-[34px] h-[34px] flex items-center justify-center text-sm font-bold rounded-lg transition-all ${
                isActive
                  ? 'bg-[#3d2e24] text-white border border-[#3d2e24]'
                  : 'bg-transparent text-[#3d2e24] border border-transparent hover:border-[#e8e0da]'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-semibold border border-[#e8e0da] rounded-lg transition-all disabled:cursor-not-allowed disabled:text-[#c8b8b0] text-[#3d2e24] hover:bg-gray-50"
        >
          {isVi ? 'Tiếp' : 'Next'}
        </button>
      </div>
    </div>
  );
}
