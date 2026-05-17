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
  UserX
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
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

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="admin-page-header__title">Quản trị người dùng</h1>
          <p className="admin-page-header__subtitle">Quản lý tài khoản khách hàng và nhân viên hệ thống.</p>
        </div>
        <div className="admin-page-header__actions">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A5C5C]/40 group-focus-within:text-[#D4A5A5] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-[#7A5C5C]/10 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#D4A5A5] focus:ring-4 focus:ring-[#D4A5A5]/5 transition-all w-64"
            />
          </div>
          <button className="admin-btn-primary">
            <UserPlus size={18} />
            Thêm quản trị viên
          </button>
        </div>
      </header>

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
              ) : !filteredUsers?.length ? (
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
                  {filteredUsers.map((user) => (
                    <motion.tr 
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td>
                        <div className="flex items-center gap-4">
                          <div className="relative h-10 w-10 rounded-full bg-[#F9F6F3] overflow-hidden border-2 border-white shadow-sm">
                            {user.avatar ? (
                              <Image src={user.avatar} alt={user.username} fill className="object-cover" />
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
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'ADMIN' 
                            ? 'bg-[#7A5C5C]/10 text-[#7A5C5C]' 
                            : 'bg-[#D4A5A5]/10 text-[#D4A5A5]'
                        }`}>
                          <Shield size={10} />
                          {user.role}
                        </span>
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
                            title="Chỉnh sửa quyền"
                          >
                            <MoreVertical size={16} />
                          </button>
                          <button 
                            className="admin-icon-btn admin-icon-btn--danger"
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa người dùng "${user.username}"?`)) {
                                deleteMutation.mutate(user._id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
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
      </div>
    </div>
  );
}
