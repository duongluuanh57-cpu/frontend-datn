'use client';

import React from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { UserHeader } from './components/UserHeader';
import { UserStats } from './components/UserStats';
import { UserFilterBar } from './components/UserFilterBar';
import { UserTable } from './components/UserTable';
import { UserModals } from './components/UserModals';
import { UserBulkActionBar } from './components/UserBulkActionBar';
import { UserDeleteModal } from './components/UserDeleteModal';
import { AlertCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const adminUsers = useAdminUsers();
  const { error } = adminUsers;

  if (error) {
    return (
      <div className="admin-alert">
        <AlertCircle className="admin-alert__icon" />
        <h2 className="admin-alert__title">Lỗi kết nối hệ thống</h2>
        <p className="admin-alert__text">Không thể truy xuất danh sách người dùng. Hãy thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <UserHeader />
      <UserStats adminUsers={adminUsers} />
      <UserFilterBar adminUsers={adminUsers} />
      <UserTable adminUsers={adminUsers} />
      <UserModals adminUsers={adminUsers} />
      <UserBulkActionBar adminUsers={adminUsers} />
      <UserDeleteModal adminUsers={adminUsers} />
    </div>
  );
}