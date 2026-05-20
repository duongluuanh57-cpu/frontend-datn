'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';
import type { UseAdminUsersReturn } from '@/hooks/useAdminUsers';
import type { RoleFilter } from '@/types/admin';

interface UserFilterBarProps {
  adminUsers: UseAdminUsersReturn;
}

export function UserFilterBar({ adminUsers }: UserFilterBarProps) {
  const {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    setCurrentPage
  } = adminUsers;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A5C5C]/40 group-focus-within:text-[#D4A5A5] transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#D4A5A5] focus:ring-4 focus:ring-[#D4A5A5]/5 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#7A5C5C]/60" />
          <div className="flex gap-2">
            {(['ALL', 'ADMIN', 'USER'] as RoleFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setRoleFilter(filter);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  roleFilter === filter
                    ? 'bg-[#7A5C5C] text-white shadow-md'
                    : 'bg-gray-100 text-[#7A5C5C]/60 hover:bg-gray-200'
                }`}
              >
                {filter === 'ALL' ? 'Tất cả' : filter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
