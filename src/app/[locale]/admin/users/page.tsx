'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  Mail, 
  Calendar, 
  MoreVertical,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
  Edit2,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Activity
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import React from 'react';
import { toast } from 'sonner';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  createdAt: string;
  twoFactorEnabled: boolean;
}

type RoleFilter = 'ALL' | 'USER' | 'ADMIN';

interface UserFormData {
  username: string;
  email: string;
  password?: string;
  role: 'USER' | 'ADMIN';
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const itemsPerPage = 10;

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data.data as User[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Đã xóa người dùng thành công');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể xóa người dùng');
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: 'USER' | 'ADMIN' }) => 
      api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Đã cập nhật vai trò thành công');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể cập nhật vai trò');
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => api.post('/users', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Đã tạo người dùng mới thành công');
      setIsModalOpen(false);
      setEditingUser(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể tạo người dùng');
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: Partial<UserFormData> }) => 
      api.patch(`/users/${id}`, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Đã cập nhật người dùng thành công');
      setIsModalOpen(false);
      setEditingUser(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể cập nhật người dùng');
    }
  });

  // Filter and pagination logic
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    if (!users) return { total: 0, admins: 0, regularUsers: 0, with2FA: 0 };
    
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      regularUsers: users.filter(u => u.role === 'USER').length,
      with2FA: users.filter(u => u.twoFactorEnabled).length
    };
  }, [users]);

  const handleOpenModal = (user?: User) => {
    setEditingUser(user || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleToggleRole = (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (confirm(`Bạn có chắc muốn thay đổi vai trò của "${user.username}" thành ${newRole}?`)) {
      updateRoleMutation.mutate({ id: user._id, role: newRole });
    }
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#7A5C5C]/60 font-semibold uppercase tracking-wider mb-1">Đã bật 2FA</p>
              <p className="text-2xl font-bold text-[#7A5C5C]">{stats.with2FA}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Lock size={24} className="text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
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

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Thành viên</th>
                <th>Vai trò</th>
                <th>Bảo mật 2FA</th>
                <th>Ngày gia nhập</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-loading py-20">
                      <Loader2 className="admin-loading__spinner" />
                      <p>Đang đồng bộ dữ liệu người dùng...</p>
                    </div>
                  </td>
                </tr>
              ) : !paginatedUsers?.length ? (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-empty py-20">
                      <Users className="admin-empty__icon" />
                      <p>Không tìm thấy người dùng nào phù hợp.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {paginatedUsers.map((user) => (
                    <motion.tr 
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
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
                        <div className="flex items-center gap-2">
                          {user.twoFactorEnabled ? (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-green-600">
                              <UserCheck size={14} /> Đã bật
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-[#7A5C5C]/40">
                              <UserX size={14} /> Chưa bật
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <p className="text-xs text-[#7A5C5C]/70 flex items-center gap-1.5">
                          <Calendar size={13} />
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button 
                            className="admin-icon-btn" 
                            title="Xem chi tiết"
                            onClick={() => setViewingUser(user)}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="admin-icon-btn" 
                            title="Chỉnh sửa"
                            onClick={() => handleOpenModal(user)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="admin-icon-btn admin-icon-btn--danger"
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa người dùng "${user.username}"?`)) {
                                deleteMutation.mutate(user._id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            title="Xóa người dùng"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-[#7A5C5C]/60">
              Hiển thị <span className="font-semibold text-[#7A5C5C]">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-[#7A5C5C]">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> trong tổng số <span className="font-semibold text-[#7A5C5C]">{filteredUsers.length}</span> người dùng
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

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={editingUser}
        onSubmit={(data) => {
          if (editingUser) {
            updateUserMutation.mutate({ id: editingUser._id, userData: data });
          } else {
            createUserMutation.mutate(data);
          }
        }}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        user={viewingUser}
        onClose={() => setViewingUser(null)}
      />
    </div>
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
  React.useEffect(() => {
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
              <div className="bg-gray-50 rounded-xl p-4">
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

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-2">Bảo mật 2FA</p>
                {user.twoFactorEnabled ? (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                    <UserCheck size={16} /> Đã kích hoạt
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[#7A5C5C]/40">
                    <UserX size={16} /> Chưa kích hoạt
                  </span>
                )}
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
