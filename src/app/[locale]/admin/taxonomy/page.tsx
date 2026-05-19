'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Plus, Pencil, Trash2, Loader2, Sparkles, AlertCircle, 
  Hash, Lock, Layers, Sliders, ShieldCheck, X, Check, Eye
} from 'lucide-react';
import { useLocale } from 'next-intl';
import React, { useState } from 'react';

interface TaxonomyItem {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  description?: string;
}

type TabType = 'tags' | 'notes' | 'concentrations' | 'segments';

export default function AdminTaxonomyPage() {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';
  const [activeTab, setActiveTab] = useState<TabType>('tags');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaxonomyItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'active' as 'active' | 'inactive',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Define tab configuration
  const tabs = [
    { id: 'tags' as TabType, labelVi: 'Quản lý Tag', labelEn: 'Tag Management', apiPath: '/tags', queryKey: 'admin-tags', taxonomyType: null, icon: Hash },
    { id: 'notes' as TabType, labelVi: 'Quản lý Nhóm hương', labelEn: 'Scent Groups', apiPath: '/taxonomies', queryKey: 'admin-scent-groups', taxonomyType: 'scent_group', icon: Layers },
    { id: 'concentrations' as TabType, labelVi: 'Quản lý Nồng độ', labelEn: 'Concentration Levels', apiPath: '/taxonomies', queryKey: 'admin-concentrations', taxonomyType: 'concentration', icon: Sliders },
    { id: 'segments' as TabType, labelVi: 'Quản lý Phân khúc nhóm', labelEn: 'Brand Segments', apiPath: '/taxonomies', queryKey: 'admin-segments', taxonomyType: 'segment', icon: Sparkles },
  ];

  const currentTabConfig = tabs.find(t => t.id === activeTab)!;

  // Generic query to fetch data for the active tab
  const { data: items, isLoading, error } = useQuery({
    queryKey: [currentTabConfig.queryKey],
    queryFn: async () => {
      const url = currentTabConfig.taxonomyType 
        ? `${currentTabConfig.apiPath}?type=${currentTabConfig.taxonomyType}` 
        : currentTabConfig.apiPath;
      const { data } = await api.get(url);
      return data.data as TaxonomyItem[];
    },
  });

  // Generic mutation to delete an item
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`${currentTabConfig.apiPath}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [currentTabConfig.queryKey] });
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized');
      if (isAuth) {
        alert(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        alert(isVi ? 'Không thể xóa mục này.' : 'Failed to delete this item.');
      }
    }
  });

  // Open modal for adding a new item
  const handleAddNewClick = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      slug: '',
      status: 'active',
      description: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an item
  const handleEditClick = (item: TaxonomyItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      status: item.status,
      description: item.description || ''
    });
    setIsModalOpen(true);
  };

  // Form submit handler (both create and update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined, // empty string will fall back to server-side slugification
        status: formData.status,
        description: formData.description.trim() || undefined
      };

      if (currentTabConfig.taxonomyType) {
        payload.type = currentTabConfig.taxonomyType;
      }

      if (editingItem) {
        // Update
        await api.patch(`${currentTabConfig.apiPath}/${editingItem._id}`, payload);
      } else {
        // Create
        await api.post(currentTabConfig.apiPath, payload);
      }

      queryClient.invalidateQueries({ queryKey: [currentTabConfig.queryKey] });
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(isVi ? 'Có lỗi xảy ra khi lưu thông tin.' : 'Error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="admin-alert">
         <AlertCircle className="admin-alert__icon" />
         <h2 className="admin-alert__title">{isVi ? 'Lỗi kết nối dữ liệu' : 'Data Connection Error'}</h2>
         <p className="admin-alert__text">
           {isVi ? 'Không thể tải danh sách thuộc tính. Vui lòng kiểm tra lại kết nối server.' : 'Unable to load taxonomy catalog. Please verify server connection.'}
         </p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">{isVi ? 'QUẢN LÝ TẬP TRUNG' : 'TAXONOMY MANAGER'}</h1>
          <p className="admin-page-header__subtitle">
            {isVi 
              ? 'Hệ thống quản lý phân loại sản phẩm tập trung: Tag, Nhóm hương, Nồng độ và Phân khúc nhóm.' 
              : 'Unified taxonomy catalog: tags, scent notes, concentration levels, and brand segment profiles.'
            }
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button 
            type="button" 
            onClick={handleAddNewClick}
            className="admin-btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            {isVi 
              ? `Thêm ${currentTabConfig.labelVi.replace('Quản lý ', '').toLowerCase()} mới`
              : `Add New ${currentTabConfig.labelEn.replace(' Management', '')}`
            }
          </button>
        </div>
      </header>

      {/* Tabs bar */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '24px', 
          borderBottom: '1px solid var(--admin-border-subtle, rgba(61,46,36,0.08))', 
          marginBottom: '24px',
          paddingBottom: '2px',
          overflowX: 'auto' 
        }}
        className="admin-scrollbar-luxury"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid #D4A5A5' : '2px solid transparent',
                color: active ? '#D4A5A5' : 'var(--admin-text-muted, #9a857c)',
                padding: '8px 4px 12px 4px',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = 'var(--admin-text, #3d2e24)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = 'var(--admin-text-muted, #9a857c)';
              }}
            >
              <Icon size={16} style={{ opacity: active ? 1 : 0.7 }} />
              {isVi ? tab.labelVi : tab.labelEn}
            </button>
          );
        })}
      </div>

      {/* Dynamic Taxonomy List Table */}
      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}></th>
                <th>{isVi ? 'Tên gọi' : 'Name'}</th>
                <th>{isVi ? 'Mã liên kết (Slug)' : 'Slug'}</th>
                {activeTab === 'tags' && <th>{isVi ? 'Mô tả' : 'Description'}</th>}
                <th>{isVi ? 'Trạng thái' : 'Status'}</th>
                <th style={{ textAlign: 'right', width: '120px' }}>{isVi ? 'Thao tác' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={activeTab === 'tags' ? 6 : 5}>
                    <div className="admin-loading" style={{ padding: '60px 0' }}>
                      <Loader2 className="admin-loading__spinner animate-spin" />
                      <p>{isVi ? 'Đang tải danh sách thuộc tính...' : 'Loading taxonomy details...'}</p>
                    </div>
                  </td>
                </tr>
              ) : !items?.length ? (
                <tr>
                  <td colSpan={activeTab === 'tags' ? 6 : 5}>
                    <div className="admin-empty" style={{ padding: '60px 0' }}>
                      <Sparkles className="admin-empty__icon" />
                      <p>{isVi ? 'Chưa có bản ghi nào được tạo lập.' : 'No taxonomy items found.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isSystemTag = activeTab === 'tags' && (item.slug === 'Sale' || item.slug === 'New');
                  return (
                    <tr key={item._id}>
                      <td>
                        <div className="flex items-center justify-center text-[#D4A5A5]">
                          {React.createElement(currentTabConfig.icon, { size: 18 })}
                        </div>
                      </td>
                      <td>
                        <p className="admin-table-product__name" style={{ fontWeight: 600 }}>{item.name}</p>
                      </td>
                      <td>
                        <code className="text-xs bg-[rgba(212,165,165,0.06)] px-2.5 py-1 rounded-lg text-[#D4A5A5] font-mono">
                          {item.slug}
                        </code>
                      </td>
                      {activeTab === 'tags' && (
                        <td>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--admin-text-secondary, #6b564c)' }}>
                            {item.description || '—'}
                          </span>
                        </td>
                      )}
                      <td>
                        <span
                          className={`admin-badge ${item.status === 'active' ? 'admin-badge--ok' : 'admin-badge--low'}`}
                        >
                          {item.status === 'active' 
                            ? (isVi ? 'Đang hoạt động' : 'Active') 
                            : (isVi ? 'Tạm ngừng' : 'Inactive')
                          }
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            type="button"
                            className="admin-icon-btn"
                            aria-label={`Sửa ${item.name}`}
                            onClick={() => handleEditClick(item)}
                          >
                            <Pencil size={17} />
                          </button>
                          {isSystemTag ? (
                            <button
                              type="button"
                              className="admin-icon-btn opacity-40 cursor-not-allowed"
                              title={isVi ? 'Tag hệ thống mặc định (Không thể xóa)' : 'Default system tag (Cannot be deleted)'}
                              disabled
                            >
                              <Lock size={17} className="text-gray-400" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="admin-icon-btn admin-icon-btn--danger"
                              aria-label={`Xóa ${item.name}`}
                              onClick={() => {
                                const confirmMsg = isVi 
                                  ? `Bạn có chắc chắn muốn xóa "${item.name}" khỏi cơ sở dữ liệu?`
                                  : `Are you sure you want to delete "${item.name}" from the database?`;
                                if (confirm(confirmMsg)) {
                                  deleteMutation.mutate(item._id);
                                }
                              }}
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
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

      {/* Sleek slide-in modal */}
      {isModalOpen && (
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
      )}
    </div>
  );
}
