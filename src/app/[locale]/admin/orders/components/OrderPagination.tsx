'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { UseAdminOrdersReturn } from '@/hooks/useAdminOrders';

interface OrderPaginationProps {
  adminOrders: UseAdminOrdersReturn;
}

export function OrderPagination({ adminOrders }: OrderPaginationProps) {
  const { isVi, currentPage, setCurrentPage, totalPages, total, ITEMS_PER_PAGE } = adminOrders;

  const t = (key: string) => isVi 
    ? {
        previous: 'Trước',
        next: 'Tiếp',
        of: 'của',
        showing: 'Hiển thị',
        to: 'đến',
        orders: 'đơn hàng',
      }[key] || key
    : {
        previous: 'Previous',
        next: 'Next',
        of: 'of',
        showing: 'Showing',
        to: 'to',
        orders: 'orders',
      }[key] || key;

  const startItem = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, total);

  if (totalPages <= 1) return null;

  return (
    <div className="admin-pagination">
      <div className="admin-pagination__info">
        {t('showing')} <strong>{startItem}</strong> {t('to')} <strong>{endItem}</strong> {t('of')} <strong>{total}</strong> {t('orders')}
      </div>
      
      <div className="admin-pagination__controls">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="admin-pagination__btn"
        >
          <ChevronLeft size={16} />
          <span>{t('previous')}</span>
        </button>

        <div className="admin-pagination__pages">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`admin-pagination__page ${currentPage === pageNum ? 'admin-pagination__page--active' : ''}`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="admin-pagination__btn"
        >
          <span>{t('next')}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
