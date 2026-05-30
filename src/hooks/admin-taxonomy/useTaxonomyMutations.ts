'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface UseTaxonomyMutationsOptions {
  currentTabConfig: { queryKey: string; taxonomySlug: string | null };
  getTaxonomyId: (slug: string) => string | null;
  locale: string;
  onSuccess?: () => void;
}

export function useTaxonomyMutations({ currentTabConfig, getTaxonomyId, locale, onSuccess }: UseTaxonomyMutationsOptions) {
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentTabConfig.taxonomySlug) {
        return api.delete(`/tags/${id}`);
      }
      const taxonomyId = getTaxonomyId(currentTabConfig.taxonomySlug);
      if (!taxonomyId) throw new Error('Taxonomy không tồn tại');
      return api.delete(`/v2/taxonomies/${taxonomyId}/terms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [currentTabConfig.queryKey] });
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized');
      if (isAuth) {
        alert(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        alert(err.response?.data?.message || (isVi ? 'Vui lòng kiểm tra lại thông tin.' : 'Please check the information.'));
      }
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => api.post('/taxonomies/bulk-delete', { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [currentTabConfig.queryKey] });
      onSuccess?.();
    },
    onError: (err: any) => {
      console.error(err);
      alert(err.response?.data?.message || (isVi ? 'Không thể xóa các mục đã chọn.' : 'Failed to delete selected items.'));
    }
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, payload, isNew }: { id?: string; payload: any; isNew: boolean }) => {
      if (!currentTabConfig.taxonomySlug) {
        if (isNew) {
          return api.post('/tags', payload);
        }
        return api.patch(`/tags/${id}`, payload);
      }
      const taxonomyId = getTaxonomyId(currentTabConfig.taxonomySlug);
      if (!taxonomyId) throw new Error('Taxonomy cha chưa được tạo. Vui lòng chạy migration trước.');
      if (isNew) {
        return api.post(`/v2/taxonomies/${taxonomyId}/terms`, payload);
      }
      return api.patch(`/v2/taxonomies/${taxonomyId}/terms/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [currentTabConfig.queryKey] });
    },
    onError: (err: any) => {
      console.error(err);
      alert(err.response?.data?.message || (isVi ? 'Vui lòng kiểm tra lại thông tin.' : 'Please check the information.'));
    }
  });

  return { deleteMutation, bulkDeleteMutation, saveMutation };
}