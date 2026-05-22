'use client';

import React from 'react';
import { useAdminVouchers } from '@/hooks/useAdminVouchers';
import { VoucherHeader } from './components/VoucherHeader';
import { VoucherTable } from './components/VoucherTable';
import { VoucherModal } from './components/VoucherModal';
import { AlertCircle } from 'lucide-react';

export default function AdminVouchersPage() {
  const adminVouchers = useAdminVouchers();
  const { error, isVi } = adminVouchers;

  if (error) {
    return (
      <div className="admin-alert">
        <AlertCircle className="admin-alert__icon" />
        <h2 className="admin-alert__title">{isVi ? 'Lỗi kết nối dữ liệu' : 'Data Connection Error'}</h2>
        <p className="admin-alert__text">
          {isVi ? 'Không thể tải danh sách mã giảm giá. Vui lòng kiểm tra lại kết nối server.' : 'Unable to load vouchers. Please verify server connection.'}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <VoucherHeader adminVouchers={adminVouchers} />
      <VoucherTable adminVouchers={adminVouchers} />
      <VoucherModal adminVouchers={adminVouchers} />
    </div>
  );
}