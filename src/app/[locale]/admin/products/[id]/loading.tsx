import { Loader2 } from 'lucide-react';

export default function EditProductLoading() {
  return (
    <div className="admin-loading" style={{ minHeight: 320 }}>
      <Loader2 className="admin-loading__spinner" />
      <p>Đang tải sản phẩm...</p>
    </div>
  );
}
