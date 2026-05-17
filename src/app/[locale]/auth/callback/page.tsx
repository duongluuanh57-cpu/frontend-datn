'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Suspense } from 'react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userStr = searchParams.get('user');

    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setAuth(user, accessToken, refreshToken);
        toast.success('Đăng nhập Google thành công!');
        router.replace('/');
      } catch (error) {
        console.error('Lỗi phân giải thông tin user:', error);
        toast.error('Có lỗi xảy ra khi xử lý đăng nhập.');
        router.replace('/login');
      }
    } else {
      router.replace('/login');
    }
  }, [searchParams, setAuth, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F6F3]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#7A5C5C]" />
        <p className="text-sm font-medium text-[#7A5C5C]/60 uppercase tracking-widest">Đang xác thực tài khoản...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackHandler />
    </Suspense>
  );
}
