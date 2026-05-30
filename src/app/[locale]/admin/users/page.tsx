'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const { error, users } = adminUsers;

  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const handleDeleteWithAnimation = (id: string) => {
    setDeletingIds(prev => [...prev, id]);
    adminUsers.setUserToDelete(null);
    setTimeout(() => adminUsers.deleteMutation.mutate(id), 400);
  };

  const handleBulkDeleteWithAnimation = (ids: string[]) => {
    setDeletingIds(prev => [...prev, ...ids]);
    adminUsers.setShowBulkDeleteModal(false);
    setTimeout(() => adminUsers.bulkDeleteMutation.mutate(ids), 400);
  };

  const prevUsersKeyRef = useRef('');

  useEffect(() => {
    const key = (users || []).map(u => u._id).join(',');
    if (prevUsersKeyRef.current === key) return;
    prevUsersKeyRef.current = key;
    setDeletingIds(prev => {
      const ids = new Set((users || []).map(u => u._id));
      const next = prev.filter(id => ids.has(id));
      return next.length === prev.length && next.every((id, i) => id === prev[i]) ? prev : next;
    });
  }, [users]);

  const animatedDeleteMutation = {
    mutate: handleDeleteWithAnimation,
    isPending: adminUsers.deleteMutation.isPending,
  };

  const animatedBulkDeleteMutation = {
    mutate: handleBulkDeleteWithAnimation,
    isPending: adminUsers.bulkDeleteMutation.isPending,
  };

  const modifiedAdminUsers = {
    ...adminUsers,
    deleteMutation: animatedDeleteMutation,
    bulkDeleteMutation: animatedBulkDeleteMutation,
  };

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
      <UserTable adminUsers={adminUsers} deletingIds={deletingIds} />
      <UserModals adminUsers={adminUsers} />
      <UserBulkActionBar adminUsers={adminUsers} />
      <UserDeleteModal adminUsers={modifiedAdminUsers} />
    </div>
  );
}