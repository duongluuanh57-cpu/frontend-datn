'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, Ticket } from 'lucide-react';
import { Link } from '@/navigation';
import { useLocale } from 'next-intl';
import type { Voucher, VoucherFormData } from '@/hooks/useAdminVouchers';

interface VoucherFormProps {
  initialData?: Voucher;
  onSubmit: (data: VoucherFormData) => void;
  isPending: boolean;
}

export function VoucherForm({ initialData, onSubmit, isPending }: VoucherFormProps) {
  const locale = useLocale();
  const isVi = locale === 'vi';

  const [form, setForm] = useState<VoucherFormData>({
    code: '',
    type: 'percentage',
    value: 0,
    minOrderAmount: 0,
    maxDiscount: undefined,
    maxUsage: 0,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        code: initialData.code,
        type: initialData.type,
        value: initialData.value,
        minOrderAmount: initialData.minOrderAmount,
        maxDiscount: initialData.maxDiscount,
        maxUsage: initialData.maxUsage,
        startDate: initialData.startDate.slice(0, 10),
        endDate: initialData.endDate.slice(0, 10),
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="admin-form-page">
      <div className="admin-form-toolbar">
        <div className="admin-form-toolbar__left">
          <div>
            <h2 className="admin-form-toolbar__title flex items-center gap-3">
              <Ticket size={22} className="text-[#D4A5A5]" />
              {initialData
                ? (isVi ? 'Chỉnh sửa mã giảm giá' : 'Edit Voucher')
                : (isVi ? 'Thêm mã giảm giá mới' : 'New Voucher')
              }
            </h2>
            <p className="admin-form-toolbar__subtitle">
              {initialData
                ? (isVi ? `Mã: ${initialData.code}` : `Code: ${initialData.code}`)
                : (isVi ? 'Tạo mã giảm giá mới cho cửa hàng' : 'Create a new discount code')
              }
            </p>
          </div>
        </div>
        <div className="admin-page-header__actions flex gap-2">
          <Link
            href="/admin/vouchers"
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-[#7A5C5C]/60 hover:bg-gray-50 transition-all inline-flex items-center gap-2"
          >
            <ChevronLeft size={16} /> {isVi ? 'Quay lại' : 'Back'}
          </Link>
          <button
            type="submit"
            form="voucher-form"
            disabled={isPending || !form.code.trim()}
            className="px-4 py-2 bg-[#7A5C5C] hover:bg-[#604444] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 inline-flex items-center gap-2"
          >
            {isPending ? (
              <><Loader2 className="animate-spin" size={14} /> {isVi ? 'Đang lưu...' : 'Saving...'}</>
            ) : (
              initialData
                ? (isVi ? 'Cập nhật' : 'Update')
                : (isVi ? 'Tạo mới' : 'Create')
            )}
          </button>
        </div>
      </div>

      <form id="voucher-form" onSubmit={handleSubmit} className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
        <section className="admin-form-card">
          <div className="admin-form-card__head">
            <div className="admin-form-card__head-icon">
              <Ticket size={18} />
            </div>
            <div>
              <p className="admin-form-card__title">{isVi ? 'Thông tin mã giảm giá' : 'Voucher Information'}</p>
              <p className="admin-form-card__desc">{isVi ? 'Chi tiết mã giảm giá' : 'Discount code details'}</p>
            </div>
          </div>

          <div className="admin-form-fields" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="admin-field">
              <label className="admin-label">{isVi ? 'Mã giảm giá' : 'Voucher Code'} *</label>
              <input
                className="admin-input"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: SALE50"
                required
                style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em', maxWidth: 300 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 500 }}>
              <div className="admin-field">
                <label className="admin-label">{isVi ? 'Loại' : 'Type'} *</label>
                <select
                  className="admin-select"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
                >
                  <option value="percentage">%</option>
                  <option value="fixed">{isVi ? 'Số tiền' : 'Fixed'}</option>
                </select>
              </div>
              <div className="admin-field">
                <label className="admin-label">{isVi ? 'Giá trị' : 'Value'} *</label>
                <input
                  className="admin-input"
                  type="number"
                  min={0}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: parseInt(e.target.value) || 0 })}
                  placeholder={form.type === 'percentage' ? '10' : '50000'}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 500 }}>
              <div className="admin-field">
                <label className="admin-label">{isVi ? 'Đơn tối thiểu' : 'Min Order'}</label>
                <input
                  className="admin-input"
                  type="number"
                  min={0}
                  value={form.minOrderAmount}
                  onChange={(e) => setForm({ ...form, minOrderAmount: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">
                  {isVi ? 'Giảm tối đa' : 'Max Discount'}
                  {form.type === 'fixed' && <span style={{ opacity: 0.5, marginLeft: 4 }}>({isVi ? 'tự động' : 'auto'})</span>}
                </label>
                <input
                  className="admin-input"
                  type="number"
                  min={0}
                  value={form.maxDiscount || ''}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder={isVi ? 'Không giới hạn' : 'Unlimited'}
                  disabled={form.type === 'fixed'}
                  style={{ opacity: form.type === 'fixed' ? 0.5 : 1 }}
                />
              </div>
            </div>

            <div className="admin-field" style={{ maxWidth: 500 }}>
              <label className="admin-label">
                {isVi ? 'Số lượt tối đa (0 = không giới hạn)' : 'Max Usage (0 = unlimited)'}
              </label>
              <input
                className="admin-input"
                type="number"
                min={0}
                value={form.maxUsage}
                onChange={(e) => setForm({ ...form, maxUsage: parseInt(e.target.value) || 0 })}
                placeholder="0"
                style={{ maxWidth: 240 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 500 }}>
              <div className="admin-field">
                <label className="admin-label">{isVi ? 'Ngày bắt đầu' : 'Start Date'} *</label>
                <input
                  className="admin-input"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">{isVi ? 'Ngày kết thúc' : 'End Date'} *</label>
                <input
                  className="admin-input"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
