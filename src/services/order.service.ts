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
  return res.json();
}