'use client';

import React from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import type { UseAdminTaxonomyReturn } from '@/hooks/useAdminTaxonomy';

interface TaxonomyModalProps {
  adminTaxonomy: UseAdminTaxonomyReturn;
}

export function TaxonomyModal({ adminTaxonomy }: TaxonomyModalProps) {
  const {
    isModalOpen,
    setIsModalOpen,
    handleFormSubmit,
    currentTabConfig,
    editingItem,
    isVi,
    formData,
    setFormData,
    activeTab,
    isSaving
  } = adminTaxonomy;

  if (!isModalOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(36, 26, 20, 0.4)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out',
        padding: '20px'
      }}
      onClick={() => setIsModalOpen(false)}
    >
      <form
        onSubmit={handleFormSubmit}
        style={{
          background: '#FFF',
          borderRadius: '24px',
          border: '1px solid var(--admin-border, #e8e0da)',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(61, 46, 36, 0.08)',
          animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border, #e8e0da)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(212, 165, 165, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--admin-accent, #5c4a42)' }}>
              {React.createElement(currentTabConfig.icon, { size: 18 })}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text, #3d2e24)' }}>
                {editingItem 
                  ? (isVi ? `Chỉnh sửa ${currentTabConfig.labelVi.replace('Quản lý ', '')}` : `Edit ${currentTabConfig.labelEn.replace(' Management', '')}`)
                  : (isVi ? `Thêm ${currentTabConfig.labelVi.replace('Quản lý ', '')} mới` : `Add New ${currentTabConfig.labelEn.replace(' Management', '')}`)
                }
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-text-secondary, #6b564c)' }}>
                {isVi ? 'Thiết lập thuộc tính lưu trữ thực tế trong DB' : 'Configure persistent taxonomy values in the database'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--admin-text-muted, #9a857c)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--admin-text, #3d2e24)';
              e.currentTarget.style.background = 'rgba(61, 46, 36, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--admin-text-muted, #9a857c)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text, #3d2e24)' }}>
              {isVi ? 'Tên gọi hiển thị' : 'Display Name'} <span style={{ color: '#D4A5A5' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder={isVi ? 'Ví dụ: Hương Gỗ (Woody)' : 'e.g. Woody Spicy'}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="admin-input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Slug */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text, #3d2e24)' }}>
              {isVi ? 'Mã liên kết (Slug)' : 'Slug'}
            </label>
            <input
              type="text"
              placeholder={isVi ? 'Để trống hệ thống sẽ tự động tạo từ tên' : 'Leave empty to auto-generate'}
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="admin-input"
              style={{ width: '100%', fontFamily: 'monospace' }}
            />
          </div>

          {/* Description (Only for Tags tab) */}
          {activeTab === 'tags' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text, #3d2e24)' }}>
                {isVi ? 'Mô tả nhãn' : 'Description'}
              </label>
              <textarea
                rows={2}
                placeholder={isVi ? 'Mô tả ngắn về công dụng hoặc điều kiện của tag...' : 'Short description...'}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="admin-textarea"
                style={{ width: '100%', resize: 'none' }}
              />
            </div>
          )}

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text, #3d2e24)' }}>
              {isVi ? 'Trạng thái hoạt động' : 'Status'}
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {(['active', 'inactive'] as const).map((st) => {
                const active = formData.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: st }))}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: active ? 'rgba(212,165,165,0.3)' : 'var(--admin-border, #e8e0da)',
                      background: active ? 'rgba(212,165,165,0.06)' : 'transparent',
                      color: active ? '#D4A5A5' : 'var(--admin-text-secondary, #6b564c)',
                      fontSize: '0.8125rem',
                      fontWeight: active ? 600 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {active && <Check size={14} />}
                    {st === 'active' 
                      ? (isVi ? 'Đang hoạt động' : 'Active') 
                      : (isVi ? 'Tạm ngưng' : 'Inactive')
                    }
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--admin-border, #e8e0da)', paddingTop: '20px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FAF8F6] border border-[#e8e0da] text-[#6B564C] hover:bg-[#F3EFEB] transition flex-1 active:scale-95"
          >
            {isVi ? 'Hủy bỏ' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#7A5C5C] hover:bg-[#634747] text-white transition flex-1 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {isVi ? 'Lưu thuộc tính' : 'Save Taxonomy'}
          </button>
        </div>
      </form>
    </div>
  );
}
