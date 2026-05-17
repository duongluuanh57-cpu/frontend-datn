'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ProductForm } from '@/components/admin/ProductForm';
import { Loader2 } from 'lucide-react';

function LoadingState() {
  return (
    <div className="admin-loading" style={{ minHeight: 320 }}>
      <Loader2 className="admin-loading__spinner" />
      <p>Đang tải sản phẩm...</p>
    </div>
  );
}

export function EditProductClient({ id }: { id: string }) {
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });

  if (isLoading) return <LoadingState />;

  if (error || !product) {
    return (
      <div className="admin-alert">
        <h2 className="admin-alert__title">Không tìm thấy sản phẩm</h2>
        <p className="admin-alert__text">Sản phẩm này không còn trong kho lưu trữ.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">


      <ProductForm key={product._id} initialData={product} productId={id} />
    </div>
  );
}
