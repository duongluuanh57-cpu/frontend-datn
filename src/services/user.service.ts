import { getBackendOrigin } from '@/lib/api';

/**
 * GET /api/auth/me — Lấy thông tin người dùng đang đăng nhập
 */
export async function getMe(token: string) {
  const origin = getBackendOrigin();
  const res = await fetch(`${origin.replace(/\/+$/, '')}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to fetch profile' }));
    throw new Error(err.message || 'Failed to fetch profile');
  }
  const json = await res.json();
  return json.data;
}

/**
 * PATCH /api/auth/update-profile — Cập nhật thông tin cá nhân
 */
export async function updateProfile(token: string, data: Record<string, any>) {
  const origin = getBackendOrigin();
  const res = await fetch(`${origin.replace(/\/+$/, '')}/api/auth/update-profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to update profile' }));
    throw new Error(err.message || 'Failed to update profile');
  }
  return res.json();
}

/**
 * POST /api/auth/change-password — Đổi mật khẩu
 */
export async function changePassword(token: string, currentPassword: string, newPassword: string) {
  const origin = getBackendOrigin();
  const res = await fetch(`${origin.replace(/\/+$/, '')}/api/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to change password' }));
    throw new Error(err.message || 'Failed to change password');
  }
  return res.json();
}