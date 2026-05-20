'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Shield, 
  Loader2,
  Edit2,
  X,
  Save,
  Eye,
  Mail,
  Calendar
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import type { UseAdminUsersReturn } from '@/hooks/useAdminUsers';
import type { User, UserFormData } from '@/types/admin';

interface UserModalsProps {
  adminUsers: UseAdminUsersReturn;
}

export function UserModals({ adminUsers }: UserModalsProps) {
  const {
    isModalOpen,
    handleCloseModal,
    editingUser,
    createUserMutation,
    updateUserMutation,
    viewingUser,
    setViewingUser
  } = adminUsers;

  const handleSubmitForm = (data: UserFormData) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser._id, userData: data });
    } else {
      createUserMutation.mutate(data);
    }
  };

  return (
    <>
      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={editingUser}
        onSubmit={handleSubmitForm}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        user={viewingUser}
        onClose={() => setViewingUser(null)}
      />
    </>
  );
}

// ============================================================
// User Form Modal Component
// ============================================================
interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSubmit: (data: UserFormData) => void;
  isLoading: boolean;
}

function UserFormModal({ isOpen, onClose, user, onSubmit, isLoading }: UserFormModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    role: 'USER'
  });

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          username: user.username,
          email: user.email,
          password: '',
          role: user.role
        });
      } else {
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'USER'
        });
      }
    }
  }, [isOpen, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username.trim() || !formData.email.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!user && !formData.password) {
      toast.error('Vui lòng nhập mật khẩu cho người dùng mới');
      return;
    }

    const submitData: UserFormData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      role: formData.role
    };

    if (formData.password) {
      submitData.password = formData.password;
    }

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#7A5C5C] to-[#604444] px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {user ? <Edit2 size={20} /> : <UserPlus size={20} />}
              {user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-2">
                Tên người dùng
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4A5A5] focus:ring-4 focus:ring-[#D4A5A5]/10 transition-all"
                placeholder="Nhập tên người dùng..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4A5A5] focus:ring-4 focus:ring-[#D4A5A5]/10 transition-all"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-2">
                Mật khẩu {user && '(để trống nếu không đổi)'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4A5A5] focus:ring-4 focus:ring-[#D4A5A5]/10 transition-all"
                placeholder="••••••••"
                required={!user}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-2">
                Vai trò
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['USER', 'ADMIN'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role }))}
                    className={`py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-wider border-2 transition-all ${
                      formData.role === role
                        ? 'bg-[#7A5C5C] text-white border-[#7A5C5C]'
                        : 'bg-white text-[#7A5C5C]/60 border-gray-200 hover:border-[#7A5C5C]/40'
                    }`}
                  >
                    <Shield size={16} className="inline mr-2" />
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-[#7A5C5C]/60 hover:bg-gray-50 transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-[#7A5C5C] hover:bg-[#604444] text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Đang lưu...</>
                ) : (
                  <><Save size={16} /> {user ? 'Cập nhật' : 'Tạo mới'}</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// User Detail Modal Component
// ============================================================
interface UserDetailModalProps {
  user: User | null;
  onClose: () => void;
}

function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  if (!user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#D4A5A5] to-[#B8A5C8] px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye size={20} />
              Chi tiết người dùng
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div className="relative h-20 w-20 rounded-full bg-[#F9F6F3] overflow-hidden border-4 border-white shadow-lg">
                {user.avatar && user.avatar.startsWith('http') ? (
                  <Image 
                    src={user.avatar} 
                    alt={user.username} 
                    fill 
                    className="object-cover"
                    unoptimized={!user.avatar.includes('r2.dev') && !user.avatar.includes('googleusercontent.com')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#7A5C5C] font-bold text-2xl">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#7A5C5C]">{user.username}</h3>
                <p className="text-sm text-[#7A5C5C]/60 flex items-center gap-1.5 mt-1">
                  <Mail size={14} /> {user.email}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                <p className="text-xs font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-2">Vai trò</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  user.role === 'ADMIN' 
                    ? 'bg-[#7A5C5C]/10 text-[#7A5C5C]' 
                    : 'bg-[#D4A5A5]/10 text-[#D4A5A5]'
                }`}>
                  <Shield size={12} />
                  {user.role}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                <p className="text-xs font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-2">Ngày tham gia</p>
                <p className="text-sm font-semibold text-[#7A5C5C] flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-[#7A5C5C] rounded-xl text-sm font-semibold transition-all"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
