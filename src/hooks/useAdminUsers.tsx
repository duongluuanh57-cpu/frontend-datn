'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { User, RoleFilter, UserFormData } from '@/types/admin';

export interface UseAdminUsersReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: RoleFilter;
  setRoleFilter: (role: RoleFilter) => void;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  editingUser: User | null;
  setEditingUser: (user: User | null) => void;
  viewingUser: User | null;
  setViewingUser: (user: User | null) => void;
  itemsPerPage: number;
  users: User[] | undefined;
  isLoading: boolean;
  error: any;
  total: number;
  totalPages: number;
  stats: {
    total: number;
    admins: number;
    regularUsers: number;
  };
  deleteMutation: any;
  updateRoleMutation: any;
  createUserMutation: any;
  updateUserMutation: any;
  handleOpenModal: (user?: User) => void;
  handleCloseModal: () => void;
  handleToggleRole: (user: User) => void;
}


export function useAdminUsers(): UseAdminUsersReturn {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const itemsPerPage = 10;

  // Build query params
  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (searchTerm) params.search = searchTerm;
    if (roleFilter !== 'ALL') params.role = roleFilter;
    return params;
  }, [currentPage, searchTerm, roleFilter]);

  // Fetch users with server-side pagination
  const { data: pageData, isLoading, error } = useQuery({
    queryKey: ['admin-users', queryParams],
    queryFn: async () => {
      const { data } = await api.get('/users', { params: queryParams });
      return data.data as { items: User[]; total: number; page: number; totalPages: number };
    },
    staleTime: 15_000,
  });

  const users = pageData?.items;
  const total = pageData?.total || 0;
  const totalPages = pageData?.totalPages || 0;

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

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

  // Stats - computed from server data (total from pagination response, roles from API)
  const { data: allUsers } = useQuery({
    queryKey: ['admin-users-stats'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data.data as User[];
    },
    staleTime: 60_000,
  });

  const stats = useMemo(() => {
    if (!allUsers) return { total: 0, admins: 0, regularUsers: 0 };
    return {
      total: allUsers.length,
      admins: allUsers.filter(u => u.role === 'ADMIN').length,
      regularUsers: allUsers.filter(u => u.role === 'USER').length
    };
  }, [allUsers]);

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
    toast.custom((tId) => (
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 flex flex-col gap-3 min-w-[280px]">
        <p className="text-sm font-semibold text-[#7A5C5C]">Xác nhận đổi vai trò</p>
        <p className="text-xs text-[#7A5C5C]/70">Bạn có chắc muốn thay đổi vai trò của &quot;{user.username}&quot; thành {newRole}?</p>
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={() => toast.dismiss(tId)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-[#7A5C5C] hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              updateRoleMutation.mutate({ id: user._id, role: newRole });
              toast.dismiss(tId);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#7A5C5C] text-white hover:bg-[#604444] transition-colors"
          >
            Xác nhận
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  return {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    currentPage,
    setCurrentPage,
    isModalOpen,
    setIsModalOpen,
    editingUser,
    setEditingUser,
    viewingUser,
    setViewingUser,
    itemsPerPage,
    users,
    isLoading,
    error,
    total,
    totalPages,
    stats,
    deleteMutation,
    updateRoleMutation,
    createUserMutation,
    updateUserMutation,
    handleOpenModal,
    handleCloseModal,
    handleToggleRole
  };
}
