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
<<<<<<< HEAD
  return res.json();
=======
  const json = await res.json();
  return json.data;
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
}