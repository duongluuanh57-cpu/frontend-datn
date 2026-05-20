'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState, useMemo } from 'react';
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
  filteredUsers: User[];
  totalPages: number;
  paginatedUsers: User[];
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

  const stats = useMemo(() => {
    if (!users) return { total: 0, admins: 0, regularUsers: 0 };
    
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      regularUsers: users.filter(u => u.role === 'USER').length
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
    filteredUsers,
    totalPages,
    paginatedUsers,
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
