'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api, { getBackendOrigin } from '@/lib/api';

export function TokenHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      const fetchUser = async () => {
        let redirectUrl = '/';
        try {
          // Save token to localStorage so api calls can use it
          localStorage.setItem('token', accessToken);

          const res = await api.get('/auth/me');
          if (res.data && (res.data as any).success) {
            const userData = (res.data as any).data;
            // Map MongoDB _id to id for the auth store
            const user = {
              id: userData._id || userData.id,
              username: userData.username || '',
              email: userData.email || '',
              role: userData.role || 'USER',
              avatar: userData.avatar || '',
              memberTier: userData.memberTier || 'MEMBER',
              totalSpent: userData.totalSpent ?? 0,
              fullName: userData.fullName || '',
              phoneNumber: userData.phoneNumber || '',
              gender: userData.gender || '',
              address: userData.address || '',
              province: userData.province || '',
              district: userData.district || '',
              status: userData.status || 'active',
              oauthProvider: userData.oauthProvider || undefined,
              defaultAddress: userData.defaultAddress || null,
              createdAt: userData.createdAt || '',
            };
            setAuth(user, accessToken, refreshToken);
            // Admin/SubAdmin -> redirect ve Frontend Profile
            if (userData.role === 'ADMIN' || userData.role === 'SUBADMIN') {
              redirectUrl = '/profile';
            }
          }
        } catch (err) {
          console.error('Failed to fetch user after login:', err);
        } finally {
          // Clean URL params without full page reload
          router.replace(redirectUrl);
        }
      };
      fetchUser();
    }
  }, [searchParams, router, setAuth]);

  return null;
}