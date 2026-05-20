'use client';

import React from 'react';
import { 
  LogOut, 
  LayoutDashboard, 
  User as UserIcon, 
  Shield, 
  Settings, 
  ShoppingBag, 
  Lock, 
  Camera, 
  Loader2 
} from 'lucide-react';
import type { UseUserProfileReturn, ActiveTab } from '@/hooks/useUserProfile';

interface ProfileSidebarProps {
  userProfile: UseUserProfileReturn;
}

export function ProfileSidebar({ userProfile }: ProfileSidebarProps) {
  const {
    user,
    activeTab,
    setActiveTab,
    setStatusMessage,
    avatarUploading,
    avatarInputRef,
    handleAvatarUpload,
    isAdmin,
    router,
    handleLogout
  } = userProfile;

  const menuItems = [
    { id: 'profile' as ActiveTab, name: 'Thông tin cá nhân', icon: UserIcon },
    { id: 'orders' as ActiveTab, name: 'Lịch sử mua sắm', icon: ShoppingBag },
    { id: 'security' as ActiveTab, name: 'Bảo mật & Xác thực', icon: Lock },
    { id: 'settings' as ActiveTab, name: 'Thiết lập hệ thống', icon: Settings },
  ];

  return (
    <aside className="profile-dashboard-sidebar">
      {/* User Profiler block */}
      <div className="profile-sidebar-user">
        {/* Hidden file input */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleAvatarUpload}
        />

        {/* Clickable avatar */}
        <div
          className="profile-sidebar-avatar profile-sidebar-avatar-upload"
          onClick={() => !avatarUploading && avatarInputRef.current?.click()}
          title="Bấm để thay đổi ảnh đại diện"
          style={{ cursor: avatarUploading ? 'wait' : 'pointer' }}
        >
          {avatarUploading ? (
            <Loader2 size={28} color="var(--primary)" strokeWidth={2} className="profile-avatar-spinner" />
          ) : user.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            <UserIcon size={42} color="var(--primary)" strokeWidth={1.5} />
          )}

          {/* Camera overlay on hover */}
          {!avatarUploading && (
            <div className="profile-avatar-camera-overlay">
              <Camera size={18} color="white" strokeWidth={2} />
            </div>
          )}
        </div>

        <h2>{user.username}</h2>
        <p>{user.email}</p>
        <div className={`profile-sidebar-role ${isAdmin ? 'admin' : 'user'}`}>
          <Shield size={12} strokeWidth={2.5} />
          {user.role}
        </div>
      </div>

      {/* Menu Tabs Navigation */}
      <nav className="profile-dashboard-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setStatusMessage(null);
            }}
            className={`profile-dashboard-menu-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <item.icon size={18} strokeWidth={2} />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Actions Footer */}
      <div className="profile-sidebar-footer">
        {isAdmin && (
          <button 
            onClick={() => router.push('/admin')}
            className="btn-profile-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <LayoutDashboard size={16} strokeWidth={2.5} />
            Vào Dashboard
          </button>
        )}
        <button 
          onClick={handleLogout}
          className="btn-profile-secondary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <LogOut size={16} strokeWidth={2.5} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
