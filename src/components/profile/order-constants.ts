export const statusLabel: Record<string, string> = {
  pending: 'CHỜ THANH TOÁN',
  processing: 'VẬN CHUYỂN',
  shipped: 'CHỜ GIAO HÀNG',
  delivered: 'HOÀN THÀNH',
  cancelled: 'ĐÃ HỦY',
};

export const statusTextColor: Record<string, string> = {
  pending: 'text-amber-600',
  processing: 'text-blue-600',
  shipped: 'text-purple-600',
  delivered: 'text-green-600',
  cancelled: 'text-red-500',
};

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}