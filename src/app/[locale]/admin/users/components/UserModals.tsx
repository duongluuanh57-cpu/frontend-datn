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
} from 'lucide-react';
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

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
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
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

