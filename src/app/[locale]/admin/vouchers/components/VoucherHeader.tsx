'use client';

import React from 'react';
import { Ticket, Plus } from 'lucide-react';
import type { UseAdminVouchersReturn } from '@/hooks/useAdminVouchers';

interface VoucherHeaderProps {
  adminVouchers: UseAdminVouchersReturn;
}

export function VoucherHeader({ adminVouchers }: VoucherHeaderProps) {
  const { isVi, openCreateModal } = adminVouchers;

  return (
    <header className="admin-page-header">
      <div>
        <h1 className="admin-page-header__title flex items-center gap-3">
          <Ticket className="text-[#D4A5A5]" size={28} />
          {isVi ? 'Quản lý mã giảm giá' : 'Voucher Management'}
        </h1>
        <p className="admin-page-header__subtitle">
          {isVi
            ? 'Tạo và quản lý các mã giảm giá cho cửa hàng.'
            : 'Create and manage discount codes for your store.'}
        </p>
      </div>
      <div className="admin-page-header__actions">
        <button className="admin-btn-primary flex items-center gap-2" onClick={openCreateModal}>
          <Plus size={18} />
          {isVi ? 'Thêm mã giảm giá' : 'Add Voucher'}
        </button>
      </div>
    </header>
  );
}