'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Ticket } from 'lucide-react';
import type { UseAdminVouchersReturn, VoucherFormData } from '@/hooks/useAdminVouchers';

interface VoucherModalProps {
  adminVouchers: UseAdminVouchersReturn;
}

export function VoucherModal({ adminVouchers }: VoucherModalProps) {
  const {
    isVi, showModal, editingVoucher, closeModal,
    createMutation, updateMutation,
  } = adminVouchers;

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
    if (editingVoucher) {
      setForm({
        code: editingVoucher.code,
        type: editingVoucher.type,
        value: editingVoucher.value,
        minOrderAmount: editingVoucher.minOrderAmount,
        maxDiscount: editingVoucher.maxDiscount,
        maxUsage: editingVoucher.maxUsage,
        startDate: editingVoucher.startDate.slice(0, 10),
        endDate: editingVoucher.endDate.slice(0, 10),
      });
    } else {
      setForm({
        code: '',
        type: 'percentage',
        value: 0,
        minOrderAmount: 0,
        maxDiscount: undefined,
        maxUsage: 0,
        startDate: '',
        endDate: '',
      });
    }
  }, [editingVoucher, showModal]);

  if (!showModal) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;

    if (editingVoucher) {
      updateMutation.mutate({ id: editingVoucher._id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(30, 20, 15, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #f0e9e4',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 24px 80px rgba(30, 20, 15, 0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #f0e9e4',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Ticket size={20} style={{ color: '#D4A5A5' }} />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#3d2e24' }}>
              {editingVoucher
                ? (isVi ? 'Chỉnh sửa mã giảm giá' : 'Edit Voucher')
                : (isVi ? 'Thêm mã giảm giá mới' : 'New Voucher')
              }
            </span>
          </div>
          <button
            type="button"
            onClick={closeModal}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '8px',
              color: '#9a857c',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Code */}
            <div className="admin-field">
              <label className="admin-label">
                {isVi ? 'Mã giảm giá' : 'Voucher Code'} *
              </label>
              <input
                className="admin-input"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: SALE50"
                required
                style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}
              />
            </div>

            {/* Type + Value */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

            {/* Min order + Max usage */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="admin-field">
                <label className="admin-label">
                  {isVi ? 'Đơn tối thiểu' : 'Min Order'}
                </label>
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

            {/* Max usage */}
            <div className="admin-field">
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
              />
            </div>

            {/* Start + End date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

          {/* Submit */}
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={closeModal}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: '1px solid #e8e0da',
                background: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#6b564c',
                cursor: 'pointer',
              }}
            >
              {isVi ? 'Huỷ' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isPending || !form.code.trim()}
              className="admin-btn-submit"
              style={{ opacity: isPending || !form.code.trim() ? 0.6 : 1 }}
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isVi ? 'Đang lưu...' : 'Saving...'}
                </>
              ) : (
                editingVoucher
                  ? (isVi ? 'Cập nhật' : 'Update')
                  : (isVi ? 'Tạo mới' : 'Create')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}