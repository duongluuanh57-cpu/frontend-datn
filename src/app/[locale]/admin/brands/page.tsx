'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Pencil, Trash2, Loader2, Sparkles, AlertCircle, Award, Check, X, Globe, Search } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/navigation';
import React from 'react';
import { toast } from 'sonner';

interface Brand {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  origin?: string;
  status: 'active' | 'inactive';
  featured: boolean;
}

export default function AdminBrandsPage() {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const [brandToDelete, setBrandToDelete] = React.useState<Brand | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = React.useState(false);

  // Lấy danh sách thương hiệu
  const { data: brands, isLoading, error } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return data.data as Brand[];
    },
  });

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedOrigin, setSelectedOrigin] = React.useState('');

  // Lấy danh sách xuất xứ duy nhất từ API
  const { data: origins } = useQuery({
    queryKey: ['brand-origins'],
    queryFn: async () => {
      const { data } = await api.get('/brands/origins');
      return data.data as string[];
    },
  });

  // Lọc thương hiệu dựa trên ô tìm kiếm và dropdown xuất xứ
  const filteredBrands = React.useMemo(() => {
    if (!brands) return [];
    return brands.filter(brand => {
      const nameMatch = brand.name.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = brand.description ? brand.description.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const matchesSearch = nameMatch || descMatch;
      const matchesOrigin = !selectedOrigin || brand.origin === selectedOrigin;
      return matchesSearch && matchesOrigin;
    });
  }, [brands, searchTerm, selectedOrigin]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 15;

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedOrigin]);

  const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);

  const paginatedBrands = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBrands.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredBrands, currentPage]);

  // Mutation: Cập nhật thương hiệu (dành cho nút toggle featured)
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Brand> }) =>
      api.patch(`/brands/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized') || err.response?.data?.message?.includes('đăng nhập');
      if (isAuth) {
        alert(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        alert(isVi ? 'Không thể cập nhật thương hiệu. Vui lòng thử lại!' : 'Failed to update brand. Please try again!');
      }
    }
  });

  // Mutation: Xóa thương hiệu
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/brands/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      toast.success(isVi ? 'Đã xóa thương hiệu thành công!' : 'Brand deleted successfully!');
      setBrandToDelete(null);
      setSelectedIds(prev => prev.filter(item => item !== id));
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized') || err.response?.data?.message?.includes('đăng nhập');
      if (isAuth) {
        toast.error(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        toast.error(err.response?.data?.message || (isVi ? 'Không thể xóa thương hiệu này.' : 'Failed to delete brand.'));
      }
      setBrandToDelete(null);
    }
  });

  // Mutation: Xóa hàng loạt thương hiệu
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => api.post('/brands/bulk-delete', { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      toast.success(isVi ? 'Đã xóa hàng loạt thương hiệu thành công!' : 'Bulk deleted brands successfully!');
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.response?.data?.message || (isVi ? 'Không thể xóa các thương hiệu đã chọn.' : 'Failed to delete selected brands.'));
      setShowBulkDeleteModal(false);
    }
  });

  const handleToggleFeatured = (brand: Brand) => {
    updateMutation.mutate({
      id: brand._id,
      data: { featured: !brand.featured }
    });
  };

  const allFilteredIds = paginatedBrands.map(b => b._id);
  const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  if (error) {
    return (
      <div className="admin-alert">
        <AlertCircle className="admin-alert__icon" />
        <h2 className="admin-alert__title">{isVi ? 'Lỗi kết nối dữ liệu' : 'Data Connection Error'}</h2>
        <p className="admin-alert__text">
          {isVi ? 'Không thể tải danh sách thương hiệu. Vui lòng kiểm tra lại kết nối server.' : 'Unable to load brands. Please verify server connection.'}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">{isVi ? 'QUẢN LÝ THƯƠNG HIỆU' : 'BRAND MANAGEMENT'}</h1>
          <p className="admin-page-header__subtitle">
            {isVi ? 'Danh sách các thương hiệu nước hoa xa xỉ đang hoạt động.' : 'Active premium fragrance brands catalog.'}
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link href="/admin/brands/new" className="admin-btn-primary flex items-center gap-2">
            <Plus size={18} />
            {isVi ? 'Thêm thương hiệu mới' : 'Add New Brand'}
          </Link>
        </div>
      </header>

      {/* Search & Origin Filter Bar */}
      <div style={{
        background: 'var(--admin-surface, #ffffff)',
        border: '1px solid var(--admin-border-subtle, #f0e9e4)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(61, 46, 36, 0.03)',
      }}>
        {/* Search Input */}
        <div style={{
          flex: '1 1 300px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#a89285',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder={isVi ? 'Tìm kiếm theo tên thương hiệu hoặc mô tả...' : 'Search by brand name or description...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              fontSize: '0.875rem',
              background: 'var(--admin-surface-muted, #faf8f6)',
              border: '1px solid var(--admin-border, #e8e0da)',
              borderRadius: '10px',
              color: 'var(--admin-text, #3d2e24)',
              outline: 'none',
              transition: 'all 0.2s',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#a89285',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Origin Select Dropdown */}
        <div style={{
          flex: '0 1 240px',
          minWidth: '180px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#a89285',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Globe size={16} />
          </div>
          <select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 32px 10px 38px',
              fontSize: '0.875rem',
              background: 'var(--admin-surface-muted, #faf8f6)',
              border: '1px solid var(--admin-border, #e8e0da)',
              borderRadius: '10px',
              color: 'var(--admin-text, #3d2e24)',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              transition: 'all 0.2s',
            }}
          >
            <option value="">{isVi ? 'Tất cả xuất xứ' : 'All Origins'}</option>
            {origins && origins.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#a89285',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Brands List Table */}
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
                <th>{isVi ? 'Thương hiệu' : 'Brand'}</th>
                <th>{isVi ? 'Xuất xứ' : 'Origin'}</th>
                <th>{isVi ? 'Trạng thái' : 'Status'}</th>
                <th>{isVi ? 'Nổi bật (Homepage)' : 'Featured'}</th>
                <th style={{ textAlign: 'right' }}>{isVi ? 'Thao tác' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-loading">
                      <Loader2 className="admin-loading__spinner animate-spin" />
                      <p>{isVi ? 'Đang tải danh sách thương hiệu...' : 'Loading brands catalog...'}</p>
                    </div>
                  </td>
                </tr>
              ) : !brands?.length ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty">
                      <Sparkles className="admin-empty__icon" />
                      <p>{isVi ? 'Chưa có thương hiệu nào được tạo.' : 'No brand entries found.'}</p>
                    </div>
                  </td>
                </tr>
              ) : !filteredBrands?.length ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty">
                      <Search className="admin-empty__icon" style={{ opacity: 0.5, marginBottom: '8px' }} />
                      <p>{isVi ? 'Không tìm thấy thương hiệu nào khớp với bộ lọc.' : 'No brands matching the filters found.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBrands.map((brand) => {
                  const isChecked = selectedIds.includes(brand._id);
                  return (
                    <tr key={brand._id} style={isChecked ? { background: 'rgba(212, 165, 165, 0.05)' } : undefined}>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(brand._id)}
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
                        <div className="admin-table-product">
                          <div className="admin-table-product__thumb flex items-center justify-center bg-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden relative">
                            {brand.logo ? (
                              <Image
                                src={brand.logo}
                                alt={brand.name}
                                fill
                                sizes="52px"
                                className="object-cover"
                              />
                            ) : (
                              <Award className="text-[#D4A5A5]" size={22} />
                            )}
                          </div>
                          <div>
                            <Link href={`/admin/brands/${brand._id}`}>
                              <p className="admin-table-product__name hover:underline hover:text-[var(--admin-accent)] transition-colors">{brand.name}</p>
                            </Link>
                            <p className="admin-table-product__meta truncate max-w-[300px]">
                              {brand.description || (isVi ? 'Chưa có mô tả câu chuyện.' : 'No brand description.')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="flex items-center gap-2 text-sm text-[#7A5C5C]">
                          <Globe size={14} className="text-[#D4A5A5]" />
                          {brand.origin || (isVi ? 'Chưa cập nhật' : 'Unknown')}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${brand.status === 'active' ? 'admin-badge--ok' : 'admin-badge--low'}`}
                        >
                          {brand.status === 'active'
                            ? (isVi ? 'Đang hoạt động' : 'Active')
                            : (isVi ? 'Tạm ngừng' : 'Inactive')
                          }
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleFeatured(brand)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${brand.featured
                            ? 'bg-[#7A5C5C]/10 text-[#7A5C5C] border border-[#7A5C5C]/20'
                            : 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200'
                            }`}
                        >
                          {brand.featured ? <Check size={12} /> : <X size={12} />}
                          {brand.featured ? (isVi ? 'Nổi bật' : 'Featured') : (isVi ? 'Thường' : 'Standard')}
                        </button>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            type="button"
                            className="admin-icon-btn admin-icon-btn--danger"
                            aria-label={`Xóa ${brand.name}`}
                            onClick={() => setBrandToDelete(brand)}
                          >
                            <Trash2 size={17} />
                          </button>
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

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'var(--admin-surface, #ffffff)',
          border: '1px solid var(--admin-border-subtle, #f0e9e4)',
          borderTop: 'none',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px',
          boxShadow: '0 4px 20px rgba(61, 46, 36, 0.02)',
          marginTop: '-1px', // Seamlessly connect with the table border
        }}>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#7A5C5C', fontWeight: 500 }}>
            {isVi
              ? `Hiển thị từ ${(currentPage - 1) * ITEMS_PER_PAGE + 1} đến ${Math.min(currentPage * ITEMS_PER_PAGE, filteredBrands.length)} trong tổng số ${filteredBrands.length} thương hiệu`
              : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} to ${Math.min(currentPage * ITEMS_PER_PAGE, filteredBrands.length)} of ${filteredBrands.length} brands`}
          </p>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Previous Page Button */}
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: currentPage === 1 ? '#c8b8b0' : 'var(--admin-text, #3d2e24)',
                background: 'transparent',
                border: '1px solid var(--admin-border, #e8e0da)',
                borderRadius: '8px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isVi ? 'Trước' : 'Previous'}
            </button>

            {/* Page Tabs/Numbers */}
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isActive ? 'var(--admin-accent, #3d2e24)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--admin-text, #3d2e24)',
                    border: isActive ? '1px solid var(--admin-accent, #3d2e24)' : '1px solid transparent',
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Page Button */}
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: currentPage === totalPages ? '#c8b8b0' : 'var(--admin-text, #3d2e24)',
                background: 'transparent',
                border: '1px solid var(--admin-border, #e8e0da)',
                borderRadius: '8px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isVi ? 'Tiếp' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {/* Stunning Luxury Custom Modal for Deleting Single Brand */}
      {brandToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(30, 20, 15, 0.45)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
        }}>
          <div style={{
            background: 'var(--admin-surface, #ffffff)',
            border: '1px solid var(--admin-border-subtle, #f0e9e4)',
            borderRadius: '24px',
            padding: '28px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 24px 48px rgba(30, 20, 15, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '16px',
                padding: '12px',
                color: 'var(--admin-danger, #ef4444)',
                flexShrink: 0,
              }}>
                <AlertCircle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--admin-text, #3d2e24)' }}>
                  {isVi ? 'Xác nhận xóa thương hiệu' : 'Confirm Delete Brand'}
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', lineHeight: '1.4', color: 'var(--admin-text-secondary, #6b564c)' }}>
                  {isVi
                    ? `Bạn có chắc chắn muốn xóa vĩnh viễn thương hiệu này? Việc này sẽ xóa logo và các dữ liệu liên quan và không thể hoàn tác.`
                    : `Are you sure you want to permanently delete this brand? This will erase the logo and all associated brand data and cannot be undone.`}
                </p>
              </div>
            </div>

            {/* Brand details preview card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--admin-surface-muted, #faf8f6)',
              border: '1px solid var(--admin-border-subtle, #f0e9e4)',
              borderRadius: '16px',
              padding: '12px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.1)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {brandToDelete.logo ? (
                  <Image
                    src={brandToDelete.logo}
                    alt={brandToDelete.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <Award className="text-[#D4A5A5]" size={20} />
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text, #3d2e24)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {brandToDelete.name}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted, #9a857c)' }}>
                  {brandToDelete.origin || (isVi ? 'Không rõ xuất xứ' : 'Unknown Origin')}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => setBrandToDelete(null)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--admin-border, #e8e0da)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--admin-text-secondary, #6b564c)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!deleteMutation.isPending) {
                    e.currentTarget.style.background = 'rgba(61, 46, 36, 0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {isVi ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  deleteMutation.mutate(brandToDelete._id);
                }}
                style={{
                  flex: 1,
                  background: 'var(--admin-danger, #ef4444)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!deleteMutation.isPending) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'var(--admin-danger, #ef4444)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                }}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isVi ? 'Đang xóa...' : 'Deleting...'}
                  </>
                ) : (
                  isVi ? 'Xác nhận xóa' : 'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gorgeous Floating Glassmorphic Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(30, 20, 15, 0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          zIndex: 100,
          color: '#ffffff',
        }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0e9e4' }}>
            {isVi ? `Đã chọn ${selectedIds.length} thương hiệu` : `${selectedIds.length} brands selected`}
          </span>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.15)' }} />
          <button
            type="button"
            onClick={() => setShowBulkDeleteModal(true)}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              borderRadius: '8px',
              padding: '6px 16px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Trash2 size={14} />
            {isVi ? 'Xóa mục đã chọn' : 'Delete Selected'}
          </button>
        </div>
      )}

      {/* Stunning Custom Luxury Modal for Bulk Deleting Brands */}
      {showBulkDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(30, 20, 15, 0.45)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
        }}>
          <div style={{
            background: 'var(--admin-surface, #ffffff)',
            border: '1px solid var(--admin-border-subtle, #f0e9e4)',
            borderRadius: '24px',
            padding: '28px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 24px 48px rgba(30, 20, 15, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '16px',
                padding: '12px',
                color: 'var(--admin-danger, #ef4444)',
                flexShrink: 0,
              }}>
                <AlertCircle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--admin-text, #3d2e24)' }}>
                  {isVi ? 'Xác nhận xóa hàng loạt' : 'Confirm Bulk Deletion'}
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', lineHeight: '1.4', color: 'var(--admin-text-secondary, #6b564c)' }}>
                  {isVi
                    ? `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} thương hiệu đã chọn? Thao tác này sẽ dọn dẹp sạch logo của chúng trên Cloud và không thể hoàn tác.`
                    : `Are you sure you want to permanently delete the ${selectedIds.length} selected brands? This will clean up all associated cloud logos and cannot be undone.`}
                </p>
              </div>
            </div>

            {/* Scrollable list of selected items */}
            <div style={{
              background: 'var(--admin-surface-muted, #faf8f6)',
              border: '1px solid var(--admin-border-subtle, #f0e9e4)',
              borderRadius: '12px',
              padding: '12px',
              maxHeight: '130px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              {brands?.filter(b => selectedIds.includes(b._id)).map((b) => (
                <div key={b._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--admin-text-secondary, #6b564c)' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--admin-accent-hover, #D4A5A5)' }} />
                  <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                disabled={bulkDeleteMutation.isPending}
                onClick={() => setShowBulkDeleteModal(false)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--admin-border, #e8e0da)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--admin-text-secondary, #6b564c)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!bulkDeleteMutation.isPending) {
                    e.currentTarget.style.background = 'rgba(61, 46, 36, 0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {isVi ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={bulkDeleteMutation.isPending}
                onClick={() => {
                  bulkDeleteMutation.mutate(selectedIds);
                }}
                style={{
                  flex: 1,
                  background: 'var(--admin-danger, #ef4444)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!bulkDeleteMutation.isPending) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'var(--admin-danger, #ef4444)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                }}
              >
                {bulkDeleteMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isVi ? 'Đang xóa...' : 'Deleting...'}
                  </>
                ) : (
                  isVi ? 'Xác nhận xóa' : 'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
