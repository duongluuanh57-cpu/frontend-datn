import { getBackendOrigin } from '@/lib/api';

/**
 * GET /api/orders/my-orders — Lấy lịch sử đơn hàng của user
 */
export async function getMyOrders(token: string) {
  const origin = getBackendOrigin();
  const res = await fetch(`${origin.replace(/\/+$/, '')}/api/orders/my-orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to fetch orders' }));
    throw new Error(err.message || 'Failed to fetch orders');
  }
  const json = await res.json();
  return json.data;
}

/**
 * PATCH /api/orders/:id/cancel — Hủy đơn hàng (chỉ khi pending)
 */
export async function cancelOrder(token: string, orderId: string) {
  const origin = getBackendOrigin();
  const res = await fetch(`${origin.replace(/\/+$/, '')}/api/orders/${orderId}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không thể hủy đơn hàng');
  return json;
}
