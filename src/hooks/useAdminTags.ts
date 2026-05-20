'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLocale } from 'next-intl';
import { TaxonomyItem } from '@/types/admin';

export interface UseAdminTagsReturn {
  locale: string;
  isVi: boolean;
  tags: TaxonomyItem[] | undefined;
  isLoading: boolean;
  error: any;
  deleteMutation: any;
}

export function useAdminTags(): UseAdminTagsReturn {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  // Fetch tags
  const { data: tags, isLoading, error } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: async () => {
      const { data } = await api.get('/tags');
      return data.data as TaxonomyItem[];
    },
  });

  // Mutation: Delete tag
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/tags/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized') || err.response?.data?.message?.includes('đăng nhập');
      if (isAuth) {
        alert(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        alert(isVi ? 'Không thể xóa tag này.' : 'Failed to delete tag.');
      }
    }
  });

  return {
    locale,
    isVi,
    tags,
    isLoading,
    error,
    deleteMutation
  };
}
