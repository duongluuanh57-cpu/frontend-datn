const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface VariantInfo {
  size: string;
  price: number;
  inStock: boolean;
  isDefault: boolean;
}

export interface CartItem {
  _id?: string;
  productId: string;
  name: string;
  image?: string;
  brand?: string;
  price: number;
  discount?: number;
  quantity: number;
  variantSize?: string;
  availableVariants?: VariantInfo[];
}

export interface VoucherInfo {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  minTier: string | null;
  discountAmount: number;
  endDate: string;
  remaining?: number;
}

export interface CartResponse {
  success: boolean;
  message?: string;
  data?: {
    _id?: string;
    items: CartItem[];
    totalAmount: number;
    totalItems: number;
    voucherCode?: string;
    voucherDiscount?: number;
  };
}

export interface VouchersResponse {
  success: boolean;
  message?: string;
  data?: VoucherInfo[];
}

export async function getCart(token: string): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/api/cart`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể lấy giỏ hàng');
  }

  return res.json();
}

export async function addToCart(token: string, productId: string, quantity: number = 1, variantSize?: string): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/api/cart/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity, variantSize }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể thêm vào giỏ hàng');
  }

  return res.json();
}

export async function updateCartItem(token: string, productId: string, quantity: number, variantSize?: string): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/api/cart/item`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity, variantSize }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể cập nhật giỏ hàng');
  }

  return res.json();
}

export async function updateCartItemVariant(token: string, productId: string, currentVariantSize: string | undefined, newVariantSize: string): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/api/cart/item/variant`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, currentVariantSize, newVariantSize }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể đổi biến thể');
  }

  return res.json();
}


export async function removeFromCart(token: string, productId: string, variantSize?: string): Promise<CartResponse> {
  const params = new URLSearchParams();
  if (variantSize) params.set('variantSize', variantSize);
  const qs = params.toString();
  const url = `${API_BASE}/api/cart/item/${productId}${qs ? '?' + qs : ''}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể xóa sản phẩm khỏi giỏ hàng');
  }

  return res.json();
}

export async function clearCart(token: string): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/api/cart`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể xóa giỏ hàng');
  }

  return res.json();
}

export async function getAvailableVouchers(token: string): Promise<VouchersResponse> {
  const res = await fetch(`${API_BASE}/api/cart/vouchers`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể lấy danh sách voucher');
  }
  return res.json();
}

export async function applyVoucher(token: string, code: string): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/api/cart/apply-voucher`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể áp dụng mã giảm giá');
  }
  return res.json();
}

export async function removeVoucher(token: string): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/api/cart/remove-voucher`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể hủy mã giảm giá');
  }
  return res.json();
}

export async function checkout(
  token: string,
  orderData: {
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    paymentMethod?: 'cod' | 'bank_transfer' | 'credit_card' | 'momo' | 'zalopay' | 'vnpay';
    shippingMethod?: 'standard' | 'express';
  }
): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/api/cart/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể tạo đơn hàng');
  }

  return res.json();
}