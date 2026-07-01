'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface CartItem {
  _id?: string;
  productId: string;
  name: string;
  image?: string;
  brand?: string;
  price: number;
  quantity: number;
}

export interface CartData {
  _id?: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

/**
 * Hook quản lý giỏ hàng - đồng bộ với backend
 */
export function useCart() {
  const queryClient = useQueryClient();

  // Query: lấy giỏ hàng
  const cartQuery = useQuery<CartData>({
    queryKey: ['cart'],
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
    queryFn: async () => {
      const res = await api.get('/cart');
      if ((res.data as any)?.success) {
        return (res.data as any).data as CartData;
      }
      return { items: [], totalAmount: 0, totalItems: 0 };
    },
    staleTime: 60_000, // cache 60s — chỉ fetch lại khi mutation (thêm/xóa) gọi invalidate
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Mutation: thêm sản phẩm
  const addItemMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      const res = await api.post('/cart/add', { productId, quantity });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Mutation: cập nhật số lượng
  const updateItemMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const res = await api.patch('/cart/item', { productId, quantity });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Mutation: xóa 1 sản phẩm
  const removeItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.delete(`/cart/item/${productId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Mutation: xóa toàn bộ giỏ hàng
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete('/cart');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return {
    // Data
    cart: cartQuery.data ?? { items: [], totalAmount: 0, totalItems: 0 },
    items: cartQuery.data?.items ?? [],
    totalAmount: cartQuery.data?.totalAmount ?? 0,
    totalItems: cartQuery.data?.totalItems ?? 0,
    isLoading: cartQuery.isLoading,
    error: cartQuery.error,

    // Actions
    addItem: (productId: string, quantity?: number) => addItemMutation.mutateAsync({ productId, quantity }),
    updateQuantity: (productId: string, quantity: number) => updateItemMutation.mutateAsync({ productId, quantity }),
    removeItem: (productId: string) => removeItemMutation.mutateAsync(productId),
    clearCart: () => clearCartMutation.mutateAsync(),

    // Mutation states
    isAdding: addItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isRemoving: removeItemMutation.isPending,
    isClearing: clearCartMutation.isPending,
  };
}