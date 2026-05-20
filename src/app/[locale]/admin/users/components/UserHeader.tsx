'use client';

import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import type { UseAdminUsersReturn } from '@/hooks/useAdminUsers';

interface UserHeaderProps {
  adminUsers: UseAdminUsersReturn;
}

export function UserHeader({ adminUsers }: UserHeaderProps) {
  const { handleOpenModal } = adminUsers;

  return (
    <header className="admin-page-header">
      <div>
        <h1 className="admin-page-header__title flex items-center gap-3">
          <Users className="text-[#D4A5A5]" size={28} />
          Quản trị người dùng
        </h1>
        <p className="admin-page-header__subtitle">Quản lý tài khoản khách hàng và nhân viên hệ thống.</p>
      </div>
      <div className="admin-page-header__actions">
        <button 
          className="admin-btn-primary"
          onClick={() => handleOpenModal()}
        >
          <UserPlus size={18} />
          Thêm người dùng
        </button>
      </div>
    </header>
  );
}
