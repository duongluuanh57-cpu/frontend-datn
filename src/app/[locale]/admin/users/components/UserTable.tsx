'use client';

import React from 'react';
import { 
  Users, 
  Shield, 
  Mail, 
  Calendar, 
  Loader2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/navigation';
import type { UseAdminUsersReturn } from '@/hooks/useAdminUsers';

interface UserTableProps {
  adminUsers: UseAdminUsersReturn;
}

export function UserTable({ adminUsers }: UserTableProps) {
  const {
    users,
    isLoading,
    updateRoleMutation,
    handleToggleRole,
    handleOpenModal,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    total,
    selectedIds,
    isAllSelected,
    isSomeSelected,
    handleSelectAll,
    handleSelectRow
  } = adminUsers;

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
              <th>Thành viên</th>
              <th>Vai trò</th>
              <th>Ngày gia nhập</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>
                  <div className="admin-loading py-20">
                    <Loader2 className="admin-loading__spinner animate-spin" />
                    <p>Đang đồng bộ dữ liệu người dùng...</p>
                  </div>
                </td>
              </tr>
            ) : !users?.length ? (
              <tr>
                <td colSpan={6}>
                  <div className="admin-empty py-20">
                    <Users className="admin-empty__icon" />
                    <p>Không tìm thấy người dùng nào phù hợp.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isChecked = selectedIds.includes(user._id);
                return (
                  <tr key={user._id} style={isChecked ? { background: 'rgba(212, 165, 165, 0.05)' } : undefined}>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSelectRow(user._id)}
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
                      <div className="flex items-center gap-4">
                        <div className="relative h-10 w-10 rounded-full bg-[#F9F6F3] overflow-hidden border-2 border-white shadow-sm">
                          {user.avatar && user.avatar.startsWith('http') ? (
                            <Image 
                              src={user.avatar} 
                              alt={user.username} 
                              fill 
                              className="object-cover"
                              unoptimized={!user.avatar.includes('r2.dev') && !user.avatar.includes('googleusercontent.com')}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#7A5C5C] font-bold text-xs">
                              {user.username.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#7A5C5C]">{user.username}</p>
                          <p className="text-[11px] text-[#7A5C5C]/50 flex items-center gap-1">
                            <Mail size={10} /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleRole(user)}
                        disabled={updateRoleMutation.isPending}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 ${
                          user.role === 'ADMIN' 
                            ? 'bg-[#7A5C5C]/10 text-[#7A5C5C] hover:bg-[#7A5C5C]/20' 
                            : 'bg-[#D4A5A5]/10 text-[#D4A5A5] hover:bg-[#D4A5A5]/20'
                        }`}
                        title="Click để thay đổi vai trò"
                      >
                        <Shield size={10} />
                        {user.role}
                      </button>
                    </td>
                    <td>
                      <p className="text-xs text-[#7A5C5C]/70 flex items-center gap-1.5">
                        <Calendar size={13} />
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <Link 
                          href={`/admin/users/${user._id}`}
                          className="admin-icon-btn" 
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link 
                          href={`/admin/users/${user._id}/edit`}
                          className="admin-icon-btn" 
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
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

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-[#7A5C5C]/60">
            Hiển thị <span className="font-semibold text-[#7A5C5C]">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-[#7A5C5C]">{Math.min(currentPage * itemsPerPage, total)}</span> trong tổng số <span className="font-semibold text-[#7A5C5C]">{total}</span> người dùng
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    currentPage === page
                      ? 'bg-[#7A5C5C] text-white'
                      : 'bg-gray-100 text-[#7A5C5C]/60 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}