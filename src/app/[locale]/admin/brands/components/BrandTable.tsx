'use client';

import React from 'react';
import { Loader2, Sparkles, Search, Award, Globe, Check, X } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/navigation';
import type { UseAdminBrandsReturn } from '@/hooks/useAdminBrands';

interface BrandTableProps {
  adminBrands: UseAdminBrandsReturn;
}

export function BrandTable({ adminBrands }: BrandTableProps) {
  const {
    isVi,
    isLoading,
    brands,
    isAllSelected,
    isSomeSelected,
    handleSelectAll,
    selectedIds,
    handleSelectRow,
    handleToggleFeatured,
    setBrandToDelete,
    searchTerm,
    selectedOrigin,
    total,
  } = adminBrands;

  return (
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
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5}>
                  <div className="admin-loading">
                    <Loader2 className="admin-loading__spinner animate-spin" />
                    <p>{isVi ? 'Đang tải danh sách thương hiệu...' : 'Loading brands catalog...'}</p>
                  </div>
                </td>
              </tr>
            ) : total === 0 && !searchTerm && !selectedOrigin ? (
              <tr>
                <td colSpan={5}>
                  <div className="admin-empty">
                    <Sparkles className="admin-empty__icon" />
                    <p>{isVi ? 'Chưa có thương hiệu nào được tạo.' : 'No brand entries found.'}</p>
                  </div>
                </td>
              </tr>
            ) : !brands?.length ? (
              <tr>
                <td colSpan={5}>
                  <div className="admin-empty">
                    <Search className="admin-empty__icon" style={{ opacity: 0.5, marginBottom: '8px' }} />
                    <p>{isVi ? 'Không tìm thấy thương hiệu nào khớp với bộ lọc.' : 'No brands matching the filters found.'}</p>
                  </div>
                </td>
              </tr>
            ) : (
              brands.map((brand) => {
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
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
