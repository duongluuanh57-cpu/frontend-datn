'use client';

import React from 'react';
import { Loader2, Sparkles, Search, Edit3, Copy, CheckCircle, XCircle } from 'lucide-react';
import { Link } from '@/navigation';
import type { UseAdminVouchersReturn, Voucher } from '@/hooks/useAdminVouchers';

interface VoucherTableProps {
  adminVouchers: UseAdminVouchersReturn;
}

function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: locale === 'vi' ? 'VND' : 'USD',
  }).format(amount);
}

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function VoucherTable({ adminVouchers }: VoucherTableProps) {
  const {
    locale, isVi, vouchers, isLoading, searchTerm, setSearchTerm,
    selectedIds, isAllSelected, isSomeSelected, handleSelectAll, handleSelectRow,
  } = adminVouchers;

  return (
    <div>
      {/* Search bar */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: '#faf8f6',
            border: '1px solid #e8e0da',
            borderRadius: '12px',
            maxWidth: '360px',
            transition: 'all 0.2s',
          }}
        >
          <Search size={16} style={{ color: '#9a857c', flexShrink: 0 }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isVi ? 'Tìm mã giảm giá...' : 'Search vouchers...'}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: '0.875rem',
              color: '#3d2e24',
            }}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '48px', textAlign: 'center', verticalAlign: 'middle' }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleSelectAll}
                    style={{
                      cursor: 'pointer',
                      accentColor: 'var(--admin-accent, #3d2e24)',
                      borderRadius: '4px',
                      width: '16px',
                      height: '16px',
                    }}
                  />
                </th>
                <th>{isVi ? 'Mã' : 'Code'}</th>
                <th>{isVi ? 'Loại' : 'Type'}</th>
                <th>{isVi ? 'Giá trị' : 'Value'}</th>
                <th>{isVi ? 'Đơn tối thiểu' : 'Min Order'}</th>
                <th>{isVi ? 'Đã dùng' : 'Used'}</th>
                <th>{isVi ? 'Hiệu lực' : 'Valid'}</th>
                <th>{isVi ? 'Trạng thái' : 'Status'}</th>
                <th>{isVi ? 'Thao tác' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9}>
                    <div className="admin-loading" style={{ padding: '60px 0' }}>
                      <Loader2 className="admin-loading__spinner animate-spin" />
                      <p>{isVi ? 'Đang tải danh sách...' : 'Loading vouchers...'}</p>
                    </div>
                  </td>
                </tr>
              ) : !vouchers || vouchers.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="admin-empty" style={{ padding: '60px 0' }}>
                      <Sparkles className="admin-empty__icon" />
                      <p>{isVi ? 'Chưa có mã giảm giá nào.' : 'No vouchers found.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                vouchers.map((v: Voucher) => {
                  const now = new Date();
                  const start = new Date(v.startDate);
                  const end = new Date(v.endDate);
                  const isValid = v.status === 'active' && start <= now && end >= now;
                  const isChecked = selectedIds.includes(v._id);

                  return (
                    <tr key={v._id} style={isChecked ? { background: 'rgba(212, 165, 165, 0.05)' } : undefined}>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(v._id)}
                          style={{
                            cursor: 'pointer',
                            accentColor: 'var(--admin-accent, #3d2e24)',
                            borderRadius: '4px',
                            width: '16px',
                            height: '16px',
                          }}
                        />
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            letterSpacing: '0.05em',
                            color: '#3d2e24',
                          }}
                        >
                          {v.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(v.code);
                          }}
                          style={{
                            marginLeft: '6px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            verticalAlign: 'middle',
                          }}
                          title={isVi ? 'Sao chép mã' : 'Copy code'}
                        >
                          <Copy size={14} style={{ color: '#9a857c' }} />
                        </button>
                      </td>
                      <td>
                        <span className={`admin-badge ${v.type === 'percentage' ? 'admin-badge--ok' : 'admin-badge--low'}`}>
                          {v.type === 'percentage' ? '%' : isVi ? 'VNĐ' : 'Fixed'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {v.type === 'percentage' ? `${v.value}%` : formatCurrency(v.value, locale)}
                      </td>
                      <td style={{ color: '#6b564c', fontSize: '0.875rem' }}>
                        {v.minOrderAmount > 0 ? formatCurrency(v.minOrderAmount, locale) : '—'}
                      </td>
                      <td style={{ color: '#6b564c', fontSize: '0.875rem' }}>
                        {v.usedCount}/{v.maxUsage === 0 ? '∞' : v.maxUsage}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: '#6b564c' }}>
                        <div>{formatDate(v.startDate, locale)}</div>
                        <div style={{ opacity: 0.6 }}>→ {formatDate(v.endDate, locale)}</div>
                      </td>
                      <td>
                        <span className={`admin-badge ${isValid ? 'admin-badge--ok' : 'admin-badge--low'}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isValid ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {isValid
                            ? (isVi ? 'Hiệu lực' : 'Active')
                            : v.status === 'inactive'
                              ? (isVi ? 'Tắt' : 'Inactive')
                              : (isVi ? 'Hết hạn' : 'Expired')
                          }
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <Link
                            href={"/admin/vouchers/" + v._id}
                            className="admin-icon-btn"
                            title={isVi ? 'Chỉnh sửa' : 'Edit'}
                          >
                            <Edit3 size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}