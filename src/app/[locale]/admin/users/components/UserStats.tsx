'use client';

import React from 'react';
import { Users, ShieldCheck, Activity } from 'lucide-react';
import type { UseAdminUsersReturn } from '@/hooks/useAdminUsers';

interface UserStatsProps {
  adminUsers: UseAdminUsersReturn;
}

export function UserStats({ adminUsers }: UserStatsProps) {
  const { stats } = adminUsers;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#7A5C5C]/60 font-semibold uppercase tracking-wider mb-1">Tổng người dùng</p>
            <p className="text-2xl font-bold text-[#7A5C5C]">{stats.total}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-[#D4A5A5]/10 flex items-center justify-center">
            <Users size={24} className="text-[#D4A5A5]" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#7A5C5C]/60 font-semibold uppercase tracking-wider mb-1">Quản trị viên</p>
            <p className="text-2xl font-bold text-[#7A5C5C]">{stats.admins}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-[#7A5C5C]/10 flex items-center justify-center">
            <ShieldCheck size={24} className="text-[#7A5C5C]" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#7A5C5C]/60 font-semibold uppercase tracking-wider mb-1">Người dùng thường</p>
            <p className="text-2xl font-bold text-[#7A5C5C]">{stats.regularUsers}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Activity size={24} className="text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
