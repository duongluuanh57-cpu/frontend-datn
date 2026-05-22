import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Product } from '@/types/admin';
import { toast } from 'sonner';

export function useProductDelete(
  isVi: boolean,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
) {
  const queryClient = useQueryClient();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/products/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(isVi ? 'Đã xóa sản phẩm thành công!' : 'Product deleted successfully!');
      setProductToDelete(null);
      setSelectedIds(prev => prev.filter(item => item !== id));
    },
    onError: (err: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(err.response?.data?.message || (isVi ? 'Không thể xóa sản phẩm' : 'Failed to delete product'));
      setProductToDelete(null);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => api.post('/products/bulk-delete', { ids }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(res.data.message || (isVi ? 'Đã xóa các sản phẩm thành công!' : 'Products deleted successfully!'));
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
    },
    onError: (err: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(err.response?.data?.message || (isVi ? 'Không thể xóa các sản phẩm' : 'Failed to delete products'));
      setShowBulkDeleteModal(false);
    }
  });

  return {
    productToDelete, setProductToDelete,
    showBulkDeleteModal, setShowBulkDeleteModal,
    deleteMutation, bulkDeleteMutation,
  };
}

export type UseProductDeleteReturn = ReturnType<typeof useProductDelete>;
