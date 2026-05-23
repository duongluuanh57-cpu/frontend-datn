'use client';

import React from 'react';
import { Users } from 'lucide-react';

export function UserHeader() {
  return (
    <header className="admin-page-header">
      <div>
        <h1 className="admin-page-header__title flex items-center gap-3">
          <Users className="text-[#D4A5A5]" size={28} />
          Quản lý người dùng
        </h1>
        <p className="admin-page-header__subtitle">Quản lý tài khoản khách hàng và nhân viên hệ thống.</p>
      </div>
    </header>
  );
}
