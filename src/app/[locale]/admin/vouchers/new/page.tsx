'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from '@/navigation';
import { useLocale } from 'next-intl';
import { VoucherForm } from '../components/VoucherForm';
import type { VoucherFormData } from '@/hooks/useAdminVouchers';

export default function NewVoucherPage() {
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const createMutation = useMutation({
    mutationFn: async (formData: VoucherFormData) => api.post('/vouchers', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      router.push('/admin/vouchers');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || (isVi ? 'Không thể tạo voucher' : 'Failed to create voucher');
      alert(msg);
    },
  });

  return (
    <VoucherForm
      onSubmit={(data) => createMutation.mutate(data)}
      isPending={createMutation.isPending}
    />
  );
}
