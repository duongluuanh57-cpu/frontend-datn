'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface DashboardData {
  totalProducts: number;
  lowStockCount: number;
  visitsToday: number;
  isLoading: boolean;
  error: any;
}

export function useAdminDashboard(): DashboardData {
  const productQuery = useQuery({
    queryKey: ['admin-dashboard', 'product-count'],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: { page: 1, limit: 1 } });
      return (data.data as { total: number }).total;
    },
    staleTime: 30_000,
  });

  const lowStockQuery = useQuery({
    queryKey: ['admin-dashboard', 'low-stock-count'],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: { stock: 'lowStock', page: 1, limit: 1 } });
      return (data.data as { total: number }).total;
    },
    staleTime: 30_000,
  });

  const statsQuery = useQuery({
    queryKey: ['admin-dashboard', 'stats'],
    queryFn: async () => {
      const res = await api.get('/stats/dashboard');
      return (res.data.visitsToday ?? 0) as number;
    },
    staleTime: 30_000,
  });

  return {
    totalProducts: productQuery.data ?? 0,
    lowStockCount: lowStockQuery.data ?? 0,
    visitsToday: statsQuery.data ?? 0,
    isLoading: productQuery.isLoading || lowStockQuery.isLoading || statsQuery.isLoading,
    error: productQuery.error || lowStockQuery.error || statsQuery.error,
  };
}
