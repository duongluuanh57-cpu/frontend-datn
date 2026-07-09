'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api, { getBackendOrigin } from '@/lib/api';

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="bg-surface rounded-2xl shadow-sm ring-1 ring-black/5 p-8 text-center max-w-sm w-full">
        <div className="space-y-4 animate-pulse">
          <div className="w-14 h-14 rounded-full bg-text-muted/10 mx-auto" />
          <div className="h-6 w-40 bg-text-muted/10 rounded-lg mx-auto" />
          <div className="h-4 w-28 bg-text-muted/10 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="bg-surface rounded-2xl shadow-sm ring-1 ring-black/5 p-8 text-center max-w-sm w-full">
            <div className="space-y-4 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-text-muted/10 mx-auto" />
              <div className="h-6 w-40 bg-text-muted/10 rounded-lg mx-auto" />
              <div className="h-4 w-28 bg-text-muted/10 rounded mx-auto" />
            </div>
          </div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
