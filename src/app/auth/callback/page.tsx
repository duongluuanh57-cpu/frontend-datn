'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api, { getBackendOrigin } from '@/lib/api';
import { Loader2 } from 'lucide-react';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userRaw = searchParams.get('user');

    if (accessToken && refreshToken) {
      const processLogin = async () => {
        let redirectUrl = '/';
        try {
          // Ưu tiên dùng user data từ query string (được backend mã hóa sẵn)
          if (userRaw) {
            const userData = JSON.parse(decodeURIComponent(userRaw));
            const user = {
              id: userData.id,
              username: userData.username || '',
              email: userData.email || '',
              role: userData.role || 'USER',
              avatar: userData.avatar || '',
              tenantId: 'default',
              memberTier: 'MEMBER' as const,
            };
            setAuth(user, accessToken, refreshToken);
            // Admin/SubAdmin -> redirect ve Frontend Profile (de noi co nut 'Di den Dashboard')
            if (userData.role === 'ADMIN' || userData.role === 'SUBADMIN') {
              redirectUrl = '/profile';
            }
          } else {
            // Fallback: gọi /auth/me để lấy user
            localStorage.setItem('token', accessToken);
            const res = await api.get('/auth/me');
            if (res.data && (res.data as any).success) {
              const userData = (res.data as any).data;
              const user = {
                id: userData._id || userData.id,
                username: userData.username || '',
                email: userData.email || '',
                role: userData.role || 'USER',
                avatar: userData.avatar || '',
                tenantId: userData.tenantId || 'default',
                memberTier: userData.memberTier || 'MEMBER',
                createdAt: userData.createdAt || '',
              };
              setAuth(user, accessToken, refreshToken);
              // Admin/SubAdmin -> redirect ve Frontend Profile
              if (userData.role === 'ADMIN' || userData.role === 'SUBADMIN') {
                redirectUrl = '/profile';
              }
            }
          }
        } catch (err) {
          console.error('OAuth callback error:', err);
        } finally {
          router.replace(redirectUrl);
        }
      };
      processLogin();
    } else {
      // Không có token, redirect về home
      router.replace('/');
    }
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Đang đăng nhập...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Đang xử lý...</p>
          </div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
