'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import { VoucherForm } from '../components/VoucherForm';
import type { Voucher, VoucherFormData } from '@/hooks/useAdminVouchers';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default function EditVoucherPage({ params }: PageProps) {
  const { id } = React.use(params);
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const { data: voucher, isLoading, error } = useQuery({
    queryKey: ['admin-voucher', id],
    queryFn: async () => {
      const { data } = await api.get(`/vouchers/${id}`);
      return data.data as Voucher;
    },
    enabled: Boolean(id),
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: VoucherFormData) => api.patch(`/vouchers/${id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-voucher', id] });
      router.push('/admin/vouchers');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || (isVi ? 'Không thể cập nhật voucher' : 'Failed to update voucher');
      alert(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="admin-loading" style={{ minHeight: 320 }}>
        <Loader2 className="admin-loading__spinner animate-spin" />
        <p>{isVi ? 'Đang tải...' : 'Loading...'}</p>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="admin-alert">
        <h2 className="admin-alert__title">{isVi ? 'Không tìm thấy mã giảm giá' : 'Voucher Not Found'}</h2>
        <p className="admin-alert__text">
          {isVi ? 'Mã giảm giá này không tồn tại hoặc đã bị xoá.' : 'This voucher does not exist or has been deleted.'}
        </p>
        <Link href="/admin/vouchers" className="mt-4 px-5 py-2.5 rounded-xl border border-[var(--admin-border-subtle)] text-[#7A5C5C] hover:bg-[rgba(0,0,0,0.02)] transition inline-block">
          {isVi ? 'Quay lại danh sách' : 'Back to list'}
        </Link>
      </div>
    );
  }

  return (
    <VoucherForm
      initialData={voucher}
      onSubmit={(data) => updateMutation.mutate(data)}
      isPending={updateMutation.isPending}
    />
  );
}
