'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import { useOrderFilters } from '@/hooks/admin-orders/useOrderFilters';

export interface OrderItem {
  _id: string;
  productId: string;
  name: string;
  brand?: string;
  quantity: number;
  price: number;
  subTotal?: number;
  image?: string;
  productImage?: string;
  variants?: Array<{ size: string; price: number }>;
  taxonomy?: Array<{ taxonomySlug: string; taxonomyName: string; termName: string; termSlug: string }>;
}

export interface Order {
  _id: string;
  tenantId: string;
  userId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  totalAmount: number;
  voucherId?: any;
  discountAmount?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'bank_transfer' | 'credit_card' | 'momo' | 'zalopay';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  user?: {
    username: string;
    email: string;
    avatar?: string;
  };
}

export interface UseAdminOrdersReturn {
  locale: string;
  isVi: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedPaymentStatus: string;
  setSelectedPaymentStatus: (status: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  ITEMS_PER_PAGE: number;
  orders: Order[] | undefined;
  isLoading: boolean;
  error: any;
  total: number;
  totalPages: number;
  updateStatusMutation: any;
  updatePaymentStatusMutation: any;
  deleteMutation: any;
  handleUpdateStatus: (orderId: string, status: string) => void;
  handleUpdatePaymentStatus: (orderId: string, paymentStatus: string) => void;
  handleDeleteOrder: (orderId: string) => void;
}

export function useAdminOrders(): UseAdminOrdersReturn {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const filter = useOrderFilters();

  // Fetch orders with server-side pagination
  const { data: pageData, isLoading, error } = useQuery({
    queryKey: ['admin-orders', filter.queryParams],
    queryFn: async () => {
      const { data } = await api.get('/orders/admin/orders', { params: filter.queryParams });
      return data.data as { orders: Order[]; pagination: { total: number; totalPages: number } };
    },
    staleTime: 15_000,
  });

  const orders = pageData?.orders;
  const total = pageData?.pagination?.total || 0;
  const totalPages = pageData?.pagination?.totalPages || 0;

  // Mutation: Update order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      api.patch(`/orders/admin/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success(isVi ? 'Cập nhật trạng thái đơn hàng thành công!' : 'Order status updated successfully!');
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized') || err.response?.data?.message?.includes('đăng nhập');
      if (isAuth) {
        toast.error(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        toast.error(err.response?.data?.message || (isVi ? 'Không thể cập nhật trạng thái đơn hàng.' : 'Failed to update order status.'));
      }
    }
  });

  // Mutation: Update payment status
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: string; paymentStatus: string }) =>
      api.patch(`/orders/admin/${id}/payment-status`, { paymentStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success(isVi ? 'Cập nhật trạng thái thanh toán thành công!' : 'Payment status updated successfully!');
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized') || err.response?.data?.message?.includes('đăng nhập');
      if (isAuth) {
        toast.error(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        toast.error(err.response?.data?.message || (isVi ? 'Không thể cập nhật trạng thái thanh toán.' : 'Failed to update payment status.'));
      }
    }
  });

  // Mutation: Delete order
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/orders/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success(isVi ? 'Đã xóa đơn hàng thành công!' : 'Order deleted successfully!');
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized') || err.response?.data?.message?.includes('đăng nhập');
      if (isAuth) {
        toast.error(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        toast.error(err.response?.data?.message || (isVi ? 'Không thể xóa đơn hàng này.' : 'Failed to delete order.'));
      }
    }
  });

  const handleUpdateStatus = (orderId: string, status: string) => updateStatusMutation.mutate({ id: orderId, status });
  const handleUpdatePaymentStatus = (orderId: string, paymentStatus: string) => updatePaymentStatusMutation.mutate({ id: orderId, paymentStatus });
  const handleDeleteOrder = (orderId: string) => {
    if (confirm(isVi ? 'Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.' : 'Are you sure you want to delete this order? This action cannot be undone.')) {
      deleteMutation.mutate(orderId);
    }
  };

  return {
    locale, isVi,
    searchTerm: filter.searchTerm, setSearchTerm: filter.setSearchTerm,
    selectedStatus: filter.selectedStatus, setSelectedStatus: filter.setSelectedStatus,
    selectedPaymentStatus: filter.selectedPaymentStatus, setSelectedPaymentStatus: filter.setSelectedPaymentStatus,
    startDate: filter.startDate, setStartDate: filter.setStartDate,
    endDate: filter.endDate, setEndDate: filter.setEndDate,
    currentPage: filter.currentPage, setCurrentPage: filter.setCurrentPage,
    ITEMS_PER_PAGE: filter.ITEMS_PER_PAGE,
    orders, isLoading, error, total, totalPages,
    updateStatusMutation, updatePaymentStatusMutation, deleteMutation,
    handleUpdateStatus, handleUpdatePaymentStatus, handleDeleteOrder,
  };
}